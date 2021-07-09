export class TooManyRequests extends Error {
  constructor(url: string, error: string) {
    super(`(${url}) Too Many Requests: ${error}`);
  }
}
