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

    this.message = `Invalid request body "${key}"`;
    this.statusCode = 422;
  }
}

export class UnavailableError extends ExpressError {
  constructor(key) {
    super();

    this.message = `${key} not available`;
    this.statusCode = 422;
  }
}

export class InvalidQueryError extends InvalidBodyError {
  constructor(key) {
    super(key);

    this.message = `Invalid request query "${key}"`;
  }
}

export class NotFoundError extends ExpressError {
  constructor(key) {
    super();

    this.message = `${key} not found`;
    this.statusCode = 404;
  }
}

export class ForbiddenError extends ExpressError {
  constructor() {
    super();

    this.message = 'You are not authorized';
    this.statusCode = 403;
  }
}

export class UnauthorizedError extends ExpressError {
  constructor() {
    super();

    this.message = 'You are not authorized';
    this.statusCode = 401;
  }
}

export class MissingRequestBodyError extends ExpressError {
  constructor(key) {
    super();

    this.message = `Missing requst body key "${key}"`;
    this.statusCode = 422;
  }
}
