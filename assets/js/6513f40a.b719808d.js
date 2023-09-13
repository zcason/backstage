/*! For license information please see 6513f40a.b719808d.js.LICENSE.txt */
"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[32030],{100919:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>a,contentTitle:()=>c,default:()=>f,frontMatter:()=>l,metadata:()=>u,toc:()=>i});var r=n(824246),o=n(511151);const l={id:"plugin-splunk-on-call.splunkoncallclient.getteams",title:"SplunkOnCallClient.getTeams()",description:"API reference for SplunkOnCallClient.getTeams()"},c=void 0,u={unversionedId:"reference/plugin-splunk-on-call.splunkoncallclient.getteams",id:"reference/plugin-splunk-on-call.splunkoncallclient.getteams",title:"SplunkOnCallClient.getTeams()",description:"API reference for SplunkOnCallClient.getTeams()",source:"@site/../docs/reference/plugin-splunk-on-call.splunkoncallclient.getteams.md",sourceDirName:"reference",slug:"/reference/plugin-splunk-on-call.splunkoncallclient.getteams",permalink:"/docs/reference/plugin-splunk-on-call.splunkoncallclient.getteams",draft:!1,unlisted:!1,editUrl:"https://github.com/backstage/backstage/edit/master/docs/../docs/reference/plugin-splunk-on-call.splunkoncallclient.getteams.md",tags:[],version:"current",frontMatter:{id:"plugin-splunk-on-call.splunkoncallclient.getteams",title:"SplunkOnCallClient.getTeams()",description:"API reference for SplunkOnCallClient.getTeams()"}},a={},i=[];function s(e){const t=Object.assign({p:"p",a:"a",code:"code",strong:"strong",pre:"pre"},(0,o.ah)(),e.components);return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.a,{href:"/docs/reference/",children:"Home"})," > ",(0,r.jsx)(t.a,{href:"/docs/reference/plugin-splunk-on-call",children:(0,r.jsx)(t.code,{children:"@backstage/plugin-splunk-on-call"})})," > ",(0,r.jsx)(t.a,{href:"/docs/reference/plugin-splunk-on-call.splunkoncallclient",children:(0,r.jsx)(t.code,{children:"SplunkOnCallClient"})})," > ",(0,r.jsx)(t.a,{href:"/docs/reference/plugin-splunk-on-call.splunkoncallclient.getteams",children:(0,r.jsx)(t.code,{children:"getTeams"})})]}),"\n",(0,r.jsx)(t.p,{children:(0,r.jsx)(t.strong,{children:"Signature:"})}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-typescript",children:"getTeams(): Promise<Team[]>;\n"})}),"\n",(0,r.jsx)(t.p,{children:(0,r.jsx)(t.strong,{children:"Returns:"})}),"\n",(0,r.jsxs)(t.p,{children:["Promise<",(0,r.jsx)(t.a,{href:"/docs/reference/plugin-splunk-on-call.team",children:"Team"}),"[]>"]})]})}const f=function(e={}){const{wrapper:t}=Object.assign({},(0,o.ah)(),e.components);return t?(0,r.jsx)(t,Object.assign({},e,{children:(0,r.jsx)(s,e)})):s(e)}},862525:e=>{var t=Object.getOwnPropertySymbols,n=Object.prototype.hasOwnProperty,r=Object.prototype.propertyIsEnumerable;e.exports=function(){try{if(!Object.assign)return!1;var e=new String("abc");if(e[5]="de","5"===Object.getOwnPropertyNames(e)[0])return!1;for(var t={},n=0;n<10;n++)t["_"+String.fromCharCode(n)]=n;if("0123456789"!==Object.getOwnPropertyNames(t).map((function(e){return t[e]})).join(""))return!1;var r={};return"abcdefghijklmnopqrst".split("").forEach((function(e){r[e]=e})),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},r)).join("")}catch(o){return!1}}()?Object.assign:function(e,o){for(var l,c,u=function(e){if(null==e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}(e),a=1;a<arguments.length;a++){for(var i in l=Object(arguments[a]))n.call(l,i)&&(u[i]=l[i]);if(t){c=t(l);for(var s=0;s<c.length;s++)r.call(l,c[s])&&(u[c[s]]=l[c[s]])}}return u}},371426:(e,t,n)=>{n(862525);var r=n(827378),o=60103;if(t.Fragment=60107,"function"==typeof Symbol&&Symbol.for){var l=Symbol.for;o=l("react.element"),t.Fragment=l("react.fragment")}var c=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,u=Object.prototype.hasOwnProperty,a={key:!0,ref:!0,__self:!0,__source:!0};function i(e,t,n){var r,l={},i=null,s=null;for(r in void 0!==n&&(i=""+n),void 0!==t.key&&(i=""+t.key),void 0!==t.ref&&(s=t.ref),t)u.call(t,r)&&!a.hasOwnProperty(r)&&(l[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps)void 0===l[r]&&(l[r]=t[r]);return{$$typeof:o,type:e,key:i,ref:s,props:l,_owner:c.current}}t.jsx=i,t.jsxs=i},541535:(e,t,n)=>{var r=n(862525),o=60103,l=60106;t.Fragment=60107,t.StrictMode=60108,t.Profiler=60114;var c=60109,u=60110,a=60112;t.Suspense=60113;var i=60115,s=60116;if("function"==typeof Symbol&&Symbol.for){var f=Symbol.for;o=f("react.element"),l=f("react.portal"),t.Fragment=f("react.fragment"),t.StrictMode=f("react.strict_mode"),t.Profiler=f("react.profiler"),c=f("react.provider"),u=f("react.context"),a=f("react.forward_ref"),t.Suspense=f("react.suspense"),i=f("react.memo"),s=f("react.lazy")}var p="function"==typeof Symbol&&Symbol.iterator;function d(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var y={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},h={};function m(e,t,n){this.props=e,this.context=t,this.refs=h,this.updater=n||y}function g(){}function v(e,t,n){this.props=e,this.context=t,this.refs=h,this.updater=n||y}m.prototype.isReactComponent={},m.prototype.setState=function(e,t){if("object"!=typeof e&&"function"!=typeof e&&null!=e)throw Error(d(85));this.updater.enqueueSetState(this,e,t,"setState")},m.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")},g.prototype=m.prototype;var k=v.prototype=new g;k.constructor=v,r(k,m.prototype),k.isPureReactComponent=!0;var _={current:null},b=Object.prototype.hasOwnProperty,j={key:!0,ref:!0,__self:!0,__source:!0};function O(e,t,n){var r,l={},c=null,u=null;if(null!=t)for(r in void 0!==t.ref&&(u=t.ref),void 0!==t.key&&(c=""+t.key),t)b.call(t,r)&&!j.hasOwnProperty(r)&&(l[r]=t[r]);var a=arguments.length-2;if(1===a)l.children=n;else if(1<a){for(var i=Array(a),s=0;s<a;s++)i[s]=arguments[s+2];l.children=i}if(e&&e.defaultProps)for(r in a=e.defaultProps)void 0===l[r]&&(l[r]=a[r]);return{$$typeof:o,type:e,key:c,ref:u,props:l,_owner:_.current}}function C(e){return"object"==typeof e&&null!==e&&e.$$typeof===o}var S=/\/+/g;function w(e,t){return"object"==typeof e&&null!==e&&null!=e.key?function(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,(function(e){return t[e]}))}(""+e.key):t.toString(36)}function x(e,t,n,r,c){var u=typeof e;"undefined"!==u&&"boolean"!==u||(e=null);var a=!1;if(null===e)a=!0;else switch(u){case"string":case"number":a=!0;break;case"object":switch(e.$$typeof){case o:case l:a=!0}}if(a)return c=c(a=e),e=""===r?"."+w(a,0):r,Array.isArray(c)?(n="",null!=e&&(n=e.replace(S,"$&/")+"/"),x(c,t,n,"",(function(e){return e}))):null!=c&&(C(c)&&(c=function(e,t){return{$$typeof:o,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}(c,n+(!c.key||a&&a.key===c.key?"":(""+c.key).replace(S,"$&/")+"/")+e)),t.push(c)),1;if(a=0,r=""===r?".":r+":",Array.isArray(e))for(var i=0;i<e.length;i++){var s=r+w(u=e[i],i);a+=x(u,t,n,s,c)}else if(s=function(e){return null===e||"object"!=typeof e?null:"function"==typeof(e=p&&e[p]||e["@@iterator"])?e:null}(e),"function"==typeof s)for(e=s.call(e),i=0;!(u=e.next()).done;)a+=x(u=u.value,t,n,s=r+w(u,i++),c);else if("object"===u)throw t=""+e,Error(d(31,"[object Object]"===t?"object with keys {"+Object.keys(e).join(", ")+"}":t));return a}function E(e,t,n){if(null==e)return e;var r=[],o=0;return x(e,r,"","",(function(e){return t.call(n,e,o++)})),r}function P(e){if(-1===e._status){var t=e._result;t=t(),e._status=0,e._result=t,t.then((function(t){0===e._status&&(t=t.default,e._status=1,e._result=t)}),(function(t){0===e._status&&(e._status=2,e._result=t)}))}if(1===e._status)return e._result;throw e._result}var R={current:null};function $(){var e=R.current;if(null===e)throw Error(d(321));return e}var T={ReactCurrentDispatcher:R,ReactCurrentBatchConfig:{transition:0},ReactCurrentOwner:_,IsSomeRendererActing:{current:!1},assign:r};t.Children={map:E,forEach:function(e,t,n){E(e,(function(){t.apply(this,arguments)}),n)},count:function(e){var t=0;return E(e,(function(){t++})),t},toArray:function(e){return E(e,(function(e){return e}))||[]},only:function(e){if(!C(e))throw Error(d(143));return e}},t.Component=m,t.PureComponent=v,t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=T,t.cloneElement=function(e,t,n){if(null==e)throw Error(d(267,e));var l=r({},e.props),c=e.key,u=e.ref,a=e._owner;if(null!=t){if(void 0!==t.ref&&(u=t.ref,a=_.current),void 0!==t.key&&(c=""+t.key),e.type&&e.type.defaultProps)var i=e.type.defaultProps;for(s in t)b.call(t,s)&&!j.hasOwnProperty(s)&&(l[s]=void 0===t[s]&&void 0!==i?i[s]:t[s])}var s=arguments.length-2;if(1===s)l.children=n;else if(1<s){i=Array(s);for(var f=0;f<s;f++)i[f]=arguments[f+2];l.children=i}return{$$typeof:o,type:e.type,key:c,ref:u,props:l,_owner:a}},t.createContext=function(e,t){return void 0===t&&(t=null),(e={$$typeof:u,_calculateChangedBits:t,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null}).Provider={$$typeof:c,_context:e},e.Consumer=e},t.createElement=O,t.createFactory=function(e){var t=O.bind(null,e);return t.type=e,t},t.createRef=function(){return{current:null}},t.forwardRef=function(e){return{$$typeof:a,render:e}},t.isValidElement=C,t.lazy=function(e){return{$$typeof:s,_payload:{_status:-1,_result:e},_init:P}},t.memo=function(e,t){return{$$typeof:i,type:e,compare:void 0===t?null:t}},t.useCallback=function(e,t){return $().useCallback(e,t)},t.useContext=function(e,t){return $().useContext(e,t)},t.useDebugValue=function(){},t.useEffect=function(e,t){return $().useEffect(e,t)},t.useImperativeHandle=function(e,t,n){return $().useImperativeHandle(e,t,n)},t.useLayoutEffect=function(e,t){return $().useLayoutEffect(e,t)},t.useMemo=function(e,t){return $().useMemo(e,t)},t.useReducer=function(e,t,n){return $().useReducer(e,t,n)},t.useRef=function(e){return $().useRef(e)},t.useState=function(e){return $().useState(e)},t.version="17.0.2"},827378:(e,t,n)=>{e.exports=n(541535)},824246:(e,t,n)=>{e.exports=n(371426)},511151:(e,t,n)=>{n.d(t,{Zo:()=>u,ah:()=>l});var r=n(667294);const o=r.createContext({});function l(e){const t=r.useContext(o);return r.useMemo((()=>"function"==typeof e?e(t):{...t,...e}),[t,e])}const c={};function u({components:e,children:t,disableParentContext:n}){let u;return u=n?"function"==typeof e?e({}):e||c:l(e),r.createElement(o.Provider,{value:u},t)}}}]);