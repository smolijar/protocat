(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[546],{3905:function(e,t,r){"use strict";r.d(t,{Zo:function(){return p},kt:function(){return f}});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),s=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},p=function(e){var t=s(e.components);return n.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),m=s(r),f=a,g=m["".concat(l,".").concat(f)]||m[f]||u[f]||o;return r?n.createElement(g,i(i({ref:t},p),{},{components:r})):n.createElement(g,i({ref:t},p))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=m;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:a,i[1]=c;for(var s=2;s<o;s++)i[s]=r[s];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},1068:function(e,t,r){"use strict";r.r(t),r.d(t,{frontMatter:function(){return i},metadata:function(){return c},toc:function(){return l},default:function(){return p}});var n=r(2122),a=r(9756),o=(r(7294),r(3905)),i={title:"Starting a server"},c={unversionedId:"wiki/starting-server",id:"wiki/starting-server",isDocsHomePage:!1,title:"Starting a server",description:"`typescript",source:"@site/docs/wiki/starting-server.md",sourceDirName:"wiki",slug:"/wiki/starting-server",permalink:"/docs/wiki/starting-server",version:"current",frontMatter:{title:"Starting a server"},sidebar:"wikiSidebar",previous:{title:"Stub generation",permalink:"/docs/wiki/stub-generation"},next:{title:"Basic middleware",permalink:"/docs/wiki/basic-middleware"}},l=[],s={toc:l};function p(e){var t=e.components,r=(0,a.Z)(e,["components"]);return(0,o.kt)("wrapper",(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"import { ProtoCat } from 'protocat'\nimport { CatRegisterService } from '../cat_grpc_pb'\n\nconst findCat = (name: string) =>\n  Promise.resolve({\n    name,\n    level: Math.round(Math.random() * 10),\n    health: Math.random() * 100,\n  })\n\nconst app = new ProtoCat()\n\napp.addService(CatRegisterService, {\n  getCat: async call => {\n    const cat = await findCat(call.request.getName())\n    call.response.setName(cat.name).setLevel(cat.level).setHealth(cat.health)\n  },\n})\n\napp.start('0.0.0.0:3000')\n")),(0,o.kt)("p",null,"Test your running server with GUI client ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/uw-labs/bloomrpc"},"BloomRPC")," or CLI tool ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/fullstorydev/grpcurl"},"grpcurl"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},'grpcurl \\\n    -proto cat.proto \\\n    -plaintext \\\n    -d \'{"name": "ProtoCat"}\' \\\n    localhost:3000 cats.v1.CatRegister.GetCat\n')),(0,o.kt)("p",null,"And you should get a response! \ud83c\udf89"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "name": "ProtoCat",\n  "health": 79.40545,\n  "level": "1"\n}\n')))}p.isMDXComponent=!0}}]);