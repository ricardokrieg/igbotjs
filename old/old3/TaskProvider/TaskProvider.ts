export enum TaskMethod {
  Follow,
  Like,
}

export enum TaskStatus {
  Success,
  Error,
}

export interface Tasker {
  username: string;
}

export interface Task {
  id: string;
  username: string;
  method: TaskMethod;
}

export interface TaskRequest {
  tasker: Tasker;
  method?: TaskMethod;
}

export interface TaskConfirmation {
  task: Task;
  status: TaskStatus;
}

type GetTaskFunc = (taskRequest: TaskRequest) => Promise<Task>;
type ConfirmTaskFunc = (taskConfirmation: TaskConfirmation) => Promise<void>;
type QuitFunc = () => Promise<void>;

export interface TaskProvider {
  getTask: GetTaskFunc;
  confirmTask: ConfirmTaskFunc;
  quit: QuitFunc;
}
