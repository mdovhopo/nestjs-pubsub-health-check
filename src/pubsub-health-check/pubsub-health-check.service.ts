import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { Topic } from '@google-cloud/pubsub';
import { withTimeout } from './utils/with-timeout';
import { PubSubHealthCheckSettings } from './pubsub-health-check.module';

@Injectable()
export class PubSubHealthCheckService extends HealthIndicator {
  getHealthStatus(isHealthy: boolean, data?: { [p: string]: string }): HealthIndicatorResult {
    return this.getStatus(this.settings.healthCheckKey || 'pubsub', isHealthy, data);
  }

  constructor(@Inject(PubSubHealthCheckSettings) private settings: PubSubHealthCheckSettings) {
    super();
  }

  async checkTopic(topic: Topic): Promise<void> {
    const [exists] = await withTimeout(topic.exists(), this.settings.timeout).catch((e) => [
      this.throwHealthCheckError(`${topic.name}: ${e.message}`),
    ]);
    if (!exists) {
      this.throwHealthCheckError(`${topic.name}: topic does not exist`);
    }
  }

  async pingCheck(): Promise<HealthIndicatorResult> {
    await Promise.all(this.settings.topics.map((t) => this.checkTopic(t)));
    return this.getHealthStatus(true);
  }

  private throwHealthCheckError(reason: string): void {
    throw new HealthCheckError(
      reason,
      this.getHealthStatus(false, {
        reason: reason,
      })
    );
  }
}
