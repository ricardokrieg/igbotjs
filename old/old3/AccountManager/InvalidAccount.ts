export class InvalidAccount extends Error {
  constructor(username: string) {
    super(`Invalid Account: ${username}. A required param is missing.`);
  }
}
