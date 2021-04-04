import {TaskRequest} from './TaskProvider';

export class NoTask extends Error {
  constructor(taskRequest: TaskRequest) {
    super(`No more tasks available for ${taskRequest.tasker.username}`);
  }
}
