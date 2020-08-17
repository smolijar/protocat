import { ProtoCat, Middleware, ServiceImplementation } from '..'
import {
  GreetingService,
  IGreetingService,
} from '../../dist/test/api/v1/hello_grpc_pb'

describe('Context extension types', () => {
  interface MyContext {
    uid: string
  }
  const app = new ProtoCat<MyContext>()

  // Inferred middleware context
  app.use((call, next) => {
    call.uid = '123'
  })

  // Explicit middleware context
  const mdw: Middleware<MyContext> = (call, next) => {
    call.uid = '123'
  }
  app.use(mdw)

  // Service definition inferred and explicit
  const unaryHandler: ServiceImplementation<
    IGreetingService,
    MyContext
  >['unary'] = call => call.uid
  app.addService(GreetingService, {
    bidi: call => call.uid,
    unary: unaryHandler,
    serverStream: call => call.uid,
    clientStream: call => call.uid,
  })
  test('Type check', jest.fn())
})
