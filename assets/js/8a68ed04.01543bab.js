(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[426],{3905:function(e,t,a){"use strict";a.d(t,{Zo:function(){return h},kt:function(){return p}});var n=a(7294);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function c(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var s=n.createContext({}),l=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},h=function(e){var t=l(e.components);return n.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,h=c(e,["components","mdxType","originalType","parentName"]),u=l(a),p=i,m=u["".concat(s,".").concat(p)]||u[p]||d[p]||r;return a?n.createElement(m,o(o({ref:t},h),{},{components:a})):n.createElement(m,o({ref:t},h))}));function p(e,t){var a=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=a.length,o=new Array(r);o[0]=u;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:i,o[1]=c;for(var l=2;l<r;l++)o[l]=a[l];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},439:function(e,t,a){"use strict";a.r(t),a.d(t,{frontMatter:function(){return o},metadata:function(){return c},toc:function(){return s},default:function(){return h}});var n=a(2122),i=a(9756),r=(a(7294),a(3905)),o={title:"Caching"},c={unversionedId:"wiki/caching",id:"wiki/caching",isDocsHomePage:!1,title:"Caching",description:"Either by lack of existing solutions for gRPC caching or by need for a non-trivial logic you might require to use an application cache for your responses.",source:"@site/docs/wiki/caching.md",sourceDirName:"wiki",slug:"/wiki/caching",permalink:"/docs/wiki/caching",version:"current",frontMatter:{title:"Caching"},sidebar:"wikiSidebar",previous:{title:"Error handling",permalink:"/docs/wiki/error-handling"},next:{title:"Client",permalink:"/docs/wiki/client"}},s=[{value:"Basic middleware cache",id:"basic-middleware-cache",children:[]},{value:"Cache middleware",id:"cache-middleware",children:[{value:"Cache storage",id:"cache-storage",children:[]},{value:"Different caching settings",id:"different-caching-settings",children:[]},{value:"TTL and cache purging",id:"ttl-and-cache-purging",children:[]}]},{value:"Under the hood",id:"under-the-hood",children:[]},{value:"Caching other gRPC call types",id:"caching-other-grpc-call-types",children:[]}],l={toc:s};function h(e){var t=e.components,a=(0,i.Z)(e,["components"]);return(0,r.kt)("wrapper",(0,n.Z)({},l,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Either by lack of existing solutions for gRPC caching or by need for a non-trivial logic you might require to use an application cache for your responses."),(0,r.kt)("h2",{id:"basic-middleware-cache"},"Basic middleware cache"),(0,r.kt)("p",null,"Without any extra support, with a bit of effort you can implement middleware level caching just with existing middleware interface and its ",(0,r.kt)("inlineCode",{parentName:"p"},"next")," function, allowing you to skip the following handlers."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"app.use(async (call, next) => {\n  const key = getCacheKey(call)\n  const cachedResponse = await cacheGet(key)\n  if (cachedResponse) {\n    call.response = cachedToProto(cachedResponse)\n    // skip following handlers, we have response from cache\n    return\n  }\n  // cache miss, execute handlers\n  await next()\n  // save result for subsequent requests\n  setCacheKey(protoToCached(call.response), TTL)\n})\n")),(0,r.kt)("p",null,"This simple middleware is a good start: we effectively skip the handlers, can manage TTL and can combine with any custom logic for the matching. For example we can hook the cache middleware after authentication middleware and create per-user cache with prepared data about user from the call."),(0,r.kt)("p",null,"Assume we have other than in-memory cache and we need to serialize the instances into some form and back. That is why there are ",(0,r.kt)("inlineCode",{parentName:"p"},"cachedToProto")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"protoToCached"),' functions. This is the troublesome part: doing this serialization generically might be challenging (and could be potentially solvable only via custom solution for each RPC/message) and it might not be "cheap" (cache hits should be blistering fast and not perform double encoding ',(0,r.kt)("inlineCode",{parentName:"p"},"cache-to-proto")," by you and ",(0,r.kt)("inlineCode",{parentName:"p"},"proto-to-wire")," by gRPC)."),(0,r.kt)("p",null,"That's why ProtoCat has a mechanism to remove both of the problems: generic approach for all RPCs without mapping functions and avoid double encoding."),(0,r.kt)("h2",{id:"cache-middleware"},"Cache middleware"),(0,r.kt)("p",null,"If you don't care too much about the details, you can just use"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { createCache, CacheImplementation } from 'protocat'\n\nconst cache: CacheImplementation = {\n  set: (key, value, call) => {\n    await someStorage.set(key, value) // MUST SET BUFFER\n  },\n  get: (key, call) => someStorage.get(key), // MUST RETURN BUFFER\n  hash: call =>\n    `${call.path}::${call.user?.id ?? ''}::${call.request.toArray().join('-')}`,\n}\napp.use(\n  createCache(cache, (call, hit, hash) => {\n    call.initialMetadata.set('cache', hit ? 'hit' : 'miss')\n    call.initialMetadata.set('cache-key', hash)\n  })\n)\n")),(0,r.kt)("h3",{id:"cache-storage"},"Cache storage"),(0,r.kt)("p",null,"It does not matter what implementation you have, any sync/async key-value storage that can handle buffers is fine."),(0,r.kt)("div",{className:"admonition admonition-danger alert alert--danger"},(0,r.kt)("div",{parentName:"div",className:"admonition-heading"},(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,r.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"},(0,r.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"}))),"danger")),(0,r.kt)("div",{parentName:"div",className:"admonition-content"},(0,r.kt)("p",{parentName:"div"},'It is crucial that you return the binary data in buffer as you received them. Be mindful of any encoding changes or data truncate that might happen in your cache. If you fail to return a buffer with the same contents as provided by the set function, you will likely send invalid data on the wire. This will likely result in your client receiving "valid" responses but will crash on the data decoding.'))),(0,r.kt)("h3",{id:"different-caching-settings"},"Different caching settings"),(0,r.kt)("p",null,"In case you don't want to cache some RPC, your ",(0,r.kt)("inlineCode",{parentName:"p"},"hash")," must return falsy value. In that case the middleware will not try to retrieve value from cache nor will save the result. Implement any logic your heart desires in ",(0,r.kt)("inlineCode",{parentName:"p"},"hash")," function. You can read the RPC info, client metadata, data from previous middlewares etc."),(0,r.kt)("h3",{id:"ttl-and-cache-purging"},"TTL and cache purging"),(0,r.kt)("p",null,"It is all up to you. If you want different TTL for different calls, set the TTL (or delete the record in your cache) yourself. If your ",(0,r.kt)("inlineCode",{parentName:"p"},"cache.get")," returns falsy value, we consider it to be a cache miss for whatever reason (cold start, ttl, etc.). Same goes for cache purging. ProtoCat never needs to clear your cache, so there is no API in the interface for that and you manage it on your own."),(0,r.kt)("h2",{id:"under-the-hood"},"Under the hood"),(0,r.kt)("p",null,'ProtoCat uses the "lowest" available public API of ',(0,r.kt)("inlineCode",{parentName:"p"},"grpc-js")," to hook handlers, that is ",(0,r.kt)("inlineCode",{parentName:"p"},"server.register"),". This allows it to override serialization methods. This way the standard protobuf message to wire function can be overriden to do ",(0,r.kt)("em",{parentName:"p"},"noop")," if ProtoCat tells it buffer caching has been used and it skips the default transformation of message to binary."),(0,r.kt)("p",null,"This is also the reasoning behind how we implemented the generic method. Now that the wire format can be used directly, it is also used as a serialization format that goes to cache storage. That is why it is so crucial to respect the buffer contract and not to tamper with the data in any way. Under normal cricumstances, sending an unserielizable input down gRPC would cause an error on the server, during the encoding. With caching middleware these runtime checks are skipped."),(0,r.kt)("p",null,"The middleware creator should satisfy your needs, but if you would like to use this mechanism without the middleware helper, it uses public API of the ProtoCat's call context. See the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/grissius/protocat/pull/21"},"implementation")," for details."),(0,r.kt)("h2",{id:"caching-other-grpc-call-types"},"Caching other gRPC call types"),(0,r.kt)("p",null,"Cache middleware is skipped for all call types but ",(0,r.kt)("inlineCode",{parentName:"p"},"unary"),". The underlying mechanism works for client streaming as well, but is far less powerful, since hashing function does not receive any client messages and must decide without or read them manually from stream."),(0,r.kt)("p",null,"At this point I am convinced that it does not make sense to cache streaming calls, since they should be used either for live data or as an event communication, none of which makes sense to be cached. If you find a use case for streaming caching open an issue! \ud83d\ude3a"))}h.isMDXComponent=!0}}]);