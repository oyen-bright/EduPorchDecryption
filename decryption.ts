import fs from "fs";
import Path from "path";

const ROOT_LOCATION: string = "E:\\Works\\EduLearn Data\\dcrpt";

let decryptingFile: boolean = false;

const REVERSE_DATA_LENGTH: number = 1024 * 10;

const filesToDecrypt: string[] = [
  "mat-1434008705-biqhyt.mp3",
  "mat-1434364200-zkebhc.mp3",
  "mat-1434364347-rogzoo.mp3",
  "mat-1449083805-fjdzhn.pdf",
  "mat-1449146071-wzdvqq.pdf",
  "mat-1449146283-oojusk.pdf",
  "mat-1449146981-wghkjy.pdf",
  "mat-1449147581-xmnjyw.pdf",
  "mat-1449414246-ildqsi.avi",
  "mat-1449487345-rhezks.mp4",
  "mat-1449488989-hwrtdt.mp4",
  "mat-1449489154-eldqww.mp4",
];

filesToDecrypt.forEach((value: string) => {
  decryptFile(value, ROOT_LOCATION);
});

function decryptFileAsAbsolutePath(inputFileFullPath: string): string | undefined {
  try {
    const separatorIndex: number = inputFileFullPath.lastIndexOf(Path.sep);
    let inputFileName: string | null = null;
    let filePath: string | null = null;
    if (separatorIndex > -1) {
      inputFileName = inputFileFullPath.substring(separatorIndex + 1);
      filePath = inputFileFullPath.substring(0, separatorIndex);
      return decryptFile(inputFileName, filePath);
    }
  } catch (exp: any) {
    console.log(exp);
  }
}

function decryptFile(inputFileName: string, path: string): string | undefined {
  try {
    if (decryptingFile) {
      return "decrypting";
    }

    const dotPos: number = inputFileName.lastIndexOf(".");
    const outputFilename: string =
      inputFileName.substring(0, dotPos) +
      "-dcrpt." +
      inputFileName.substring(dotPos + 1);

    const outputDirName: string = path + Path.sep + "dcrpt";
    if (!fs.existsSync(outputDirName)) {
      fs.mkdirSync(outputDirName, { recursive: true });
      fs.openSync(outputDirName + Path.sep + ".nomedia", "w");
    }

    const outputFile: string = outputDirName + Path.sep + outputFilename;
    const inputFile: string = path + Path.sep + inputFileName;

    if (!fs.existsSync(inputFile) || fs.readFileSync(inputFile).length === 0) {
      decryptingFile = false;
      throw "invalid file";
    }
    if (fs.existsSync(outputFile)) {
      decryptingFile = false;
      console.log("File Already Exists");
      return outputFilename;
    }

    const inputFileLength: number = fs.readFileSync(inputFile).length;
    const inputHalfLength: number = inputFileLength - Math.floor(inputFileLength / 2);
    const _1stHalfLength: number = inputFileLength - inputHalfLength;
    const _1MB: number = 1024 * 1024;

    let curPos: number = inputHalfLength + 18;
    const output1stHalfLength: number = _1stHalfLength - 36;
    const outputLength: number = inputFileLength - 64;
    let _REVERSE_DATA_LENGTH: number = REVERSE_DATA_LENGTH;

    if (outputLength / 2 <= _REVERSE_DATA_LENGTH) {
      _REVERSE_DATA_LENGTH = 512;
    }

    let _1stVolumeRead: number = 0;
    let _2ndVolumeRead: number = 0;
    let bufferSize: number = _1MB;
    fs.openSync(outputFile, "w");

    let nread: number;
    let nextCurPos: number = curPos;
    const fdw: number = fs.openSync(outputFile, "r+");
    const fd = fs.openSync(inputFile,"r+");

    while (_1stVolumeRead < _1stHalfLength) {
      bufferSize = Math.floor(
        output1stHalfLength - _1stVolumeRead > _1MB
          ? _1MB
          : output1stHalfLength - _1stVolumeRead
      );

      if (bufferSize === 0) {
        break;
      }

      const buffer: Buffer = Buffer.alloc(bufferSize);

      nread = fs.readSync(fd, buffer, 0, buffer.length, nextCurPos);
      fs.writeSync(fdw, buffer, 0, buffer.length);

      nextCurPos += bufferSize;

      _1stVolumeRead += buffer.length;
    }

    const output2ndHalf1stLength: number = inputHalfLength - _REVERSE_DATA_LENGTH + 18;
    curPos = 18;
    nextCurPos = curPos;

    while (_2ndVolumeRead < output2ndHalf1stLength) {
      bufferSize = Math.floor(
        output2ndHalf1stLength - _2ndVolumeRead > _1MB
          ? _1MB
          : output2ndHalf1stLength - _2ndVolumeRead
      );

      if (bufferSize === 0) {
        break;
      }

      const buffer: Buffer = Buffer.alloc(bufferSize);

      nread = fs.readSync(fd, buffer, 0, buffer.length, nextCurPos);

      nextCurPos += bufferSize;

      if (nread !== 0) {
        _2ndVolumeRead += buffer.length;
      }

      fs.writeSync(fdw, buffer, 0, buffer.length);
    }
    bufferSize = _REVERSE_DATA_LENGTH + 36;
    const buffer: Buffer = Buffer.alloc(bufferSize);

    nread = fs.readSync(fd, buffer, 0, buffer.length, nextCurPos);
    if (nread !== 0) {
      for (let i = 0; i < Math.floor(buffer.length) / 2; i++) {
        const j: number = buffer.length - 1 - i;

        if (i !== j) {
          const temp: number = buffer[i];
          buffer[i] = buffer[j];
          buffer[j] = temp;
        }
      }
      fs.writeSync(fdw, buffer, 72, nread - 19 - 71);
    }

    fs.closeSync(fdw);
    fs.closeSync(fd);
  } catch (error: any) {
    console.log(error);
    return;
  }
}
