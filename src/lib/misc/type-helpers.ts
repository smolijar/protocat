import { EventEmitter } from 'events'

// List object keys without index signatures
// KnownKeys<{ [index: string]: string; foo: string }> = 'foo'
type KnownKeys<T> = ({
  [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U }
  ? U
  : never) &
  keyof T

// List keys with never value
type NeverKeys<T> = ({
  [K in keyof T]: T[K] extends never ? never : K
} extends { [_ in keyof T]: infer U }
  ? U
  : never) &
  keyof T

// Remove index signature keys from object
// RemoveIdxSgn<{ [index: string]: string; foo: string }> = { foo: string }
export type RemoveIdxSgn<T> = Pick<T, KnownKeys<T>>
// Omit never value keys from object
export type OmitNeverKeys<T> = Pick<T, NeverKeys<T>>

/* eslint-disable @typescript-eslint/method-signature-style */
export type TypedOnData<E extends EventEmitter, T> = Omit<E, 'on'> & {
  on(event: 'close', listener: () => void): E
  on(event: 'data', listener: (chunk: T) => void): E
  on(event: 'end', listener: () => void): E
  on(event: 'error', listener: (err: Error) => void): E
  on(event: 'pause', listener: () => void): E
  on(event: 'readable', listener: () => void): E
  on(event: 'resume', listener: () => void): E
  on(event: string | symbol, listener: (...args: any[]) => void): E
}
