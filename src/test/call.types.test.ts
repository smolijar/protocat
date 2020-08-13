import { Server, Middleware } from '..'
import {
  GreetingService,
  IGreetingService,
} from '../../dist/test/api/v1/hello_grpc_pb'
import { ServiceImplementation } from '../lib/call'

describe('Context extension types', () => {
  interface MyContext {
    uid: string
  }
  const server = new Server<MyContext>()

  // Inferred middleware context
  server.use((call, next) => {
    call.uid = '123'
  })

  // Explicit middleware context
  const mdw: Middleware<MyContext> = (call, next) => {
    call.uid = '123'
  }
  server.use(mdw)

  // Service definition inferred and explicit
  const unaryHandler: ServiceImplementation<
    IGreetingService,
    MyContext
  >['unary'] = call => call.uid
  server.addService(GreetingService, {
    bidi: call => call.uid,
    unary: unaryHandler,
    serverStream: call => call.uid,
    clientStream: call => call.uid,
  })
  test('Type check', jest.fn())
})
