import { InvalidBodyError } from 'models/error.model';

export const filterRequestBody = <T>(validKeys: Array<string>, requestBody: T) => {
  for (const key in requestBody) {
    if (!validKeys.includes(key)) {
      throw new InvalidBodyError(key);
    }
  }

  return requestBody;
};
