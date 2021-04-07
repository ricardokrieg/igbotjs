export class FeedbackRequired extends Error {
  constructor(username: string, error: string) {
    super(`(${username}) Feedback Required: ${error}`);
  }
}
