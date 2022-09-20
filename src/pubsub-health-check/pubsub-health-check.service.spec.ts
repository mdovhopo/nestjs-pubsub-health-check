import { Topic } from '@google-cloud/pubsub';
import { HealthCheckError } from '@nestjs/terminus';
import { PubSubHealthCheckService } from './pubsub-health-check.service';

describe('PubSubHealthCheckService', () => {
  const requestTimeout = 50;
  const topic1Mock = {
    exists: jest.fn(),
    name: 'topic-1',
  };
  const topic2Mock = {
    exists: jest.fn(),
    name: 'topic-2',
  };

  const pubSubHealthCheckService = new PubSubHealthCheckService({
    topics: [topic1Mock as unknown as Topic, topic2Mock as unknown as Topic],
    timeout: requestTimeout,
  });

  afterEach(() => jest.clearAllMocks());

  it('returns ok if all topics exist', async () => {
    topic1Mock.exists.mockResolvedValue([true]);
    topic2Mock.exists.mockResolvedValue([true]);

    const res = await pubSubHealthCheckService.pingCheck();

    expect(res).toEqual({ pubsub: { status: 'up' } });
  });

  it('fails if it cannot connect to topic1 topic', async () => {
    const timeoutSpy = jest.spyOn(global, 'setTimeout');
    topic1Mock.exists.mockReturnValue(new Promise(() => 0));
    topic2Mock.exists.mockResolvedValue([true]);

    await expect(pubSubHealthCheckService.pingCheck()).rejects.toThrow(
      new HealthCheckError(`${topic1Mock.name}: request timeout`, {
        reason: `${topic1Mock.name}: request timeout`,
      })
    );

    expect(timeoutSpy).toBeCalledWith(expect.any(Function), requestTimeout);
  });

  it('fails if topic1 topic does not exist', async () => {
    topic1Mock.exists.mockResolvedValue([false]);
    topic2Mock.exists.mockResolvedValue([true]);

    await expect(pubSubHealthCheckService.pingCheck()).rejects.toThrow(
      new HealthCheckError(`${topic1Mock.name}: topic does not exist`, {
        reason: `${topic1Mock.name}: topic does not exist`,
      })
    );
  });

  it('fails if it cannot connect to topic2', async () => {
    const timeoutSpy = jest.spyOn(global, 'setTimeout');
    topic1Mock.exists.mockResolvedValue([true]);
    topic2Mock.exists.mockReturnValue(new Promise(() => 0));

    await expect(pubSubHealthCheckService.pingCheck()).rejects.toThrow(
      new HealthCheckError(`${topic2Mock.name}: request timeout`, {
        reason: `${topic2Mock.name}: request timeout`,
      })
    );

    expect(timeoutSpy).toBeCalledWith(expect.any(Function), requestTimeout);
  });

  it('fails if topic 2 does not exist', async () => {
    topic1Mock.exists.mockResolvedValue([true]);
    topic2Mock.exists.mockResolvedValue([false]);

    await expect(pubSubHealthCheckService.pingCheck()).rejects.toThrow(
      new HealthCheckError(`${topic2Mock.name}: topic does not exist`, {
        reason: `${topic2Mock.name}: topic does not exist`,
      })
    );
  });
});
