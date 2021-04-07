export class InvalidResponse extends Error {
  constructor(url: string, statusCode: number) {
    super(`Invalid Response: ${url}, status = ${statusCode}`);
  }
}
