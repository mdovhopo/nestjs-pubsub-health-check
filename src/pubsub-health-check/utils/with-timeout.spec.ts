import { withTimeout } from './with-timeout';

const wait = (delay: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), delay));

describe('withTimeout', () => {
  afterEach(() => jest.clearAllMocks());

  describe('promise resolves before timeout', () => {
    test('default timeout', async () => {
      const data = { a: 42 };
      const createPromise = async () => {
        await wait(100);
        return data;
      };
      await expect(withTimeout(createPromise())).resolves.toEqual(data);
    });

    test('custom timeout', async () => {
      const data = { a: 42 };
      const createPromise = async () => {
        await wait(100);
        return data;
      };
      await expect(withTimeout(createPromise(), 1000)).resolves.toEqual(data);
    });

    it('cleans up timeout', async () => {
      const data = { a: 42 };
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const createPromise = async () => {
        await wait(100);
        return data;
      };
      await expect(withTimeout(createPromise(), 300)).resolves.toEqual(data);
      await wait(500);
      expect(clearTimeoutSpy).toBeCalled();
    });
  });

  describe('promise resolves after timeout', () => {
    test('default timeout', async () => {
      const data = { a: 42 };
      const createPromise = async () => {
        await wait(4000);
        return data;
      };
      await expect(withTimeout(createPromise())).rejects.toThrow('request timeout');
    });

    test('custom timeout', async () => {
      const data = { a: 42 };
      const createPromise = async () => {
        await wait(300);
        return data;
      };
      await expect(withTimeout(createPromise(), 100)).rejects.toThrow('request timeout');
    });

    it('does not resolve original promise, if timeouted', async () => {
      const data = { a: 42 };
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const createPromise = async () => {
        await wait(300);
        return data;
      };
      await expect(withTimeout(createPromise(), 100)).rejects.toThrow('request timeout');
      await wait(500);
      expect(clearTimeoutSpy).toBeCalledTimes(0);
    });
  });
});
