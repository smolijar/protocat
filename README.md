<div align="center">

![](https://gist.githubusercontent.com/grissius/2125f85d5983d980e1696f99b9b77bc7/raw/9c82b3406e4b1c9eb9d21746b67e22fc8f56dfe1/logo.png)

# protocat

Modern, minimalist type-safe gRPC framework for Node.js

</div>

## Quickstart

```typescript
import { Server } from 'protocat'
import { CatService } from '../dist/cat_grpc_pb' // Generated service definition

server = new Server()
server.addService(CatService, {
    getCat: async call => {
        const cat = await getCatByName(call.request?.getName() ?? '')
        call.response.setName(cat.name)
            .setHealth(cat.health)
            .setLevel(cat.level)
            .setClass(cat.profession ?? 'warrior')
    }
}

server.start('0.0.0.0:3000', ServerCredentials.createInsecure())
```

## Roadmap

- [ ] Middleware
- [ ] Error handling
- [ ] Type safety

- [ ] Call pool
- [ ] Partial definition
- [ ] Serialization level caching
- [ ] Docs

## See also

- [Mali](https://mali.js.org/) - Minimalistic Node.js gRPC microservice framework
- [BloomRPC](https://github.com/uw-labs/bloomrpc) - GUI Client for GRPC Services
- [ghz](https://github.com/bojand/ghz) - Simple gRPC benchmarking and load testing tool
- [grpc-health-probe](https://github.com/grpc-ecosystem/grpc-health-probe) - A command-line tool to perform health-checks for gRPC applications in Kubernetes etc.

## License

This project is licensed under [MIT](./LICENSE).
