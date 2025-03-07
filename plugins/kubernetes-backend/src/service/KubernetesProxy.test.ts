/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'buffer';
import { resolve as resolvePath } from 'path';
import { errorHandler, getVoidLogger } from '@backstage/backend-common';
import { setupRequestMockHandlers } from '@backstage/backend-test-utils';
import { NotFoundError } from '@backstage/errors';
import {
  AuthorizeResult,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { KubernetesRequestAuth } from '@backstage/plugin-kubernetes-common';
import { getMockReq, getMockRes } from '@jest-mock/express';
import express from 'express';
import Router from 'express-promise-router';
import { Server } from 'http';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import request from 'supertest';
import { AddressInfo, WebSocket, WebSocketServer } from 'ws';

import { LocalKubectlProxyClusterLocator } from '../cluster-locator/LocalKubectlProxyLocator';
import {
  AuthenticationStrategy,
  AnonymousStrategy,
  KubernetesCredential,
} from '../auth';
import { ClusterDetails, KubernetesClustersSupplier } from '../types/types';
import {
  APPLICATION_JSON,
  HEADER_KUBERNETES_AUTH,
  HEADER_KUBERNETES_CLUSTER,
  KubernetesProxy,
} from './KubernetesProxy';
import fetch from 'cross-fetch';

import type { Request } from 'express';

describe('KubernetesProxy', () => {
  let proxy: KubernetesProxy;
  let authStrategy: jest.Mocked<AuthenticationStrategy>;
  const worker = setupServer();
  const logger = getVoidLogger();

  const clusterSupplier: jest.Mocked<KubernetesClustersSupplier> = {
    getClusters: jest.fn<Promise<ClusterDetails[]>, []>(),
  };

  const permissionApi: jest.Mocked<PermissionEvaluator> = {
    authorize: jest.fn(),
    authorizeConditional: jest.fn(),
  };

  setupRequestMockHandlers(worker);

  const buildMockRequest = (clusterName: any, path: string): Request => {
    const req = getMockReq({
      params: {
        path,
      },
      headers: {
        'content-type': 'application/json',
        [HEADER_KUBERNETES_CLUSTER.toLowerCase()]: clusterName,
      },
      header: jest.fn((key: string) => {
        switch (key) {
          case 'Content-Type': {
            return APPLICATION_JSON;
          }
          case HEADER_KUBERNETES_CLUSTER: {
            return clusterName;
          }
          default: {
            return '';
          }
        }
      }),
    });

    return req;
  };

  const setupProxyPromise = ({
    proxyPath,
    requestPath,
    headers,
  }: {
    proxyPath: string;
    requestPath: string;
    headers?: Record<string, string>;
  }) => {
    const app = express().use(
      Router()
        .use(proxyPath, proxy.createRequestHandler({ permissionApi }))
        .use(errorHandler()),
    );

    const requestPromise = request(app).get(proxyPath + requestPath);

    if (headers) {
      for (const [headerName, headerValue] of Object.entries(headers)) {
        requestPromise.set(headerName, headerValue);
      }
    }

    // Let this request through so it reaches the express router above
    worker.use(rest.all(requestPromise.url, (req: any) => req.passthrough()));

    return requestPromise;
  };

  beforeEach(() => {
    jest.resetAllMocks();
    authStrategy = {
      getCredential: jest
        .fn<
          Promise<KubernetesCredential>,
          [ClusterDetails, KubernetesRequestAuth]
        >()
        .mockResolvedValue({ type: 'anonymous' }),
      validateCluster: jest.fn(),
    };
    proxy = new KubernetesProxy({ logger, clusterSupplier, authStrategy });
    permissionApi.authorize.mockResolvedValue([
      { result: AuthorizeResult.ALLOW },
    ]);
  });

  it('should return a ERROR_NOT_FOUND if no clusters are found', async () => {
    clusterSupplier.getClusters.mockResolvedValue([]);

    const req = buildMockRequest('test', 'api');
    const { res, next } = getMockRes();

    await expect(
      proxy.createRequestHandler({ permissionApi })(req, res, next),
    ).rejects.toThrow(NotFoundError);
  });

  it('should return a ERROR_NOT_FOUND if multi-cluster & no cluster selected', async () => {
    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'local',
        url: 'http:/localhost:8001',
        authMetadata: {},
        skipMetricsLookup: true,
      },
      {
        name: 'cluster1',
        url: 'https://localhost:9999',
        authMetadata: {},
      },
    ]);

    const req = buildMockRequest(undefined, 'api');
    const { res, next } = getMockRes();

    await expect(
      proxy.createRequestHandler({ permissionApi })(req, res, next),
    ).rejects.toThrow(NotFoundError);
  });

  it('should return a ERROR_NOT_FOUND if selected cluster not in config', async () => {
    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'cluster1',
        url: 'https://localhost:9999',
        authMetadata: {},
      },
    ]);

    const req = buildMockRequest('test', 'api');
    const { res, next } = getMockRes();

    await expect(
      proxy.createRequestHandler({ permissionApi })(req, res, next),
    ).rejects.toThrow(NotFoundError);
  });

  it('should pass the exact response from Kubernetes', async () => {
    const apiResponse = {
      kind: 'APIVersions',
      versions: ['v1'],
      serverAddressByClientCIDRs: [
        {
          clientCIDR: '0.0.0.0/0',
          serverAddress: '192.168.0.1:3333',
        },
      ],
    };

    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'cluster1',
        url: 'https://localhost:9999',
        authMetadata: {},
      },
    ]);

    worker.use(
      rest.get('https://localhost:9999/api', (_: any, res: any, ctx: any) =>
        res(ctx.status(299), ctx.json(apiResponse)),
      ),
    );

    const requestPromise = setupProxyPromise({
      proxyPath: '/mountpath',
      requestPath: '/api',
      headers: { [HEADER_KUBERNETES_CLUSTER]: 'cluster1' },
    });

    const response = await requestPromise;

    expect(response.status).toEqual(299);
    expect(response.body).toStrictEqual(apiResponse);
  });

  it('should pass the exact response from Kubernetes default cluster & no cluster selected in single cluster setup', async () => {
    const apiResponse = {
      kind: 'APIVersions',
      versions: ['v1'],
      serverAddressByClientCIDRs: [
        {
          clientCIDR: '0.0.0.0/0',
          serverAddress: '192.168.0.1:3333',
        },
      ],
    };

    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'cluster1',
        url: 'https://localhost:9999',
        authMetadata: {},
      },
    ]);

    worker.use(
      rest.get('https://localhost:9999/api', (_: any, res: any, ctx: any) =>
        res(ctx.status(299), ctx.json(apiResponse)),
      ),
    );

    const requestPromise = setupProxyPromise({
      proxyPath: '/mountpath',
      requestPath: '/api',
    });

    const response = await requestPromise;

    expect(response.status).toEqual(299);
    expect(response.body).toStrictEqual(apiResponse);
  });

  it('sets host header to support clusters behind name-based virtual hosts', async () => {
    worker.use(
      rest.get(
        'http://localhost:9999/api/v1/namespaces',
        (req: any, res: any, ctx: any) => {
          const host = req.headers.get('Host');
          return host === 'localhost:9999'
            ? res(ctx.status(200))
            : res.networkError(`Host '${host}' is not in the cert's altnames`);
        },
      ),
    );

    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'cluster1',
        url: 'http://localhost:9999',
        authMetadata: {},
      },
    ]);

    const requestPromise = setupProxyPromise({
      proxyPath: '/mountpath',
      requestPath: '/api/v1/namespaces',

      headers: { [HEADER_KUBERNETES_CLUSTER]: 'cluster1' },
    });

    const response = await requestPromise;

    expect(response.status).toEqual(200);
  });

  it('should default to using a strategy-provided bearer token as authorization headers to kubeapi when backstage-kubernetes-auth field is not provided', async () => {
    worker.use(
      rest.get(
        'https://localhost:9999/api/v1/namespaces',
        (req: any, res: any, ctx: any) => {
          if (!req.headers.get('Authorization')) {
            return res(ctx.status(401));
          }

          if (
            req.headers.get('Authorization') !==
            'Bearer strategy-provided-token'
          ) {
            return res(ctx.status(403));
          }

          return res(
            ctx.status(200),
            ctx.json({
              kind: 'NamespaceList',
              apiVersion: 'v1',
              items: [],
            }),
          );
        },
      ),
    );

    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'cluster1',
        url: 'https://localhost:9999',
        authMetadata: {},
      },
    ]);

    authStrategy.getCredential.mockResolvedValue({
      type: 'bearer token',
      token: 'strategy-provided-token',
    });

    const requestPromise = setupProxyPromise({
      proxyPath: '/mountpath',
      requestPath: '/api/v1/namespaces',

      headers: { [HEADER_KUBERNETES_CLUSTER]: 'cluster1' },
    });

    const response = await requestPromise;

    expect(response.status).toEqual(200);
  });

  it('should add an authStrategy-provided serviceAccountToken as authorization headers to kubeapi if one isnt provided in request and one isnt set up in cluster details', async () => {
    worker.use(
      rest.get('https://localhost:9999/api/v1/namespaces', (req, res, ctx) => {
        if (!req.headers.get('Authorization')) {
          return res(ctx.status(401));
        }

        if (req.headers.get('Authorization') !== 'Bearer my-token') {
          return res(ctx.status(403));
        }

        return res(
          ctx.status(200),
          ctx.json({
            kind: 'NamespaceList',
            apiVersion: 'v1',
            items: [],
          }),
        );
      }),
    );

    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'cluster1',
        url: 'https://localhost:9999',
        authMetadata: {},
      },
    ]);

    authStrategy.getCredential.mockResolvedValue({
      type: 'bearer token',
      token: 'my-token',
    });

    const requestPromise = setupProxyPromise({
      proxyPath: '/mountpath',
      requestPath: '/api/v1/namespaces',

      headers: { [HEADER_KUBERNETES_CLUSTER]: 'cluster1' },
    });

    const response = await requestPromise;

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({
      kind: 'NamespaceList',
      apiVersion: 'v1',
      items: [],
    });
  });

  it('should append the Backstage-Kubernetes-Auth field to the requests authorization header if one is provided', async () => {
    worker.use(
      rest.get('https://localhost:9999/api/v1/namespaces', (req, res, ctx) => {
        if (!req.headers.get('Authorization')) {
          return res(ctx.status(401));
        }

        if (req.headers.get('Authorization') !== 'tokenB') {
          return res(ctx.status(403));
        }

        return res(
          ctx.status(200),
          ctx.json({
            kind: 'NamespaceList',
            apiVersion: 'v1',
            items: [],
          }),
        );
      }),
    );

    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'cluster1',
        url: 'https://localhost:9999',
        authMetadata: {},
      },
    ]);

    authStrategy.getCredential.mockResolvedValue({
      type: 'bearer token',
      token: 'tokenA',
    });

    const requestPromise = setupProxyPromise({
      proxyPath: '/mountpath',
      requestPath: '/api/v1/namespaces',

      headers: {
        [HEADER_KUBERNETES_CLUSTER]: 'cluster1',
        [HEADER_KUBERNETES_AUTH]: 'tokenB',
      },
    });

    const response = await requestPromise;

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({
      kind: 'NamespaceList',
      apiVersion: 'v1',
      items: [],
    });
  });

  it('should not invoke authStrategy if Backstage-Kubernetes-Authorization field is provided', async () => {
    worker.use(
      rest.get('https://localhost:9999/api/v1/namespaces', (req, res, ctx) => {
        if (!req.headers.get('Authorization')) {
          return res(ctx.status(401));
        }

        if (req.headers.get('Authorization') !== 'tokenB') {
          return res(ctx.status(403));
        }

        return res(
          ctx.status(200),
          ctx.json({
            kind: 'NamespaceList',
            apiVersion: 'v1',
            items: [],
          }),
        );
      }),
    );

    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'cluster1',
        url: 'https://localhost:9999',
        authMetadata: {},
      },
    ]);

    const requestPromise = setupProxyPromise({
      proxyPath: '/mountpath',
      requestPath: '/api/v1/namespaces',

      headers: {
        [HEADER_KUBERNETES_CLUSTER]: 'cluster1',
        [HEADER_KUBERNETES_AUTH]: 'tokenB',
      },
    });

    const response = await requestPromise;

    expect(authStrategy.getCredential).toHaveBeenCalledTimes(0);
    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({
      kind: 'NamespaceList',
      apiVersion: 'v1',
      items: [],
    });
  });

  it('returns a response with a localKubectlProxy auth provider configuration', async () => {
    proxy = new KubernetesProxy({
      logger: getVoidLogger(),
      clusterSupplier: new LocalKubectlProxyClusterLocator(),
      authStrategy: new AnonymousStrategy(),
    });

    worker.use(
      rest.get('http://localhost:8001/api/v1/namespaces', (req, res, ctx) => {
        return req.headers.get('Authorization')
          ? res(ctx.status(401))
          : res(
              ctx.status(200),
              ctx.json({
                kind: 'NamespaceList',
                apiVersion: 'v1',
                items: [],
              }),
            );
      }),
    );

    const requestPromise = setupProxyPromise({
      proxyPath: '/mountpath',
      requestPath: '/api/v1/namespaces',

      headers: {
        [HEADER_KUBERNETES_CLUSTER]: 'local',
      },
    });

    const response = await requestPromise;

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({
      kind: 'NamespaceList',
      apiVersion: 'v1',
      items: [],
    });
  });

  it('returns a 500 error if authStrategy errors out and Backstage-Kubernetes-Authorization field is not provided', async () => {
    worker.use(
      rest.get('https://localhost:9999/api/v1/namespaces', (req, res, ctx) => {
        if (!req.headers.get('Authorization')) {
          return res(ctx.status(401));
        }

        if (req.headers.get('Authorization') !== 'tokenB') {
          return res(ctx.status(403));
        }

        return res(
          ctx.status(200),
          ctx.json({
            kind: 'NamespaceList',
            apiVersion: 'v1',
            items: [],
          }),
        );
      }),
    );

    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'cluster1',
        url: 'https://localhost:9999',
        authMetadata: {},
      },
    ]);

    authStrategy.getCredential.mockRejectedValue(Error('some internal error'));

    const requestPromise = setupProxyPromise({
      proxyPath: '/mountpath',
      requestPath: '/api/v1/namespaces',

      headers: {
        [HEADER_KUBERNETES_CLUSTER]: 'cluster1',
      },
    });

    const response = await requestPromise;

    expect(response.status).toEqual(500);
  });

  it('should get res through proxy with cluster url has sub path', async () => {
    worker.use(
      rest.get(
        'http://localhost:9999/subpath/api/v1/namespaces',
        (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              kind: 'NamespaceList',
              apiVersion: 'v1',
              items: [],
            }),
          );
        },
      ),
    );

    clusterSupplier.getClusters.mockResolvedValue([
      {
        name: 'cluster1',
        url: 'http://localhost:9999/subpath',
        authMetadata: {},
      },
    ]);

    const requestPromise = setupProxyPromise({
      proxyPath: '/mountpath',
      requestPath: '/api/v1/namespaces',

      headers: {
        [HEADER_KUBERNETES_CLUSTER]: 'cluster1',
      },
    });

    const response = await requestPromise;

    expect(response.status).toEqual(200);
  });

  describe('when server uses TLS', () => {
    let httpsRequest: jest.SpyInstance;
    beforeAll(() => {
      httpsRequest = jest.spyOn(
        // this is pretty egregious reverse engineering of msw.
        // If the SetupServerApi constructor was exported, we wouldn't need
        // to be quite so hacky here
        (worker as any).interceptor.interceptors[0].modules.get('https'),
        'request',
      );
    });
    beforeEach(() => {
      httpsRequest.mockClear();
    });
    describe('should pass the exact response from Kubernetes using the CA file', () => {
      it('should trust contents of specified caFile', async () => {
        const apiResponse = {
          kind: 'APIVersions',
          versions: ['v1'],
          serverAddressByClientCIDRs: [
            {
              clientCIDR: '0.0.0.0/0',
              serverAddress: '192.168.0.1:3333',
            },
          ],
        };

        clusterSupplier.getClusters.mockResolvedValue([
          {
            name: 'cluster1',
            url: 'https://localhost:9999',
            authMetadata: {},
            caFile: resolvePath(__dirname, '__fixtures__/mock-ca.crt'),
          },
        ] as ClusterDetails[]);

        worker.use(
          rest.get('https://localhost:9999/api', (_: any, res: any, ctx: any) =>
            res(ctx.status(299), ctx.json(apiResponse)),
          ),
        );

        const requestPromise = setupProxyPromise({
          proxyPath: '/mountpath',
          requestPath: '/api',
          headers: { [HEADER_KUBERNETES_CLUSTER]: 'cluster1' },
        });

        const response = await requestPromise;

        expect(response.status).toEqual(299);
        expect(response.body).toStrictEqual(apiResponse);

        expect(httpsRequest).toHaveBeenCalledTimes(1);
        const [[{ ca }]] = httpsRequest.mock.calls;
        expect(ca).toMatch('MOCKCA');
      });
    });
  });

  describe('WebSocket', () => {
    const proxyPath = '/proxy';
    const wsPath = '/ws';

    let wsPort: number;
    let proxyPort: number;
    let wsEchoServer: WebSocketServer;
    let expressServer: Server;

    const eventPromiseFactory = (
      ws: WebSocket,
      event: 'connection' | 'open' | 'close' | 'error' | 'message',
    ) => new Promise(resolve => ws.once(event, x => resolve(x?.toString())));

    beforeEach(async () => {
      await new Promise(resolve => {
        expressServer = express()
          .use(
            Router()
              .use(proxyPath, proxy.createRequestHandler({ permissionApi }))
              .use(errorHandler()),
          )
          .listen(0, '0.0.0.0', () => {
            proxyPort = (expressServer.address() as AddressInfo).port;
            resolve(null);
          });
      });

      wsEchoServer = new WebSocketServer({
        port: 0,
        path: wsPath,
      });
      wsPort = (wsEchoServer.address() as AddressInfo).port;

      wsEchoServer.on('connection', (ws: WebSocket) => {
        ws.send('connected');

        ws.on('message', (message: string) => {
          ws.send(message);
        });
      });

      wsEchoServer.on('error', console.error);
    });

    afterEach(() => {
      wsEchoServer.close();
      expressServer.close();
    });

    it('should proxy websocket connections', async () => {
      clusterSupplier.getClusters.mockResolvedValue([
        {
          name: 'local',
          url: `http://localhost:${wsPort}`,
          authMetadata: {},
        },
      ]);

      const wsProxyAddress = `ws://127.0.0.1:${proxyPort}${proxyPath}${wsPath}`;
      const wsAddress = `ws://localhost:${wsPort}${wsPath}`;
      console.log('Ports: ', wsProxyAddress, wsAddress);

      // Let this request through so it reaches the express router above
      worker.use(
        rest.all(wsAddress.replace('ws', 'http'), (req: any) =>
          req.passthrough(),
        ),
        rest.all(wsProxyAddress.replace('ws', 'http'), (req: any) =>
          req.passthrough(),
        ),
      );

      // Prepopulate the proxy so the WebSocket upgrade can happen, result doesn't actually matter
      const result = await fetch(wsProxyAddress.replace('ws', 'http'));
      expect(result.ok).toBeFalsy();

      const webSocket = new WebSocket(wsProxyAddress);

      const connectMessagePromise = eventPromiseFactory(webSocket, 'message');

      await eventPromiseFactory(webSocket, 'open');

      const connectMessage = await connectMessagePromise;
      expect(connectMessage).toBe('connected');

      const echoMessagePromise = eventPromiseFactory(webSocket, 'message');
      webSocket.send('echo');

      const echoMessage = await echoMessagePromise;
      expect(echoMessage).toBe('echo');

      const closePromise = eventPromiseFactory(webSocket, 'close');
      webSocket.close();
      await closePromise;
    });
  });
});
