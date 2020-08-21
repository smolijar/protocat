import * as grpc from '@grpc/grpc-js'
import { RemoveIdxSgn, TypedOnData } from '../misc/type-helpers'
import { CallType } from '../call-types'
import { Message } from 'google-protobuf'

/**
 * Extended gRPC call
 */
export type ProtoCatCall<
  Extension = {},
  Req = Message,
  Res = Message,
  Type extends CallType = CallType
> = {
  /** Client metadata */
  readonly metadata: grpc.Metadata
  /** Client metadata */
  readonly meta: Record<string, string>
  /** Server initial metadata (sent automatically for unary / client stream) */
  initialMetadata: grpc.Metadata
  /** Manually send initial metadata for server stream / bidi */
  flushInitialMetadata: () => void
  /** Trailing metadata (sent automatically) */
  trailingMetadata: grpc.Metadata
  /** RPC path "/[package].[service]/[method]", e.g. /cats.v1.Cat/GetCat */
  path: string
  /** Protofile package name */
  package: string
  /** Protofile service name (interface name) */
  service: string
  /** Protofile rpc name */
  method: string
  /** Type of call */
  type: Type
  /** Request message: only unary and server-stream */
  request?: Req
  /** Response message: only unary and client-stream */
  response?: Res
} & Extension &
  (Type extends CallType.Unary
    ? grpc.ServerUnaryCall<Req, Res> & {
        response: Res
      }
    : {}) &
  (Type extends CallType.ClientStream
    ? TypedOnData<grpc.ServerReadableStream<Req, Res>, Req> & {
        response: Res
      }
    : {}) &
  (Type extends CallType.ServerStream
    ? grpc.ServerWritableStream<Req, Res>
    : {}) &
  (Type extends CallType.Bidi
    ? TypedOnData<grpc.ServerDuplexStream<Req, Res>, Req>
    : {})

/**
 * Call stack of the subsequent middlewares and handlers.
 */
export type NextFn = () => Promise<void>

/**
 * Union of all context types for generic middleware interface
 */
export type ProtoCatAnyCall<Extension = {}> =
  | ProtoCatCall<Extension, Message, Message, CallType.Unary>
  | ProtoCatCall<Extension, Message, Message, CallType.ServerStream>
  | ProtoCatCall<Extension, Message, Message, CallType.ClientStream>
  | ProtoCatCall<Extension, Message, Message, CallType.Bidi>

/**
 * Application generic middleware
 */
export type Middleware<Extension = {}> = (
  call: ProtoCatAnyCall<Extension>,
  next: NextFn
) => any

/**
 * @internal
 */
type MethodDef2CallType<
  M extends grpc.MethodDefinition<any, any>
> = M['requestStream'] extends true
  ? M['responseStream'] extends true
    ? CallType.Bidi
    : CallType.ClientStream
  : M['responseStream'] extends true
  ? CallType.ServerStream
  : CallType.Unary

/**
 * Convert a single method definition to service handler type
 * @internal
 */
type MethodDef2ServiceHandler<
  H,
  Extension = {}
> = H extends grpc.MethodDefinition<infer Req, infer Res>
  ? (
      call: ProtoCatCall<Extension, Req, Res, MethodDef2CallType<H>>,
      next: NextFn
    ) => any
  : never

/**
 * Create service handler type for whole client definition.
 *
 * Useful for better code-splitting
 * ```typescript
 * const unaryHandler: ServiceImplementation<
 *   IGreetingService,
 *   MyContext
 * >['unary'] = call => call.uid
 * ```
 */
export type ServiceImplementation<T, Extension = {}> = RemoveIdxSgn<
  {
    [M in keyof T]: MethodDef2ServiceHandler<T[M], Extension>
  }
>

/** ServiceImplementation with array of middlewares */
export type ServiceImplementationExtended<T, Extension = {}> = {
  [M in keyof ServiceImplementation<T, Extension>]:
    | ServiceImplementation<T, Extension>[M]
    | Array<ServiceImplementation<T, Extension>[M]>
}
