import { composeMiddleware } from '../lib/server/middleware/compose-middleware'
import { Middleware } from '..'

describe('Middleware', () => {
  describe('Compose', () => {
    test('Next chain with sleeps forms a palindrome', async () => {
      // each mdw writes char on start and on end
      const chain = '123456789abcdef'
      let acc = ''
      await composeMiddleware(
        chain.split('').map(
          (char): Middleware => async (call, next) => {
            acc += char
            await new Promise(resolve => setTimeout(resolve, Math.random() * 5))
            await next()
            await new Promise(resolve => setTimeout(resolve, Math.random() * 5))
            acc += char
          }
        )
      )(null as any, () => Promise.resolve())
      // expect correctly closed brackets without overlaps
      expect(acc).toBe(chain + chain.split('').reverse().join(''))
    })
    test('Next implicit when missing', async () => {
      const chain = 'abc'
      let acc = ''
      await composeMiddleware(
        chain.split('').map(
          (char): Middleware => (call, next) => {
            acc += char
          }
        )
      )(null as any, null as any)
      expect(acc).toBe(chain)
    })
    test('Error handling', async () => {
      let lastErr = ''
      const syncError: Middleware = (call, next) => {
        throw new Error('syncError')
      }
      const asyncError: Middleware = (call, next) =>
        Promise.reject(new Error('asyncError'))
      const dud1: Middleware = jest.fn()
      const dud2: Middleware = jest.fn()
      const catcher: Middleware = async (call, next) => {
        lastErr = await next().catch(e => e.message)
      }
      await composeMiddleware([catcher, dud1, syncError, dud2])(
        null as any,
        null as any
      )
      expect(dud1).toHaveBeenCalledTimes(1)
      expect(dud2).toHaveBeenCalledTimes(0)
      expect(lastErr).toBe('syncError')
      await composeMiddleware([catcher, asyncError])(null as any, null as any)
      expect(lastErr).toBe('asyncError')
      await expect(
        composeMiddleware([dud1, syncError])(null as any, null as any)
      ).rejects.toThrow(/syncError/)
    })
  })
})
