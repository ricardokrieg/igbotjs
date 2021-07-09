import { TaskRequest } from './TaskProvider';
export declare class NoTask extends Error {
    constructor(taskRequest: TaskRequest);
}
