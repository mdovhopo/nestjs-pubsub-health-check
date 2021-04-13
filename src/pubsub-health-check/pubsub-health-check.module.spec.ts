import {
  createPubSubHealthCheck,
  PubSubHealthCheckModule,
  PubSubHealthCheckSettings,
} from './pubsub-health-check.module';

jest.mock('./pubsub-health-check.service');
import { PubSubHealthCheckService } from './pubsub-health-check.service';
import 'jest-extended';

describe('PubSubHealthCheckModule', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('forRoot', () => {
    it('calls forRootAsync with a factory returning provided settings', () => {
      const settings: PubSubHealthCheckSettings = {
        topics: [],
      };
      const forRootAsyncSpy = jest
        .spyOn(PubSubHealthCheckModule, 'forRootAsync')
        .mockReturnValue({ module: PubSubHealthCheckModule });

      PubSubHealthCheckModule.forRoot(settings);

      expect(forRootAsyncSpy).toBeCalledWith({
        useValue: settings,
      });
    });
  });

  describe('forRootAsync', () => {
    it('creates dynamic module', () => {
      const settings: PubSubHealthCheckSettings = {
        topics: [],
      };

      const settingsFactory = () => settings;

      const mod = PubSubHealthCheckModule.forRootAsync({ inject: [], useFactory: settingsFactory });

      expect(mod).toEqual({
        module: PubSubHealthCheckModule,
        global: true,
        imports: [],
        providers: [
          { provide: PubSubHealthCheckSettings, inject: [], useFactory: settingsFactory },
          {
            provide: PubSubHealthCheckService,
            inject: [PubSubHealthCheckSettings],
            useClass: undefined,
            useExisting: undefined,
            useFactory: expect.toSatisfy((fun) => {
              const pubSubHealthCheckService = fun(settings);

              expect(pubSubHealthCheckService).toBeInstanceOf(PubSubHealthCheckService);
              expect(PubSubHealthCheckService).toBeCalledWith(settings);

              return true;
            }),
          },
        ],
        exports: [PubSubHealthCheckService],
      });
    });
  });

  describe('createPubSubHealthCheck', () => {
    it('fails for invalid timeout', () => {
      expect(() =>
        createPubSubHealthCheck({
          timeout: -1,
          topics: [],
        })
      ).toThrow(new TypeError(`timeout must be an integer, greater then 0, got -1`));
    });
  });
});
