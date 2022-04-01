import { ErrorType } from 'types/error.type';

export class ExpressError extends Error implements ErrorType {
  name: string;
  message: string;
  statusCode: number;

  constructor() {
    super();

    this.name = this.constructor.name;
  }
}

export class InvalidBodyError extends ExpressError {
  constructor(key) {
    super();

    this.message = `Invalid request body key "${key}"`;
    this.statusCode = 422;
  }
}
