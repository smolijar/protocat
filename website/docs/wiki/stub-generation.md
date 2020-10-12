---
title: Stub generation
---

> This section assumes you don't have any code-generation task or process. If you already are generating stubs, just make sure your stubs use `@grpc/grpc-js` and not `grpc` implementation, and that you have TypeScript definitions as well. If doubtful, compare the build task to the one in this section.

Create a `cat.proto` file:

```protobuf
syntax = "proto3";

package cats.v1;

service CatRegister {
    rpc GetCat (GetCatRequest) returns (Cat) {};
}

message Cat {
    string name = 1;
    float health = 2;
    int64 level = 3;
}

message GetCatRequest {
    string name = 1;
}
```

And create stubs with the following command from installed `grpc-tools`:

```bash
npx grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:. \
    --ts_out=generate_package_definition:. \
    --grpc_out=grpc_js:. \
    ./cat.proto
```

1. `--js_out` sets destination for JavaScript files for messages
1. `--ts_out` generates the relevant `d.ts` files without needing to mention `grpc_tools_node_protoc_ts` explicitly
1. `--grpc_out` sets destination for JavaScript files for gRPC services, sets to use `@grpc/grpc-js` implementation (instead of deprecated `grpc`)
1. You can use `-I` for import path in your proto files in a larger project, see the `build:proto` task of ProtoCat, where stubs are compiled before tests

The script should generate the following files:

```bash
cat_pb.js         # messages from cat.proto
cat_pb.d.ts       # (+ types)
cat_grpc_pb.js    # services from cat.proto
cat_grpc_pb.d.ts  # (+ types)
```

:::note

If you have any issues with the build process, see the `grpc-tools` [docs](https://github.com/grpc/grpc-node/tree/master/packages/grpc-tools).

:::
