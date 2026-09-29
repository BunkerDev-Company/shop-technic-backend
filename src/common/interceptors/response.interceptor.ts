import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as path from 'path';
import { config } from '../../config/app.config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appVersion: string = require(path.resolve(process.cwd(), 'package.json')).version;

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Контроллер уже сам отдал ответ (HTML-превью, скачивание DOCX
        // через @Res()) — конверт не нужен. Иначе рискуем оборачивать сам
        // Response-объект в JSON.
        if (res.headersSent) return data;

        return {
          data,
          responseTime: Date.now() - (req['startTime'] as number ?? Date.now()),
          core:         config.meta.core,
          endpoint:     req.url,
          version:      `${appVersion}, ${config.meta.env}`,
        };
      }),
    );
  }
}
