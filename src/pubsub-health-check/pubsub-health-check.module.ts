import { DynamicModule, ForwardReference, Module, Provider, Type } from '@nestjs/common';
import { Topic } from '@google-cloud/pubsub';
import { PubSubHealthCheckService } from './pubsub-health-check.service';

export const PubSubHealthCheckSettings = Symbol('PubSubHealthCheckSettings');
export type PubSubHealthCheckSettings = {
  topics: Array<Topic>;
  timeout?: number;
  healthCheckKey?: string;
};

export type PubSubHealthCheckModuleOptions = Provider<PubSubHealthCheckSettings> & {
  imports?: Array<Type | DynamicModule | Promise<DynamicModule> | ForwardReference>;
};

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
    } as PubSubHealthCheckModuleOptions);
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

  static forRootAsync(options: Omit<PubSubHealthCheckModuleOptions, 'provide'>): DynamicModule {
    const { imports = [], ...restOptions } = options;
    return {
      module: PubSubHealthCheckModule,
      global: true,
      imports,
      providers: [
        {
          ...restOptions,
          provide: PubSubHealthCheckSettings,
        } as PubSubHealthCheckModuleOptions,
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
