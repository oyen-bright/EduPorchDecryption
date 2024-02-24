"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var ROOT_LOCATION = "E:\\Works\\EduLearn Data\\dcrpt";
var decryptingFile = false;
var REVERSE_DATA_LENGTH = 1024 * 10;
var filesToDecrypt = [
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
filesToDecrypt.forEach(function (value) {
    decryptFile(value, ROOT_LOCATION);
});
function decryptFileAsAbsolutePath(inputFileFullPath) {
    try {
        var separatorIndex = inputFileFullPath.lastIndexOf(path_1.default.sep);
        var inputFileName = null;
        var filePath = null;
        if (separatorIndex > -1) {
            inputFileName = inputFileFullPath.substring(separatorIndex + 1);
            filePath = inputFileFullPath.substring(0, separatorIndex);
            return decryptFile(inputFileName, filePath);
        }
    }
    catch (exp) {
        console.log(exp);
    }
}
function decryptFile(inputFileName, path) {
    try {
        if (decryptingFile) {
            return "decrypting";
        }
        var dotPos = inputFileName.lastIndexOf(".");
        var outputFilename = inputFileName.substring(0, dotPos) +
            "-dcrpt." +
            inputFileName.substring(dotPos + 1);
        var outputDirName = path + path_1.default.sep + "dcrpt";
        if (!fs_1.default.existsSync(outputDirName)) {
            fs_1.default.mkdirSync(outputDirName, { recursive: true });
            fs_1.default.openSync(outputDirName + path_1.default.sep + ".nomedia", "w");
        }
        var outputFile = outputDirName + path_1.default.sep + outputFilename;
        var inputFile = path + path_1.default.sep + inputFileName;
        if (!fs_1.default.existsSync(inputFile) || fs_1.default.readFileSync(inputFile).length === 0) {
            decryptingFile = false;
            throw "invalid file";
        }
        if (fs_1.default.existsSync(outputFile)) {
            decryptingFile = false;
            console.log("File Already Exists");
            return outputFilename;
        }
        var inputFileLength = fs_1.default.readFileSync(inputFile).length;
        var inputHalfLength = inputFileLength - Math.floor(inputFileLength / 2);
        var _1stHalfLength = inputFileLength - inputHalfLength;
        var _1MB = 1024 * 1024;
        var curPos = inputHalfLength + 18;
        var output1stHalfLength = _1stHalfLength - 36;
        var outputLength = inputFileLength - 64;
        var _REVERSE_DATA_LENGTH = REVERSE_DATA_LENGTH;
        if (outputLength / 2 <= _REVERSE_DATA_LENGTH) {
            _REVERSE_DATA_LENGTH = 512;
        }
        var _1stVolumeRead = 0;
        var _2ndVolumeRead = 0;
        var bufferSize = _1MB;
        fs_1.default.openSync(outputFile, "w");
        var nread = void 0;
        var nextCurPos = curPos;
        var fdw = fs_1.default.openSync(outputFile, "r+");
        var fd = fs_1.default.openSync(inputFile, "r+");
        while (_1stVolumeRead < _1stHalfLength) {
            bufferSize = Math.floor(output1stHalfLength - _1stVolumeRead > _1MB
                ? _1MB
                : output1stHalfLength - _1stVolumeRead);
            if (bufferSize === 0) {
                break;
            }
            var buffer_1 = Buffer.alloc(bufferSize);
            nread = fs_1.default.readSync(fd, buffer_1, 0, buffer_1.length, nextCurPos);
            fs_1.default.writeSync(fdw, buffer_1, 0, buffer_1.length);
            nextCurPos += bufferSize;
            _1stVolumeRead += buffer_1.length;
        }
        var output2ndHalf1stLength = inputHalfLength - _REVERSE_DATA_LENGTH + 18;
        curPos = 18;
        nextCurPos = curPos;
        while (_2ndVolumeRead < output2ndHalf1stLength) {
            bufferSize = Math.floor(output2ndHalf1stLength - _2ndVolumeRead > _1MB
                ? _1MB
                : output2ndHalf1stLength - _2ndVolumeRead);
            if (bufferSize === 0) {
                break;
            }
            var buffer_2 = Buffer.alloc(bufferSize);
            nread = fs_1.default.readSync(fd, buffer_2, 0, buffer_2.length, nextCurPos);
            nextCurPos += bufferSize;
            if (nread !== 0) {
                _2ndVolumeRead += buffer_2.length;
            }
            fs_1.default.writeSync(fdw, buffer_2, 0, buffer_2.length);
        }
        bufferSize = _REVERSE_DATA_LENGTH + 36;
        var buffer = Buffer.alloc(bufferSize);
        nread = fs_1.default.readSync(fd, buffer, 0, buffer.length, nextCurPos);
        if (nread !== 0) {
            for (var i = 0; i < Math.floor(buffer.length) / 2; i++) {
                var j = buffer.length - 1 - i;
                if (i !== j) {
                    var temp = buffer[i];
                    buffer[i] = buffer[j];
                    buffer[j] = temp;
                }
            }
            fs_1.default.writeSync(fdw, buffer, 72, nread - 19 - 71);
        }
        fs_1.default.closeSync(fdw);
        fs_1.default.closeSync(fd);
    }
    catch (error) {
        console.log(error);
        return;
    }
}
