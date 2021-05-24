import * as grpc from '@grpc/grpc-js'

export const metadataInterceptor =
  (
    fn: (metadata: grpc.Metadata, options: grpc.InterceptorOptions) => any
  ): grpc.Interceptor =>
  (options, nextCall) => {
    return new grpc.InterceptingCall(nextCall(options), {
      start: async (metadata, _listener, next) => {
        await fn(metadata, options)
        next(metadata, {
          onReceiveMessage: (msg, next) => next(msg),
          onReceiveMetadata: (meta, next) => next(meta),
          onReceiveStatus: (st, next) => next(st),
        })
      },
    })
  }
