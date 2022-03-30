export const filterRequestBody = <T>(validKeys: Array<string>, requestBody: T) => {
  for (const key in requestBody) {
    if (!validKeys.includes(key)) {
      throw new Error(`Invalid request body key "${key}"`);
    }
  }

  return requestBody;
};
