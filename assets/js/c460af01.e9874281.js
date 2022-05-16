"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[790],{3905:function(e,r,n){n.d(r,{Zo:function(){return d},kt:function(){return p}});var t=n(7294);function a(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function o(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function i(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?o(Object(n),!0).forEach((function(r){a(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function l(e,r){if(null==e)return{};var n,t,a=function(e,r){if(null==e)return{};var n,t,a={},o=Object.keys(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||(a[n]=e[n]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=t.createContext({}),s=function(e){var r=t.useContext(c),n=r;return e&&(n="function"==typeof e?e(r):i(i({},r),e)),n},d=function(e){var r=s(e.components);return t.createElement(c.Provider,{value:r},e.children)},u={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},h=t.forwardRef((function(e,r){var n=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),h=s(n),p=a,m=h["".concat(c,".").concat(p)]||h[p]||u[p]||o;return n?t.createElement(m,i(i({ref:r},d),{},{components:n})):t.createElement(m,i({ref:r},d))}));function p(e,r){var n=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=h;var l={};for(var c in r)hasOwnProperty.call(r,c)&&(l[c]=r[c]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var s=2;s<o;s++)i[s]=n[s];return t.createElement.apply(null,i)}return t.createElement.apply(null,n)}h.displayName="MDXCreateElement"},9344:function(e,r,n){n.r(r),n.d(r,{assets:function(){return d},contentTitle:function(){return c},default:function(){return p},frontMatter:function(){return l},metadata:function(){return s},toc:function(){return u}});var t=n(7462),a=n(3366),o=(n(7294),n(3905)),i=["components"],l={title:"Error handling"},c=void 0,s={unversionedId:"wiki/error-handling",id:"wiki/error-handling",title:"Error handling",description:"Simple handler",source:"@site/docs/wiki/error-handling.md",sourceDirName:"wiki",slug:"/wiki/error-handling",permalink:"/docs/wiki/error-handling",draft:!1,tags:[],version:"current",frontMatter:{title:"Error handling"},sidebar:"wikiSidebar",previous:{title:"Metadata",permalink:"/docs/wiki/metadata"},next:{title:"Caching",permalink:"/docs/wiki/caching"}},d={},u=[{value:"Simple handler",id:"simple-handler",level:2},{value:"Advanced handler",id:"advanced-handler",level:2}],h={toc:u};function p(e){var r=e.components,n=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,t.Z)({},h,n,{components:r,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"simple-handler"},"Simple handler"),(0,o.kt)("p",null,"Basic error handling can be solved with a custom simple middleware, thanks to existing ",(0,o.kt)("inlineCode",{parentName:"p"},"next")," cascading mechanism:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"app.use(async (call, next) => {\n  try {\n    await next()\n  } catch (error) {\n    console.error(error)\n    throw error\n  }\n})\n")),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"next")," call contains a complete call stack from the following middlewares/handlers only, that is why it is recommended to use your error-handling middleware as one of the firsts."),(0,o.kt)("h2",{id:"advanced-handler"},"Advanced handler"),(0,o.kt)("p",null,'The simple handler is a perfectly valid option for the synchronous (or asynchronous, "linear") code: like unary calls. In that scenario, you don\'t need more than that. When working with streams however, the situation is more complicated. When an error is emitted on a stream, it "cannot" be caught and re-thrown, since there could be several listeners on the emitter, which are already responding to that event.'),(0,o.kt)("p",null,"There is an ",(0,o.kt)("inlineCode",{parentName:"p"},"onError")," middleware creator, that can intercept all errors including the stream errors. It can be used not only to log the errors (and pass them on), but also to consume the errors (and not propagate them to the client), rethrow them, or change them."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { onError } from 'protocat'\n\napp.use(\n  onError((e, call) => {\n    // Set metadata\n    call.initialMetadata.set('error-code', e.code)\n    call.trailingMetadata.set('error-code', e.code)\n\n    // Consume the error\n    if (notThatBad(e)) {\n      if (call.type === CallType.ServerStream || call.type === CallType.Bidi) {\n        // sync error not re-thrown on stream response, should end\n        call.end()\n      }\n      return\n    }\n\n    // Throw an error\n    if (!expected(e)) {\n      e.message = 'Server error'\n    }\n    throw e\n  })\n)\n")),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"The handler is called with error and current call for all errors (rejects from handlers, error emits from streams), meaning there can be theoretically more errors per request (multiple emitted errors) and some of them can be handled even after the execution of the next chain (error emits)."),(0,o.kt)("li",{parentName:"ul"},"Provided function can be sync on async. It can throw (or return rejected promise), but any other return value is ignored"),(0,o.kt)("li",{parentName:"ul"},"Both initial and trailing metadata are available for change (unless you sent them manually)"),(0,o.kt)("li",{parentName:"ul"},'In order to achieve "re-throwing", ',(0,o.kt)("inlineCode",{parentName:"li"},"emit")," function on call is patched by ",(0,o.kt)("inlineCode",{parentName:"li"},"onError"),". When calling ",(0,o.kt)("inlineCode",{parentName:"li"},"call.emit('error', e)"),', the error is actually emitted in the stream only when the handler throws a new error. This means that when you emit an error in the middleware and consume it in the handler, streams are left "hanging", not errored and likely not even ended. If you truly wish to not propagate the error to client, it is recommended to end the streams in the handler. (This is not performed automatically, since there is no guarantee there should be no more than one error)')))}p.isMDXComponent=!0}}]);