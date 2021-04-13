import { withTimeout } from './src/pubsub-health-check/utils/with-timeout';

const wait = (delay: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), delay));

async function main() {
  const data = { a: 42 };

  const createPromise = async () => {
    console.log('createPromise');
    await wait(1000);
    console.log('delay createPromise');
    return data;
  };

  console.log(withTimeout(createPromise(), 100));
}

main();
