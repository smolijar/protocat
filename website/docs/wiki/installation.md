---
title: Installation
---

```bash
npm install protocat
```

ProtoCat has `@grpc/grpc-js` as a dependency, so no further production dependencies are required.

```bash
npm install -D grpc-tools grpc_tools_node_protoc_ts
```

You will need to generate JavaScript (optionally TypeScript) stubs from your proto files.
These will be generated before the start of the app and are usually development dependencies.

:::note

It is theoretically possible to load `.proto` files directly and skip the generation of stubs, but is not currently supported with ProtoCat API. While it is easier to setup, it disables the use of TypeScript's hinting and static code analysis, which cripples one of the core advantages of gRPC: strong contract.

However if you have a use for this feature open an issue.

:::
