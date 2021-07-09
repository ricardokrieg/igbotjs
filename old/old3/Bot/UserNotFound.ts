export class UserNotFound extends Error {
  constructor(username: string, error: string) {
    super(`(${username}) User Not Found: ${error}`);
  }
}
