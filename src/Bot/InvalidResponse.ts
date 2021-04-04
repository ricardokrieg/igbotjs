export class InvalidResponse extends Error {
  constructor(username: string, statusCode: number) {
    super(`Invalid Response: ${username}, status = ${statusCode}`);
  }
}
