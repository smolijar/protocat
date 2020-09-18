import { createClient } from '../lib/client/client'
import {
  GreetingClient,
  GreetingService,
} from '../../dist/test/api/v1/hello_grpc_pb'
import {
  Server,
  handleUnaryCall,
  Metadata,
  ServerCredentials,
  handleServerStreamingCall,
  ChannelCredentials,
} from '@grpc/grpc-js'
import { Hello } from '../../dist/test/api/v1/hello_pb'
import { bindAsync, tryShutdown } from '../lib/misc/grpc-helpers'
import {
  handleClientStreamingCall,
  handleBidiStreamingCall,
} from '@grpc/grpc-js/build/src/server-call'
import { metadataInterceptor } from '../lib/client/interceptors/metadata-interceptor'
import { accessLogInterceptor } from '../lib/client/interceptors/access-log-interceptor'

const createMeta = (x: Record<string, string>) => {
  const meta = new Metadata()
  for (const key in x) {
    meta.set(key, x[key])
  }
  return meta
}

const spyInterceptors = jest.fn()

const ADDR = '0.0.0.0:3000'
describe('Client', () => {
  let server: Server
  beforeAll(async () => {
    server = new Server()
    const unary: handleUnaryCall<Hello, Hello> = (call, cb) => {
      call.sendMetadata(createMeta({ initial: 'unary' }))
      spyInterceptors(call.metadata.getMap().path)
      cb(
        null,
        new Hello().setName((call.request?.getName() ?? '') + '!'),
        createMeta({ trailing: 'unary' })
      )
    }
    const serverStream: handleServerStreamingCall<Hello, Hello> = call => {
      call.sendMetadata(createMeta({ initial: 'serverStream' }))
      spyInterceptors(call.metadata.getMap().path)
      call.request
        ?.getName()
        .split('')
        .forEach(c => {
          call.write(new Hello().setName(c))
        })
      call.end(createMeta({ trailing: 'serverStream' }))
    }
    const clientStream: handleClientStreamingCall<Hello, Hello> = async (
      call,
      cb
    ) => {
      call.sendMetadata(createMeta({ initial: 'clientStream' }))
      spyInterceptors(call.metadata.getMap().path)
      const acc: string[] = []
      call.on('data', res => acc.push(res.getName()))
      await new Promise(resolve => call.on('end', resolve))
      cb(
        null,
        new Hello().setName(acc.join('-')),
        createMeta({ trailing: 'clientStream' })
      )
    }
    const bidi: handleBidiStreamingCall<Hello, Hello> = call => {
      call.sendMetadata(createMeta({ initial: 'bidi' }))
      spyInterceptors(call.metadata.getMap().path)
      call.on('data', r =>
        call.write(new Hello().setName(String(r.getName()) + '!'))
      )
      call.on('end', () => call.end(createMeta({ trailing: 'bidi' }) as any))
    }
    server.addService(GreetingService, {
      unary,
      serverStream,
      clientStream,
      bidi,
    })
    await bindAsync(server, ADDR, ServerCredentials.createInsecure())
    server.start()
  })
  afterAll(() => tryShutdown(server))
  const metadataInt = metadataInterceptor((meta, opts) => {
    meta.set('path', opts.method_definition.path)
  })
  const alInt = accessLogInterceptor(async (ctx, next) => {
    spyInterceptors(`${ctx.options.method_definition.path} -->`)
    const st = await next()
    spyInterceptors(`${ctx.options.method_definition.path} <-- (${st.details})`)
  })
  const singleClient = createClient(
    GreetingClient,
    ADDR,
    ChannelCredentials.createInsecure(),
    {
      interceptors: [metadataInt, alInt],
    }
  )
  const nestedClient = createClient({ foo: GreetingClient }, ADDR, undefined, {
    interceptors: [metadataInt, alInt],
  })
  for (const [label, client] of [
    ['Single', singleClient],
    ['Multi', nestedClient.foo],
  ] as const) {
    describe(`${label} service client`, () => {
      test('Unary', async () => {
        const { status, metadata, response } = await client.unary(req =>
          req.setName('Meow')
        )
        expect(response.getName()).toBe('Meow!')
        expect(metadata.getMap().initial).toBe('unary')
        expect(status.metadata.getMap().trailing).toBe('unary')
      })
      test('ServerStream', async () => {
        const { status, metadata, call } = client.serverStream(req =>
          req.setName('meow')
        )
        const acc: string[] = []
        call.on('data', res => acc.push(res.getName()))
        await new Promise(resolve => call.on('end', resolve))
        expect(acc.join('-')).toMatchInlineSnapshot('"m-e-o-w"')
        expect((await metadata).getMap().initial).toBe('serverStream')
        expect((await status).metadata.getMap().trailing).toBe('serverStream')
      })
      test('ClientStream', async () => {
        const { status, metadata, call, response } = client.clientStream()
        'meeoaw!'.split('').forEach(c => {
          call.write(new Hello().setName(c))
        })
        call.end()
        expect((await response).getName()).toMatchInlineSnapshot(
          '"m-e-e-o-a-w-!"'
        )
        expect((await metadata).getMap().initial).toBe('clientStream')
        expect((await status).metadata.getMap().trailing).toBe('clientStream')
      })
      test('Bidi', async () => {
        const { status, metadata, call } = await client.bidi()
        const acc: string[] = []
        call.on('data', res => acc.push(res.getName()))
        ;['miow', 'meow', 'meeoui'].forEach(m => {
          call.write(new Hello().setName(m))
        })
        call.end()
        await new Promise(resolve => call.on('end', resolve))
        expect(acc.join('-')).toMatchInlineSnapshot('"miow!-meow!-meeoui!"')
        expect((await metadata).getMap().initial).toBe('bidi')
        expect((await status).metadata.getMap().trailing).toBe('bidi')
      })
    })
  }
  describe('Interceptors', () => {
    test('Metadata interceptor sent path for each call, AL logged before-after', () => {
      expect(spyInterceptors.mock.calls.map(params => params[0]).join('\n'))
        .toMatchInlineSnapshot(`
        "/cats.v1.Greeting/Unary -->
        /cats.v1.Greeting/Unary
        /cats.v1.Greeting/Unary <-- (OK)
        /cats.v1.Greeting/ServerStream -->
        /cats.v1.Greeting/ServerStream
        /cats.v1.Greeting/ServerStream <-- (OK)
        /cats.v1.Greeting/ClientStream -->
        /cats.v1.Greeting/ClientStream
        /cats.v1.Greeting/ClientStream <-- (OK)
        /cats.v1.Greeting/Bidi -->
        /cats.v1.Greeting/Bidi
        /cats.v1.Greeting/Bidi <-- (OK)
        /cats.v1.Greeting/Unary -->
        /cats.v1.Greeting/Unary
        /cats.v1.Greeting/Unary <-- (OK)
        /cats.v1.Greeting/ServerStream -->
        /cats.v1.Greeting/ServerStream
        /cats.v1.Greeting/ServerStream <-- (OK)
        /cats.v1.Greeting/ClientStream -->
        /cats.v1.Greeting/ClientStream
        /cats.v1.Greeting/ClientStream <-- (OK)
        /cats.v1.Greeting/Bidi -->
        /cats.v1.Greeting/Bidi
        /cats.v1.Greeting/Bidi <-- (OK)"
      `)
    })
  })
})
