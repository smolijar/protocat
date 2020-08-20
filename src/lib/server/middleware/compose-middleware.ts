import { Middleware } from '../call'

export const composeMiddleware = (middleware: Middleware[]): Middleware => {
  return async (call, next) => {
    const dispatch = async (i: number): Promise<void> => {
      // TODO: Maybe throw / log on repeated next
      const fn = i === middleware.length ? next : middleware[i]
      if (!fn) return
      await fn(call, () => dispatch(i + 1))
    }
    await dispatch(0)
  }
}
