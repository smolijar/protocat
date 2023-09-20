<div align="center">

[![](https://raw.githubusercontent.com/grissius/protocat/master/website/static/img/logo.svg)](https://smolijar.github.io/protocat/)

# ProtoCat

Modern, minimalist type-safe gRPC framework for Node.js

[![](https://flat.badgen.net/github/status/grissius/protocat)](https://github.com/grissius/protocat/actions/workflows/node.js.yml)
[![](https://flat.badgen.net/npm/v/protocat)](https://www.npmjs.com/package/protocat)
[![](https://flat.badgen.net/codecov/c/github/grissius/protocat)](https://codecov.io/gh/grissius/protocat)
[![](https://flat.badgen.net/codeclimate/maintainability/grissius/protocat)](https://codeclimate.com/github/grissius/protocat)
[![](https://flat.badgen.net/github/license/grissius/protocat)](https://github.com/grissius/protocat/blob/master/LICENSE)
[![](https://flat.badgen.net/david/dep/grissius/protocat)](https://david-dm.org/grissius/protocat)
[![](https://flat.badgen.net/snyk/grissius/protocat/master)](https://snyk.io/vuln/npm:protocat)
[![](https://flat.badgen.net/badge/%F0%9F%93%91%20docs/pages/cyan)](https://smolijar.github.io/protocat/)

</div>

## Quickstart

```typescript
import { ProtoCat } from 'protocat'
import { CatService } from '../dist/cat_grpc_pb' // Generated service definition

app = new ProtoCat()
app.addService(CatService, {
    getCat: async call => {
        const cat = await getCatByName(call.request?.getName() ?? '')
        call.response.setName(cat.name)
            .setHealth(cat.health)
            .setLevel(cat.level)
            .setClass(cat.profession ?? 'warrior')
    }
}

app.start('0.0.0.0:3000')
```

## Docs

Learn more about ProtoCat in [docs](https://smolijar.github.io/protocat//).

## Support

Project is sponsored by [Ackee](https://www.ackee.cz).

## See also

- [Mali](https://mali.js.org/) - Minimalistic Node.js gRPC microservice framework
- [BloomRPC](https://github.com/uw-labs/bloomrpc) - GUI Client for GRPC Services
- [ghz](https://github.com/bojand/ghz) - Simple gRPC benchmarking and load testing tool
- [grpc-health-probe](https://github.com/grpc-ecosystem/grpc-health-probe) - A command-line tool to perform health-checks for gRPC applications in Kubernetes etc.

## License

This project is licensed under [MIT](./LICENSE).
