/** Call types aligned with grpc core library */
export enum CallType {
  Bidi = 'bidi',
  ServerStream = 'serverStream',
  ClientStream = 'clientStream',
  Unary = 'unary',
}

/** Assign call type from generated definition */
export const stubToType = (
  s: Record<'responseStream' | 'requestStream', boolean>
) =>
  s.responseStream
    ? s.requestStream
      ? CallType.Bidi
      : CallType.ServerStream
    : s.requestStream
    ? CallType.ClientStream
    : CallType.Unary
