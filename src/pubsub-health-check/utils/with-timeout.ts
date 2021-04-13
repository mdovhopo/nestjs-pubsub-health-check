export async function withTimeout<T>(req: Promise<T>, timeout = 3000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let timeouted = false;
    const timeoutId = setTimeout(() => {
      timeouted = true;
      reject(new Error('request timeout'));
    }, timeout);

    req.then((result) => {
      if (timeouted) {
        return;
      }
      clearTimeout(timeoutId);
      resolve(result);
    });
  });
}
