export declare enum TaskMethod {
    Follow = 0,
    Like = 1
}
export declare enum TaskStatus {
    Success = 0,
    Error = 1
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
declare type GetTaskFunc = (taskRequest: TaskRequest) => Promise<Task>;
declare type ConfirmTaskFunc = (taskConfirmation: TaskConfirmation) => Promise<void>;
declare type QuitFunc = () => Promise<void>;
export interface TaskProvider {
    getTask: GetTaskFunc;
    confirmTask: ConfirmTaskFunc;
    quit: QuitFunc;
}
export {};
