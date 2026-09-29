import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { config } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api/v1');

  // Stamp every request with a start time (для responseTime в конверте)
  app.use((req: any, _res: any, next: () => void) => {
    req['startTime'] = Date.now();
    next();
  });

  app.useGlobalInterceptors(
    new ResponseInterceptor(), // wraps { data, responseTime, core, endpoint, version }
  );

  await app.listen(config.port);
  console.log(`API: http://localhost:${config.port}/api/v1/products`);
}

bootstrap();
