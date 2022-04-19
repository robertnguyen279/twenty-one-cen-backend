import { ErrorType } from 'types/error.type';

export class ExpressError extends Error implements ErrorType {
  name: string;
  message: string;
  statusCode: number;
}

export class UnprocesableError extends ExpressError {
  constructor() {
    super();

    this.statusCode = 422;
    this.name = 'UnprocesableError';
  }
}

export class InvalidBodyError extends UnprocesableError {
  constructor(key) {
    super();

    this.message = `Invalid request body "${key}"`;
    this.name = 'InvalidBodyError';
  }
}

export class UnavailableError extends ExpressError {
  constructor(key) {
    super();

    this.message = `${key} not available`;
    this.name = 'UnavailableError';
    this.statusCode = 404;
  }
}

export class InvalidQueryError extends UnprocesableError {
  constructor(key) {
    super();

    this.message = `Invalid request query "${key}"`;
    this.name = 'InvalidQueryError';
  }
}

export class NotFoundError extends ExpressError {
  constructor(key) {
    super();

    this.message = `${key} not found`;
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ForbiddenError extends ExpressError {
  constructor() {
    super();

    this.message = 'You are not authorized';
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

export class UnauthorizedError extends ExpressError {
  constructor() {
    super();

    this.message = 'You are not authorized';
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

export class MissingRequestBodyError extends UnprocesableError {
  constructor(key) {
    super();

    this.message = `Missing requst body key "${key}"`;
    this.name = 'MissingRequestBodyError';
    this.statusCode = 422;
  }
}

export class WrongPasswordError extends ForbiddenError {
  constructor() {
    super();

    this.message = 'Wrong password';
    this.name = 'WrongPasswordError';
  }
}
