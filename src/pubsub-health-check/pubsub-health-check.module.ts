import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { Topic } from '@google-cloud/pubsub';
import { PubSubHealthCheckService } from './pubsub-health-check.service';

export const PubSubHealthCheckSettings = Symbol('PubSubHealthCheckSettings');
export type PubSubHealthCheckSettings = {
  topics: Array<Topic>;
  timeout?: number;
  healthCheckKey?: string;
};

export interface PubSubHealthCheckAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<PubSubHealthCheckSettings>;
  useClass?: Type<PubSubHealthCheckSettings>;
  useValue?: PubSubHealthCheckSettings;
  useFactory?: (...args: any[]) => Promise<PubSubHealthCheckSettings> | PubSubHealthCheckSettings;
  inject?: any[];
}

@Module({})
export class PubSubHealthCheckModule {
  /**
   * Example:
   * ```js
   * @Module({
   *   imports: [
   *     PubSubHealthCheckModule.forRoot({
   *        topics: [topic1, topic2],
   *        timeout: 5000, // optional
   *        healthCheckKey: 'pubsub' // optional
   *     ),
   *     SomeModule,
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(options: PubSubHealthCheckSettings): DynamicModule {
    return PubSubHealthCheckModule.forRootAsync({
      useValue: options,
    });
  }

  /**
   * Example:
   * ```
   * @Module({
   *   imports: [
   *     PubSubHealthCheckModule.forRootAsync({
   *       inject: [PubSubService],
   *       useFactory: (ps: PubSubService) => ({
   *          topics: [ps.topic],
   *          timeout: 5000, // optional
   *          healthCheckKey: 'pubsub' // optional
   *       }),
   *     ),
   *     SomeModule,
   *   ],
   * })
   * export class AppModule {}
   * ```
   */

  static forRootAsync(options: PubSubHealthCheckAsyncOptions): DynamicModule {
    const { imports = [], useClass, useFactory, useExisting, inject } = options;
    return {
      module: PubSubHealthCheckModule,
      global: true,
      imports,
      providers: [
        {
          inject,
          useClass,
          useFactory,
          useExisting,
          provide: PubSubHealthCheckSettings,
        },
        {
          provide: PubSubHealthCheckService,
          inject: [PubSubHealthCheckSettings],
          useFactory: createPubSubHealthCheck,
        },
      ],
      exports: [PubSubHealthCheckService],
    };
  }
}

export function createPubSubHealthCheck(
  settings: PubSubHealthCheckSettings
): PubSubHealthCheckService {
  if (settings.timeout && settings.timeout <= 0) {
    throw new TypeError(`timeout must be an integer, greater then 0, got ${settings.timeout}`);
  }
  return new PubSubHealthCheckService(settings);
}
