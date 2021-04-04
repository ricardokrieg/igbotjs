export class TooManyRequests extends Error {
  constructor(username: string, error: string) {
    super(`(${username}) Too Many Requests: ${error}`);
  }
}
