import fs, {WriteStream} from 'fs';

export class File {
  file: WriteStream;

  constructor(path: string) {
    this.file = fs.createWriteStream(path, { flags: 'a' });
  }

  append(text: string): void {
    this.file.write(text);
  }
}
