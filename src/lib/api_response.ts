import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

export default class ApiResponse {
  constructor(private readonly reply: Response) {}

  private getErrorMessage = (exception: unknown): string => {
    return String(exception);
  };

  public error(err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new InternalServerErrorException(err.message);
    }
  }

  public handle(message: string, result: any, status: number = HttpStatus.OK) {
    return this.reply.status(status).json({
      message,
      status,
      result,
    });
  }
}
