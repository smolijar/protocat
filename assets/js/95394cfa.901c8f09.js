"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[65],{3905:function(e,t,a){a.d(t,{Zo:function(){return m},kt:function(){return c}});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var o=n.createContext({}),d=function(e){var t=n.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=d(e.components);return n.createElement(o.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),k=d(a),c=r,u=k["".concat(o,".").concat(c)]||k[c]||s[c]||i;return a?n.createElement(u,l(l({ref:t},m),{},{components:a})):n.createElement(u,l({ref:t},m))}));function c(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=k;var p={};for(var o in t)hasOwnProperty.call(t,o)&&(p[o]=t[o]);p.originalType=e,p.mdxType="string"==typeof e?e:r,l[1]=p;for(var d=2;d<i;d++)l[d]=a[d];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}k.displayName="MDXCreateElement"},6627:function(e,t,a){a.r(t),a.d(t,{assets:function(){return m},contentTitle:function(){return o},default:function(){return c},frontMatter:function(){return p},metadata:function(){return d},toc:function(){return s}});var n=a(7462),r=a(3366),i=(a(7294),a(3905)),l=["components"],p={id:"CacheImplementation",title:"Interface: CacheImplementation<E>",sidebar_label:"CacheImplementation",sidebar_position:0,custom_edit_url:null},o=void 0,d={unversionedId:"api/interfaces/CacheImplementation",id:"api/interfaces/CacheImplementation",title:"Interface: CacheImplementation<E>",description:"Type parameters",source:"@site/docs/api/interfaces/CacheImplementation.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/CacheImplementation",permalink:"/protocat/docs/api/interfaces/CacheImplementation",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"CacheImplementation",title:"Interface: CacheImplementation<E>",sidebar_label:"CacheImplementation",sidebar_position:0,custom_edit_url:null}},m={},s=[{value:"Type parameters",id:"type-parameters",level:2},{value:"Properties",id:"properties",level:2},{value:"get",id:"get",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters",level:5},{value:"Returns",id:"returns",level:5},{value:"Defined in",id:"defined-in",level:4},{value:"hash",id:"hash",level:3},{value:"Type declaration",id:"type-declaration-1",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-1",level:5},{value:"Defined in",id:"defined-in-1",level:4},{value:"set",id:"set",level:3},{value:"Type declaration",id:"type-declaration-2",level:4},{value:"Parameters",id:"parameters-2",level:5},{value:"Returns",id:"returns-2",level:5},{value:"Defined in",id:"defined-in-2",level:4}],k={toc:s};function c(e){var t=e.components,a=(0,r.Z)(e,l);return(0,i.kt)("wrapper",(0,n.Z)({},k,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"type-parameters"},"Type parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"E")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"unknown"))))),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"get"},"get"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"get"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"key"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"call"),": ",(0,i.kt)("a",{parentName:"p",href:"/protocat/docs/api/modules#protocatcall"},(0,i.kt)("inlineCode",{parentName:"a"},"ProtoCatCall")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"E"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Message"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Message"),", ",(0,i.kt)("a",{parentName:"p",href:"/protocat/docs/api/enums/CallType#unary"},(0,i.kt)("inlineCode",{parentName:"a"},"Unary")),">",") => ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Buffer")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Buffer"),">"),(0,i.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"key"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"call"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Buffer")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Buffer"),">"),(0,i.kt)("p",null,"Return buffer from cache. Returning falsy value is considered a cache miss."),(0,i.kt)("h5",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"key")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"string"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"call")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/protocat/docs/api/modules#protocatcall"},(0,i.kt)("inlineCode",{parentName:"a"},"ProtoCatCall")),"<",(0,i.kt)("inlineCode",{parentName:"td"},"E"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"Message"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"Message"),", ",(0,i.kt)("a",{parentName:"td",href:"/protocat/docs/api/enums/CallType#unary"},(0,i.kt)("inlineCode",{parentName:"a"},"Unary")),">")))),(0,i.kt)("h5",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Buffer")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Buffer"),">"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/smolijar/protocat/blob/3e459af/src/lib/server/middleware/cache.ts#L15"},"lib/server/middleware/cache.ts:15")),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"hash"},"hash"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"hash"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"call"),": ",(0,i.kt)("a",{parentName:"p",href:"/protocat/docs/api/modules#protocatcall"},(0,i.kt)("inlineCode",{parentName:"a"},"ProtoCatCall")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"E"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Message"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Message"),", ",(0,i.kt)("a",{parentName:"p",href:"/protocat/docs/api/enums/CallType#unary"},(0,i.kt)("inlineCode",{parentName:"a"},"Unary")),">",") => ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("h4",{id:"type-declaration-1"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"call"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("p",null,"Create a unique cache key that will be used for response save and lookup."),(0,i.kt)("p",null,"Return falsy key if caching should be skipped"),(0,i.kt)("h5",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"call")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/protocat/docs/api/modules#protocatcall"},(0,i.kt)("inlineCode",{parentName:"a"},"ProtoCatCall")),"<",(0,i.kt)("inlineCode",{parentName:"td"},"E"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"Message"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"Message"),", ",(0,i.kt)("a",{parentName:"td",href:"/protocat/docs/api/enums/CallType#unary"},(0,i.kt)("inlineCode",{parentName:"a"},"Unary")),">")))),(0,i.kt)("h5",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),">"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/smolijar/protocat/blob/3e459af/src/lib/server/middleware/cache.ts#L11"},"lib/server/middleware/cache.ts:11")),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"set"},"set"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"set"),": (",(0,i.kt)("inlineCode",{parentName:"p"},"key"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"value"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"Buffer"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"call"),": ",(0,i.kt)("a",{parentName:"p",href:"/protocat/docs/api/modules#protocatcall"},(0,i.kt)("inlineCode",{parentName:"a"},"ProtoCatCall")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"E"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Message"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"Message"),", ",(0,i.kt)("a",{parentName:"p",href:"/protocat/docs/api/enums/CallType#unary"},(0,i.kt)("inlineCode",{parentName:"a"},"Unary")),">",") => ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"type-declaration-2"},"Type declaration"),(0,i.kt)("p",null,"\u25b8 (",(0,i.kt)("inlineCode",{parentName:"p"},"key"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"value"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"call"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Set cache result. Result is not awaited and does not block the response nor subsequent requests"),(0,i.kt)("h5",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"key")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"string"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"value")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"Buffer"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"call")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/protocat/docs/api/modules#protocatcall"},(0,i.kt)("inlineCode",{parentName:"a"},"ProtoCatCall")),"<",(0,i.kt)("inlineCode",{parentName:"td"},"E"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"Message"),", ",(0,i.kt)("inlineCode",{parentName:"td"},"Message"),", ",(0,i.kt)("a",{parentName:"td",href:"/protocat/docs/api/enums/CallType#unary"},(0,i.kt)("inlineCode",{parentName:"a"},"Unary")),">")))),(0,i.kt)("h5",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://github.com/smolijar/protocat/blob/3e459af/src/lib/server/middleware/cache.ts#L20"},"lib/server/middleware/cache.ts:20")))}c.isMDXComponent=!0}}]);