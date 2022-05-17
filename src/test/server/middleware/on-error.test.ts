import { ProtoCat, onError, CallType } from '../../..'
import {
  GreetingService,
  GreetingClient,
} from '../../../../dist/test/api/v1/hello_grpc_pb'
import {
  ServerCredentials,
  ChannelCredentials,
  Metadata,
  StatusObject,
} from '@grpc/grpc-js'
import { Hello } from '../../../../dist/test/api/v1/hello_pb'
import { testAddress } from '../util'

const createError = (x: string) => {
  const metadata = new Metadata()
  metadata.set('_', x)
  return Object.assign(new Error(x), { metadata })
}

const address = testAddress()
const getClient = () => new GreetingClient(address.getAddress(), ChannelCredentials.createInsecure())

describe('Error handling', () => {
  const app = new ProtoCat()
  let lastError: any = null
  afterAll(() => app.stop())
  test('Setup', async () => {
    app.addService(GreetingService, {
      unary: call => {
        throw createError('unary-error')
      },
      serverStream: call => {
        if (call.metadata.getMap().type === 'sync') {
          throw createError('serverStream-sync-error')
        } else {
          call.emit('error', createError('serverStream-stream-error'))
        }
      },
      clientStream: call => {
        if (call.meta.type === 'sync') {
          throw createError('clientStream-sync-error')
        } else {
          call.emit('error', createError('clientStream-stream-error'))
        }
      },
      bidi: call => {
        if (call.meta.type === 'sync') {
          throw createError('bidi-sync-error')
        } else {
          call.emit('error', createError('bidi-stream-error'))
        }
      },
    })
    app.use(
      onError((e, call) => {
        call.initialMetadata.set('onerror', `${call.type}-onerror`)
        call.trailingMetadata.set('onerror', `${call.type}-onerror`)
        if (call.metadata.getMap().catch) {
          lastError = e
          if (
            call.type === CallType.ServerStream ||
            call.type === CallType.Bidi
          ) {
            // sync error not re-thrown on stream response, should end
            call.end()
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
    app.use((call, next) => {
      call.initialMetadata.set('initial', call.type)
      call.trailingMetadata.set('trailing', `${call.type}-trailing`)
      return next()
    })
    const port = await app.start(address.getAddress(), ServerCredentials.createInsecure())
    address.setPort(port)
  })
  describe('Unary', () => {
    const clientMeta = new Metadata()
    clientMeta.set('catch', 'true')
    test('Caught error does not reach client', async () => {
      await new Promise<Hello>((resolve, reject) => {
        getClient().unary(new Hello(), clientMeta, (err, res) =>
          err ? reject(err) : resolve(res)
        )
      })
      expect(lastError.message).toMatch(/unary-error/)
    })
    describe('Pass through rejects at client with correct status', () => {
      let status: Promise<StatusObject> = null as any
      let metadata: Promise<Metadata> = null as any
      test('Throws', async () => {
        await expect(
          new Promise<Hello>((resolve, reject) => {
            const call = getClient().unary(new Hello(), (err, res) =>
              err ? reject(err) : resolve(res)
            )
            status = new Promise(resolve => call.on('status', resolve))
            metadata = new Promise(resolve => call.on('metadata', resolve))
          })
        ).rejects.toThrow(/unary-error/)
      })
      test('Error data', async () => {
        expect((await status).code).toBe(2)
        expect((await status).details).toBe('unary-error')
      })
      test('Trailing (status) metadata', async () => {
        expect((await status).metadata.getMap().trailing).toBe('unary-trailing')
        expect((await status).metadata.getMap().onerror).toBe('unary-onerror')
      })
      test('Trailing (status) metadata - error', async () => {
        expect((await status).metadata.getMap()._).toBe('unary-error')
      })
      test('Initial metadata', async () => {
        expect((await metadata).getMap().initial).toEqual('unary')
        expect((await metadata).getMap().onerror).toEqual('unary-onerror')
      })
    })
  })
  for (const type of ['sync', 'stream']) {
    describe(`ServerStream (${type} error)`, () => {
      test('Caught error does not reach client', async () => {
        const clientMeta = new Metadata()
        clientMeta.set('catch', 'true')
        clientMeta.set('type', type)
        await new Promise<void>((resolve, reject) => {
          const call = getClient().serverStream(new Hello(), clientMeta)
          call.on('data', hello => hello)
          call.on('end', () => resolve())
          call.on('error', (e: any) => (e.code === 1 ? resolve() : reject(e)))
        })
        expect(lastError.message).toMatch(
          new RegExp(`serverStream-${type}-error`)
        )
      })
      describe('Pass through rejects at client with correct status', () => {
        const clientMeta = new Metadata()
        clientMeta.set('type', type)
        let status: StatusObject = null as any
        let metadata: Promise<Metadata> = null as any

        test('Throws', async () => {
          await expect(
            new Promise<void>((resolve, reject) => {
              const call = getClient().serverStream(new Hello(), clientMeta)
              call.on('end', () => resolve())
              metadata = new Promise(resolve => call.on('metadata', resolve))

              // Does not emit `status`: status object is in error on failure
              call.on('error', e => {
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
        test('Trailing (status) metadata - error', async () => {
          expect((await status).metadata.getMap()._).toBe(
            `serverStream-${type}-error`
          )
        })
        test('Initial metadata', async () => {
          expect((await metadata).getMap().initial).toEqual('serverStream')
          expect((await metadata).getMap().onerror).toEqual(
            'serverStream-onerror'
          )
        })
      })
    })
  }
  for (const type of ['sync', 'stream']) {
    describe(`ClientStream (${type} error)`, () => {
      test('Caught error does not reach client', async () => {
        const clientMeta = new Metadata()
        clientMeta.set('catch', 'true')
        clientMeta.set('type', type)
        await new Promise<Hello>((resolve, reject) => {
          getClient().clientStream(clientMeta, (err, res) =>
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
        let metadata: Promise<Metadata> = null as any
        let status: StatusObject = null as any
        test('Throws', async () => {
          await expect(
            new Promise<Hello>((resolve, reject) => {
              const call = getClient().clientStream(clientMeta, (err, res) => {
                if (err) {
                  status = err
                  reject(err)
                }
                resolve(res)
              })
              metadata = new Promise(resolve => call.on('metadata', resolve))
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
        test('Trailing (status) metadata - error', async () => {
          expect((await status).metadata.getMap()._).toBe(
            `clientStream-${type}-error`
          )
        })
        test('Initial metadata', async () => {
          expect((await metadata).getMap().initial).toEqual('clientStream')
          expect((await metadata).getMap().onerror).toEqual(
            'clientStream-onerror'
          )
        })
      })
    })
  }
  for (const type of ['sync', 'stream']) {
    describe(`Bidi (${type} error)`, () => {
      test('Caught error does not reach client', async () => {
        const clientMeta = new Metadata()
        clientMeta.set('catch', 'true')
        clientMeta.set('type', type)
        await new Promise<void>((resolve, reject) => {
          const call = getClient().bidi(clientMeta)
          call.on('data', hello => hello)
          call.on('end', () => resolve())
          call.on('error', (e: any) => (e.code === 1 ? resolve() : reject(e)))
        })
        expect(lastError.message).toMatch(new RegExp(`bidi-${type}-error`))
      })
      describe('Pass through rejects at client with correct status', () => {
        const clientMeta = new Metadata()
        clientMeta.set('type', type)
        let status: StatusObject = null as any
        let metadata: Promise<Metadata> = null as any
        test('Throws', async () => {
          await expect(
            new Promise<void>((resolve, reject) => {
              const call = getClient().bidi(clientMeta)
              call.on('end', () => resolve())
              metadata = new Promise(resolve => call.on('metadata', resolve))
              // Does not emit `status`: status object is in error on failure
              call.on('error', e => {
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
        test('Trailing (status) metadata - error', async () => {
          expect((await status).metadata.getMap()._).toBe(`bidi-${type}-error`)
        })
        test('Initial metadata', async () => {
          expect((await metadata).getMap().initial).toEqual('bidi')
          expect((await metadata).getMap().onerror).toEqual('bidi-onerror')
        })
      })
    })
  }
})
