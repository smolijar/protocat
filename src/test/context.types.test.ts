import { Server, Middleware } from '..'
import {
  GreetingService,
  IGreetingService,
} from '../../dist/test/api/v1/hello_grpc_pb'
import { ServiceImplementation } from '../lib/context'

describe('Context extension types', () => {
  interface MyContext {
    uid: string
  }
  const server = new Server<MyContext>()

  // Inferred middleware context
  server.use((ctx, next) => {
    ctx.uid = '123'
  })

  // Explicit middleware context
  const mdw: Middleware<MyContext> = (ctx, next) => {
    ctx.uid = '123'
  }
  server.use(mdw)

  // Service definition inferred and explicit
  const unaryHandler: ServiceImplementation<
    IGreetingService,
    MyContext
  >['unary'] = ctx => ctx.uid
  server.addService(GreetingService, {
    bidi: ctx => ctx.uid,
    unary: unaryHandler,
    serverStream: ctx => ctx.uid,
    clientStream: ctx => ctx.uid,
  })
  test('Type check', jest.fn())
})
