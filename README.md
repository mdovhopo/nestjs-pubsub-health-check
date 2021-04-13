# nestjs-pubsub-health-check

[![Deploy](https://github.com/mdovhopo/nestjs-pubsub-health-check/workflows/Deploy/badge.svg)](https://github.com/mdovhopo/nestjs-pubsub-health-check/actions)
[![Coverage Status](https://coveralls.io/repos/github/mdovhopo/nestjs-pubsub-health-check/badge.svg?branch=master)](https://coveralls.io/github/mdovhopo/nestjs-pubsub-health-check?branch=master)

Nest module, that checks health of PubSub module

## How it works

Module uses @nestjs/terminus health-check, and this module intended to be used with it.
Module tries to check if topic exists (by calling `exists` function on each passed topic).
Also, you need to grant `roles/pubsub.viewer` role to your application, (or any role that contains this),
to access topic info.

## Usage

Installation:

```sh
npm i @tricky-max/nestjs-pubsub-health-check
```

```js
@Module({
   imports: [
     PubSubHealthCheckModule.forRootAsync({
       inject: [PubSubService],
       useFactory: (ps: PubSubService) => ({
          topics: [ps.topic],
          timeout: 5000, // optional
          healthCheckKey: 'pubsub' // optional
       }),
     ),
     SomeModule,
   ],
 })
 export class AppModule {}
 ```

And in you HealthCheck module just call

```js
    // this.health - HealthCheckService from @nestjs/termius
    this.health.check([
        async () => this.pubSubHealthCheckModule.pingCheck(),
    ]);
```

Bootstrapped with: [create-ts-lib-gh](https://github.com/glebbash/create-ts-lib-gh)

This project is [Mit Licensed](LICENSE).
