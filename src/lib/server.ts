import * as grpc from '@grpc/grpc-js'
import { ChannelOptions } from '@grpc/grpc-js/build/src/channel-options'
import { ServiceImplementation, Middleware } from './context'
import { stubToType } from './call-types'
import { bindAsync, tryShutdown } from './grpc-helpers'
import { composeMiddleware } from './middleware'

export class Server {
  /** Underlaying gRPC server */
  public server: grpc.Server
  /** Map of loaded generated method stubs */
  public methodDefinitions: Record<string, grpc.MethodDefinition<any, any>>
  /** Map of loaded method service implementations */
  public serviceHandlers: Record<string, Middleware>
  /** Global middleware functions */
  public middleware: Middleware[]
  constructor(options?: ChannelOptions) {
    this.server = new grpc.Server(options)
    this.methodDefinitions = {}
    this.middleware = []
    this.serviceHandlers = {}
  }

  public use(...middleware: Middleware[]) {
    this.middleware.push(...middleware)
  }

  public addService<
    T extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation>
  >(serviceDefinition: T, serviceImplementation: ServiceImplementation<T>) {
    for (const methodName in serviceDefinition) {
      // Path is FQN with namespace to avoid collisions
      const key = serviceDefinition[methodName].path
      this.methodDefinitions[key] = serviceDefinition[methodName]
      // @ts-ignore
      this.serviceHandlers[key] = serviceImplementation[methodName]
    }
  }

  registerHandlers() {
    for (const methodName in this.methodDefinitions) {
      const methodDefinition = this.methodDefinitions[methodName]
      const methodHandler: any = this.serviceHandlers[methodName] // HandlerCS<any, any> | HandlerU<any, any> | HandlerBS<any, any> | HandlerSS<any, any>
      const wrappedHandler = wrapToHandler(
        methodDefinition,
        composeMiddleware([...this.middleware, methodHandler])
      )
      const type = stubToType(methodDefinition)
      this.server.register(
        methodDefinition.path,
        wrappedHandler,
        methodDefinition.responseSerialize,
        methodDefinition.requestDeserialize,
        type
      )
    }
  }

  async start(address: string, creds: grpc.ServerCredentials) {
    this.registerHandlers()
    await bindAsync(this.server, address, creds)
    this.server.start()
  }

  stop() {
    return tryShutdown(this.server)
  }
}

const wrapToHandler = (
  methodDefinition: grpc.MethodDefinition<any, any>,
  methodHandler: any
) => {
  const initialMetadata = new grpc.Metadata()
  const trailingMetadata = new grpc.Metadata()
  const type = stubToType(methodDefinition)

  const createContext = (call: any): any =>
    Object.assign(call, {
      trailingMetadata,
      initialMetadata,
      flushInitialMetadata: () => call.sendMetadata(initialMetadata),
      type,
    })

  return async (
    call: any, // grpc.ServerReadableStream<any, any> | grpc.ServerUnaryCall<any, any> | grpc.ServerDuplexStream<any, any> | grpc.ServerWritableStream<any, any>
    cb?: grpc.sendUnaryData<any> // Only for call grpc.ServerReadableStream<any, any> | grpc.ServerUnaryCall<any, any>, missing otherwise
  ) => {
    const ctx = createContext(call)
    // @ts-ignore: Not part of public API, but only way to pair message to method
    ctx.response = new methodDefinition.responseType()
    try {
      await methodHandler(ctx)
      ctx.sendMetadata(ctx.initialMetadata)
      if (cb) {
        cb(null, ctx.response, ctx.trailingMetadata)
      }
    } catch (e) {
      if (cb) {
        cb(e, null, ctx.trailingMetadata)
      } else {
        call.emit('error', e)
      }
    }
  }
}
