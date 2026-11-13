import { buildApp } from './app.js';
import { env } from './config/env.js';

buildApp()
  .then((app) => app.listen({ port: env.PORT, host: env.HOST }))
  .then((address) => {
    console.log(`RAVENDORA backend listening at ${address}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
