"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[28],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return m}});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=r.createContext({}),c=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=c(e.components);return r.createElement(p.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,l=e.originalType,p=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),d=c(n),m=i,f=d["".concat(p,".").concat(m)]||d[m]||s[m]||l;return n?r.createElement(f,a(a({ref:t},u),{},{components:n})):r.createElement(f,a({ref:t},u))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var l=n.length,a=new Array(l);a[0]=d;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o.mdxType="string"==typeof e?e:i,a[1]=o;for(var c=2;c<l;c++)a[c]=n[c];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},2172:function(e,t,n){n.r(t),n.d(t,{assets:function(){return u},contentTitle:function(){return p},default:function(){return m},frontMatter:function(){return o},metadata:function(){return c},toc:function(){return s}});var r=n(7462),i=n(3366),l=(n(7294),n(3905)),a=["components"],o={id:"CallType",title:"Enumeration: CallType",sidebar_label:"CallType",sidebar_position:0,custom_edit_url:null},p=void 0,c={unversionedId:"api/enums/CallType",id:"api/enums/CallType",title:"Enumeration: CallType",description:"Call types aligned with grpc core library",source:"@site/docs/api/enums/CallType.md",sourceDirName:"api/enums",slug:"/api/enums/CallType",permalink:"/protocat/docs/api/enums/CallType",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"CallType",title:"Enumeration: CallType",sidebar_label:"CallType",sidebar_position:0,custom_edit_url:null}},u={},s=[{value:"Enumeration Members",id:"enumeration-members",level:2},{value:"Bidi",id:"bidi",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"ClientStream",id:"clientstream",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"ServerStream",id:"serverstream",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"Unary",id:"unary",level:3},{value:"Defined in",id:"defined-in-3",level:4}],d={toc:s};function m(e){var t=e.components,n=(0,i.Z)(e,a);return(0,l.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"Call types aligned with grpc core library"),(0,l.kt)("h2",{id:"enumeration-members"},"Enumeration Members"),(0,l.kt)("h3",{id:"bidi"},"Bidi"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"Bidi")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"bidi"')),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/smolijar/protocat/blob/3cbdcfd/src/lib/call-types.ts#L3"},"lib/call-types.ts:3")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"clientstream"},"ClientStream"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ClientStream")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"clientStream"')),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/smolijar/protocat/blob/3cbdcfd/src/lib/call-types.ts#L5"},"lib/call-types.ts:5")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"serverstream"},"ServerStream"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"ServerStream")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"serverStream"')),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/smolijar/protocat/blob/3cbdcfd/src/lib/call-types.ts#L4"},"lib/call-types.ts:4")),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"unary"},"Unary"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"Unary")," = ",(0,l.kt)("inlineCode",{parentName:"p"},'"unary"')),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,(0,l.kt)("a",{parentName:"p",href:"https://github.com/smolijar/protocat/blob/3cbdcfd/src/lib/call-types.ts#L6"},"lib/call-types.ts:6")))}m.isMDXComponent=!0}}]);