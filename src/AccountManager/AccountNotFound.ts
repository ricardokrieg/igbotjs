export class AccountNotFound extends Error {
  constructor(username: string) {
    super(`Account Not Found: ${username}`);
  }
}
