import { Topic } from '@google-cloud/pubsub';
import { HealthCheckError } from '@nestjs/terminus';
import { PubSubHealthCheckService } from './pubsub-health-check.service';

describe('PubSubHealthCheckService', () => {
  const requestTimeout = 50;
  const hydraIntegrationTopicMock = {
    exists: jest.fn(),
    name: 'hydra-topic',
  };
  const dasSyncWorkerTopicMock = {
    exists: jest.fn(),
    name: 'das-worker',
  };

  const pubSubHealthCheckService = new PubSubHealthCheckService({
    topics: [
      (hydraIntegrationTopicMock as unknown) as Topic,
      (dasSyncWorkerTopicMock as unknown) as Topic,
    ],
    timeout: requestTimeout,
  });

  afterEach(() => jest.clearAllMocks());

  it('returns ok if all topics exist', async () => {
    hydraIntegrationTopicMock.exists.mockResolvedValue([true]);
    dasSyncWorkerTopicMock.exists.mockResolvedValue([true]);

    const res = await pubSubHealthCheckService.pingCheck();

    expect(res).toEqual({ pubsub: { status: 'up' } });
  });

  it('fails if it cannot connect to hydra topic', async () => {
    const timeoutSpy = jest.spyOn(global, 'setTimeout');
    hydraIntegrationTopicMock.exists.mockReturnValue(new Promise(() => 0));
    dasSyncWorkerTopicMock.exists.mockResolvedValue([true]);

    await expect(pubSubHealthCheckService.pingCheck()).rejects.toThrow(
      new HealthCheckError(`${hydraIntegrationTopicMock.name}: request timeout`, {
        reason: `${hydraIntegrationTopicMock.name}: request timeout`,
      })
    );

    expect(timeoutSpy).toBeCalledWith(expect.any(Function), requestTimeout);
  });

  it('fails if hydra topic does not exist', async () => {
    hydraIntegrationTopicMock.exists.mockResolvedValue([false]);
    dasSyncWorkerTopicMock.exists.mockResolvedValue([true]);

    await expect(pubSubHealthCheckService.pingCheck()).rejects.toThrow(
      new HealthCheckError(`${hydraIntegrationTopicMock.name}: topic does not exist`, {
        reason: `${hydraIntegrationTopicMock.name}: topic does not exist`,
      })
    );
  });

  it('fails if it cannot connect to das topic', async () => {
    const timeoutSpy = jest.spyOn(global, 'setTimeout');
    hydraIntegrationTopicMock.exists.mockResolvedValue([true]);
    dasSyncWorkerTopicMock.exists.mockReturnValue(new Promise(() => 0));

    await expect(pubSubHealthCheckService.pingCheck()).rejects.toThrow(
      new HealthCheckError(`${dasSyncWorkerTopicMock.name}: request timeout`, {
        reason: `${dasSyncWorkerTopicMock.name}: request timeout`,
      })
    );

    expect(timeoutSpy).toBeCalledWith(expect.any(Function), requestTimeout);
  });

  it('fails if das topic does not exist', async () => {
    hydraIntegrationTopicMock.exists.mockResolvedValue([true]);
    dasSyncWorkerTopicMock.exists.mockResolvedValue([false]);

    await expect(pubSubHealthCheckService.pingCheck()).rejects.toThrow(
      new HealthCheckError(`${dasSyncWorkerTopicMock.name}: topic does not exist`, {
        reason: `${dasSyncWorkerTopicMock.name}: topic does not exist`,
      })
    );
  });
});
