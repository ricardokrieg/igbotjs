/// <reference types="node" />
import { WriteStream } from 'fs';
export declare class File {
    file: WriteStream;
    constructor(path: string);
    append(text: string): void;
}
