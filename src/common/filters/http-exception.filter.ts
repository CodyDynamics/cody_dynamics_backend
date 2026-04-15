import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const payload =
        typeof res === 'string'
          ? { message: res, error: HttpStatus[status] ?? 'Error' }
          : (res as Record<string, unknown>);

      const message = (payload.message ??
        exception.message) as string | string[];
      const error =
        (payload.error as string) ?? HttpStatus[status] ?? 'HttpException';

      const body: ErrorBody = {
        statusCode: status,
        message,
        error,
      };
      response.status(status).json(body);
      return;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({
      statusCode: status,
      message: 'Internal server error',
      error: 'InternalServerError',
    });
  }
}
