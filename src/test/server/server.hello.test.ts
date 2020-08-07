import { Server } from '../..'
import {
  GreetingService,
  GreetingClient,
} from '../../../dist/test/api/v1/hello_grpc_pb'
import {
  ServerCredentials,
  ChannelCredentials,
  Metadata,
  StatusObject,
} from '@grpc/grpc-js'
import { Hello } from '../../../dist/test/api/v1/hello_pb'
import { performance } from 'perf_hooks'

const ADDR = '0.0.0.0:3000'
describe('HelloService (boring, predictable and exhaustive)', () => {
  let server: Server
  test('createServer', () => {
    server = new Server()
  })
  test('use', () => {
    server.use(async (ctx, next) => {
      const start = performance.now()
      await next()
      const ms = performance.now() - start
      ctx.initialMetadata.set('response-time', ms.toString())
    })
  })
  test('addService', () => {
    server.addService(GreetingService, {
      unary: [
        call => {
          call.initialMetadata.set('type', 'initialUnary')
          call.initialMetadata.set('client', call.metadata.get('client')[0])
          call.trailingMetadata.set('type', 'trailingUnary')
        },
        call => {
          call.response.setName(call.request?.getName() ?? '')
        },
      ],
      serverStream: call => {
        call.initialMetadata.set('type', 'initialServerStream')
        call.initialMetadata.set('client', call.metadata.get('client')[0])
        call.trailingMetadata.set('type', 'trailingServerStream')
        call.flushInitialMetadata()
        for (let i = 0; i < 5; i++) {
          call.write(new Hello().setName('World'))
        }
        call.end()
      },
      clientStream: async call => {
        call.initialMetadata.set('type', 'initialClientStream')
        call.initialMetadata.set('client', call.metadata.get('client')[0])
        call.trailingMetadata.set('type', 'trailingClientStream')
        let acc = ''
        call.on('data', (req: Hello) => {
          acc += req.getName()
        })
        await new Promise(resolve =>
          call.on('end', () => {
            call.response = new Hello().setName(acc)
            resolve()
          })
        )
      },
      bidi: call => {
        call.initialMetadata.set('type', 'initialBidi')
        call.initialMetadata.set('client', call.metadata.get('client')[0])
        call.trailingMetadata.set('type', 'trailingBidi')
        call.flushInitialMetadata()
        call.on('data', (req: Hello) => {
          call.write(new Hello().setName(req.getName().toUpperCase()))
        })
        call.on('end', () => {
          call.end()
        })
      },
    })
  })
  test('start', async () => {
    await server.start(ADDR, ServerCredentials.createInsecure())
  })
  describe('Unary', () => {
    const client = new GreetingClient(ADDR, ChannelCredentials.createInsecure())
    let metaP: Promise<Metadata> = null as any
    let metaS: Promise<StatusObject> = null as any
    const clientMeta = new Metadata()
    clientMeta.set('client', 'unaryClientMeta')
    test('Reqest & response', async () => {
      const hello = await new Promise<Hello>((resolve, reject) => {
        const call = client.unary(
          new Hello().setName('X'),
          clientMeta,
          (err, res) => (err ? reject(err) : resolve(res))
        )
        metaP = new Promise(resolve => call.on('metadata', resolve))
        metaS = new Promise(resolve => call.on('status', resolve))
      })
      expect(hello.getName()).toBe('X')
    })
    test('Initial metadata', async () => {
      expect((await metaP).get('type')[0]).toEqual('initialUnary')
    })
    test('Middleware ran', async () => {
      expect(Number((await metaP).get('response-time')[0])).toBeGreaterThan(0)
    })
    test('Client metadata', async () => {
      expect((await metaP).get('client')[0]).toEqual('unaryClientMeta')
    })
    test('Trailing metadata', async () => {
      expect((await metaS).metadata.get('type')[0]).toEqual('trailingUnary')
    })
  })
  describe('ServerStream', () => {
    const client = new GreetingClient(ADDR, ChannelCredentials.createInsecure())
    let metaP: Promise<Metadata> = null as any
    let metaS: Promise<StatusObject> = null as any
    const clientMeta = new Metadata()
    clientMeta.set('client', 'serverStreamClientMeta')
    test('Response stream', async () => {
      let acc = ''
      await new Promise<Hello>((resolve, reject) => {
        const stream = client.serverStream(new Hello(), clientMeta)
        metaP = new Promise(resolve => stream.on('metadata', resolve))
        metaS = new Promise(resolve => stream.on('status', resolve))
        stream.on('data', (hello: Hello) => {
          acc = `${acc}${hello.getName()}`
        })
        stream.on('end', () => resolve())
        stream.on('error', (e: any) => (e.code === 1 ? resolve() : reject(e)))
      })
      expect(acc).toMatchInlineSnapshot('"WorldWorldWorldWorldWorld"')
    })
    test('Initial metadata', async () => {
      expect((await metaP).get('type')[0]).toEqual('initialServerStream')
    })
    test('Middleware ran', async () => {
      expect(Number((await metaP).get('response-time')[0])).toBeGreaterThan(0)
    })
    test('Client metadata', async () => {
      expect((await metaP).get('client')[0]).toEqual('serverStreamClientMeta')
    })
    test('Trailing metadata', async () => {
      expect((await metaS).metadata.get('type')[0]).toEqual(
        'trailingServerStream'
      )
    })
  })
  describe('ClientStream', () => {
    const client = new GreetingClient(ADDR, ChannelCredentials.createInsecure())
    let metaP: Promise<Metadata> = null as any
    let metaS: Promise<StatusObject> = null as any
    const clientMeta = new Metadata()
    clientMeta.set('client', 'clientStreamClientMeta')
    test('Client stream', async () => {
      const res = await new Promise<Hello>((resolve, reject) => {
        const stream = client.clientStream(clientMeta, (err, res) =>
          err ? reject(err) : resolve(res)
        )
        metaP = new Promise(resolve => stream.on('metadata', resolve))
        metaS = new Promise(resolve => stream.on('status', resolve))
        for (let i = 0; i < 10; ++i) {
          stream.write(new Hello().setName(String(i)))
        }
        stream.end()
      })
      expect(res.getName()).toMatchInlineSnapshot('"0123456789"')
    })
    test('Initial metadata', async () => {
      expect((await metaP).get('type')[0]).toEqual('initialClientStream')
    })
    test('Middleware ran', async () => {
      expect(Number((await metaP).get('response-time')[0])).toBeGreaterThan(0)
    })
    test('Client metadata', async () => {
      expect((await metaP).get('client')[0]).toEqual('clientStreamClientMeta')
    })
    test('Trailing metadata', async () => {
      expect((await metaS).metadata.get('type')[0]).toEqual(
        'trailingClientStream'
      )
    })
  })
  describe('Bidi', () => {
    const client = new GreetingClient(ADDR, ChannelCredentials.createInsecure())
    let metaP: Promise<Metadata> = null as any
    let metaS: Promise<StatusObject> = null as any
    const clientMeta = new Metadata()
    clientMeta.set('client', 'bidiClientMeta')
    test('Bidi stream', async () => {
      await new Promise<Hello>((resolve, reject) => {
        const stream = client.bidi(clientMeta)
        let cnt = 0
        stream.write(new Hello().setName('foo'))
        metaP = new Promise(resolve => stream.on('metadata', resolve))
        metaS = new Promise(resolve => stream.on('status', resolve))
        stream.on('end', resolve)
        stream.on('data', res => {
          if (cnt++ < 3) {
            stream.write(new Hello().setName('foo'))
          } else {
            stream.end()
          }
        })
      })
    })
    test('Initial metadata', async () => {
      expect((await metaP).get('type')[0]).toEqual('initialBidi')
    })
    test('Middleware ran', async () => {
      expect(Number((await metaP).get('response-time')[0])).toBeGreaterThan(0)
    })
    test('Client metadata', async () => {
      expect((await metaP).get('client')[0]).toEqual('bidiClientMeta')
    })
    test('Trailing metadata', async () => {
      expect((await metaS).metadata.get('type')[0]).toEqual('trailingBidi')
    })
  })
  test('stop', async () => {
    await server.stop()
  })
})
