import { Server, onError, CallType } from '..'
import {
  GreetingService,
  GreetingClient,
} from '../../dist/test/api/v1/hello_grpc_pb'
import {
  ServerCredentials,
  ChannelCredentials,
  Metadata,
  StatusObject,
} from '@grpc/grpc-js'
import { Hello } from '../../dist/test/api/v1/hello_pb'

const ADDR = '0.0.0.0:3000'
describe('Error handling', () => {
  const server = new Server()
  let lastError: any = null
  afterAll(() => server.stop())
  test('Setup', async () => {
    server.addService(GreetingService, {
      unary: ctx => {
        throw new Error('unary-error')
      },
      serverStream: ctx => {
        if (ctx.metadata.getMap().type === 'sync') {
          throw new Error('serverStream-sync-error')
        } else {
          ctx.emit('error', new Error('serverStream-stream-error'))
        }
      },
      clientStream: ctx => {
        if (ctx.metadata.getMap().type === 'sync') {
          throw new Error('clientStream-sync-error')
        } else {
          ctx.emit('error', new Error('clientStream-stream-error'))
        }
      },
      bidi: ctx => {
        if (ctx.metadata.getMap().type === 'sync') {
          throw new Error('bidi-sync-error')
        } else {
          ctx.emit('error', new Error('bidi-stream-error'))
        }
      },
    })
    server.use(
      onError((e, ctx) => {
        ctx.initialMetadata.set('onerror', `${ctx.type}-onerror`)
        ctx.trailingMetadata.set('onerror', `${ctx.type}-onerror`)
        if (ctx.metadata.getMap().catch) {
          lastError = e
          if (
            ctx.type === CallType.SERVER_STREAM ||
            ctx.type === CallType.BIDI
          ) {
            // sync error not re-thrown on stream response, should end
            ctx.end()
          }
        } else {
          // Handler can be sync or async
          if (Math.random() > 0.5) {
            throw e
          }
          return Promise.reject(e)
        }
      })
    )
    server.use((ctx, next) => {
      ctx.initialMetadata.set('initial', ctx.type)
      ctx.trailingMetadata.set('trailing', `${ctx.type}-trailing`)
    })
    await server.start(ADDR, ServerCredentials.createInsecure())
  })
  describe('Unary', () => {
    const client = new GreetingClient(ADDR, ChannelCredentials.createInsecure())

    const clientMeta = new Metadata()
    clientMeta.set('catch', 'true')
    test('Caught error does not reach client', async () => {
      await new Promise<Hello>((resolve, reject) => {
        client.unary(new Hello(), clientMeta, (err, res) =>
          err ? reject(err) : resolve(res)
        )
      })
      expect(lastError.message).toMatch(/unary-error/)
    })
    describe('Pass through rejects at client with correct status', () => {
      let metaS: Promise<StatusObject> = null as any
      let metaP: Promise<Metadata> = null as any
      test('Throws', async () => {
        await expect(
          new Promise<Hello>((resolve, reject) => {
            const call = client.unary(new Hello(), (err, res) =>
              err ? reject(err) : resolve(res)
            )
            metaS = new Promise(resolve => call.on('status', resolve))
            metaP = new Promise(resolve => call.on('metadata', resolve))
          })
        ).rejects.toThrow(/unary-error/)
      })
      test('Error data', async () => {
        expect((await metaS).code).toBe(2)
        expect((await metaS).details).toBe('unary-error')
      })
      test('Trailing (status) metadata', async () => {
        expect((await metaS).metadata.getMap().trailing).toBe('unary-trailing')
        expect((await metaS).metadata.getMap().onerror).toBe('unary-onerror')
      })
      test('Initial metadata', async () => {
        expect((await metaP).getMap().initial).toEqual('unary')
        expect((await metaP).getMap().onerror).toEqual('unary-onerror')
      })
    })
  })
  for (const type of ['sync', 'stream']) {
    describe(`ServerStream (${type} error)`, () => {
      const client = new GreetingClient(
        ADDR,
        ChannelCredentials.createInsecure()
      )
      test('Caught error does not reach client', async () => {
        const clientMeta = new Metadata()
        clientMeta.set('catch', 'true')
        clientMeta.set('type', type)
        await new Promise<Hello>((resolve, reject) => {
          const stream = client.serverStream(new Hello(), clientMeta)
          stream.on('data', hello => hello)
          stream.on('end', () => resolve())
          stream.on('error', (e: any) => (e.code === 1 ? resolve() : reject(e)))
        })
        expect(lastError.message).toMatch(
          new RegExp(`serverStream-${type}-error`)
        )
      })
      describe('Pass through rejects at client with correct status', () => {
        const clientMeta = new Metadata()
        clientMeta.set('type', type)
        let status: StatusObject = null as any
        let metaP: Promise<Metadata> = null as any

        test('Throws', async () => {
          await expect(
            new Promise<Hello>((resolve, reject) => {
              const stream = client.serverStream(new Hello(), clientMeta)
              stream.on('end', () => resolve())
              metaP = new Promise(resolve => stream.on('metadata', resolve))

              // Does not emit `status`: status object is in error on failure
              stream.on('error', e => {
                status = e as any
                reject(e)
              })
            })
          ).rejects.toThrow(`serverStream-${type}-error`)
        })
        test('Error data', () => {
          expect(status.code).toBe(2)
          expect(status.details).toBe(`serverStream-${type}-error`)
        })
        test('Trailing (status) metadata', () => {
          expect(status.metadata.getMap().trailing).toBe(
            'serverStream-trailing'
          )
          expect(status.metadata.getMap().onerror).toBe('serverStream-onerror')
        })
        test('Initial metadata', async () => {
          expect((await metaP).getMap().initial).toEqual('serverStream')
          expect((await metaP).getMap().onerror).toEqual('serverStream-onerror')
        })
      })
    })
  }
  for (const type of ['sync', 'stream']) {
    describe(`ClientStream (${type} error)`, () => {
      const client = new GreetingClient(
        ADDR,
        ChannelCredentials.createInsecure()
      )
      test('Caught error does not reach client', async () => {
        const clientMeta = new Metadata()
        clientMeta.set('catch', 'true')
        clientMeta.set('type', type)
        await new Promise<Hello>((resolve, reject) => {
          client.clientStream(clientMeta, (err, res) =>
            err ? reject(err) : resolve(res)
          )
        })
        expect(lastError.message).toMatch(
          new RegExp(`clientStream-${type}-error`)
        )
      })
      describe('Pass through rejects at client with correct status', () => {
        const clientMeta = new Metadata()
        clientMeta.set('type', type)
        let metaP: Promise<Metadata> = null as any
        let status: StatusObject = null as any
        test('Throws', async () => {
          await expect(
            new Promise<Hello>((resolve, reject) => {
              const call = client.clientStream(clientMeta, (err, res) => {
                if (err) {
                  status = err
                  reject(err)
                }
                resolve(res)
              })
              metaP = new Promise(resolve => call.on('metadata', resolve))
            })
          ).rejects.toThrow(`clientStream-${type}-error`)
        })
        test('Error data', () => {
          expect(status.code).toBe(2)
          expect(status.details).toBe(`clientStream-${type}-error`)
        })
        test('Trailing (status) metadata', () => {
          expect(status.metadata.getMap().trailing).toBe(
            'clientStream-trailing'
          )
          expect(status.metadata.getMap().onerror).toBe('clientStream-onerror')
        })
        test('Initial metadata', async () => {
          expect((await metaP).getMap().initial).toEqual('clientStream')
          expect((await metaP).getMap().onerror).toEqual('clientStream-onerror')
        })
      })
    })
  }
  for (const type of ['sync', 'stream']) {
    describe(`Bidi (${type} error)`, () => {
      const client = new GreetingClient(
        ADDR,
        ChannelCredentials.createInsecure()
      )
      test('Caught error does not reach client', async () => {
        const clientMeta = new Metadata()
        clientMeta.set('catch', 'true')
        clientMeta.set('type', type)
        await new Promise<Hello>((resolve, reject) => {
          const stream = client.bidi(clientMeta)
          stream.on('data', hello => hello)
          stream.on('end', () => resolve())
          stream.on('error', (e: any) => (e.code === 1 ? resolve() : reject(e)))
        })
        expect(lastError.message).toMatch(new RegExp(`bidi-${type}-error`))
      })
      describe('Pass through rejects at client with correct status', () => {
        const clientMeta = new Metadata()
        clientMeta.set('type', type)
        let status: StatusObject = null as any
        let metaP: Promise<Metadata> = null as any
        test('Throws', async () => {
          await expect(
            new Promise<Hello>((resolve, reject) => {
              const stream = client.bidi(clientMeta)
              stream.on('end', () => resolve())
              metaP = new Promise(resolve => stream.on('metadata', resolve))
              // Does not emit `status`: status object is in error on failure
              stream.on('error', e => {
                status = e as any
                reject(e)
              })
            })
          ).rejects.toThrow(`bidi-${type}-error`)
        })
        test('Error data', () => {
          expect(status.code).toBe(2)
          expect(status.details).toBe(`bidi-${type}-error`)
        })
        test('Trailing (status) metadata', () => {
          expect(status.metadata.getMap().trailing).toBe('bidi-trailing')
          expect(status.metadata.getMap().onerror).toBe('bidi-onerror')
        })
        test('Initial metadata', async () => {
          expect((await metaP).getMap().initial).toEqual('bidi')
          expect((await metaP).getMap().onerror).toEqual('bidi-onerror')
        })
      })
    })
  }
})
