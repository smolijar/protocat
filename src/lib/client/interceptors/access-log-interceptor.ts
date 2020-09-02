import * as grpc from '@grpc/grpc-js'

export const accessLogInterceptor = (
  fn: (
    context: {
      metadata: grpc.Metadata
      options: grpc.InterceptorOptions
    },
    next: () => Promise<grpc.StatusObject>
  ) => any
): grpc.Interceptor => (options, nextCall) => {
  return new grpc.InterceptingCall(nextCall(options), {
    start: (metadata, _listener, next) => {
      let res: any
      fn(
        { metadata, options },
        () =>
          new Promise<grpc.StatusObject>(resolve => {
            res = resolve
          })
      )
      next(metadata, {
        onReceiveStatus: (st, next) => {
          res(st)
          next(st)
        },
      })
    },
  })
}
