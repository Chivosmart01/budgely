import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = res.message || res.error || message;
        code = res.code || (status === 404 ? 'NOT_FOUND' : status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 409 ? 'CONFLICT' : 'BAD_REQUEST');
        if (Array.isArray(res.message)) {
          errors = res.message;
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
        }
      }
    } else {
      this.logger.error('Unhandled Exception:', exception);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
