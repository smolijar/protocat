import * as grpc from '@grpc/grpc-js'

/** Promise wrapper for callback tryShutdown */
export const tryShutdown = (server: grpc.Server) =>
  new Promise((resolve, reject) =>
    server.tryShutdown(err => (err ? reject(err) : resolve()))
  )

/** Promise wrapper for callback bindAsync */
export const bindAsync = (
  server: grpc.Server,
  address: string,
  creds: grpc.ServerCredentials
) =>
  new Promise<number>((resolve, reject) =>
    server.bindAsync(address, creds, (err, port) =>
      err ? reject(err) : resolve(port)
    )
  )
