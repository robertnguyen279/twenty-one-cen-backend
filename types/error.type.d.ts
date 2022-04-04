export interface ErrorType {
  name: string;
  statusCode?: number;
  message: string;
  _message?: string;
  error?: any;
}
