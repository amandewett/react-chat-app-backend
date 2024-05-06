import fs from "fs";
import path from "path";

export class FileService {
  constructor() {}

  uploadFiles(files: any) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const arrAllowedExtensions = [".jpg", ".jpeg", ".png"];
        const allowedFileSize = +process.env.ALLOWED_FILE_SIZE_IN_MB! || 2;

        const fileDir = `./src/public/files`;
        const resFileDir = `./files`;

        if (!fs.existsSync(`./src/public`)) {
          fs.mkdirSync(`./src/public`);
        }

        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir);
        }

        if (Array.isArray(files)) {
          let arrFilePaths = [];
          for (let file of files) {
            const fileSize: string = (+file.size / 1024 / 1024).toFixed(1);
            const fileExt = path.extname(file.name);

            if (
              +fileSize <= allowedFileSize &&
              arrAllowedExtensions.includes(fileExt)
            ) {
              const fileName = `${Date.now()}_${file.name}`;
              const filePath = `${fileDir}/${fileName}`;
              const resFilePath = `${resFileDir}/${fileName}`;

              await file.mv(filePath);
              arrFilePaths.push(resFilePath);
            } else {
              resolve({
                status: false,
                message: `Invalid file type/size`,
              });
            }
          }

          resolve({
            status: true,
            result: arrFilePaths,
          });
        } else {
          const fileSize: string = (+files.size / 1024 / 1024).toFixed(1);
          const fileExt = path.extname(files.name);

          if (
            +fileSize <= allowedFileSize &&
            arrAllowedExtensions.includes(fileExt)
          ) {
            const fileName = `${Date.now()}_${files.name}`;
            const filePath = `${fileDir}/${fileName}`;
            const resFilePath = `${resFileDir}/${fileName}`;

            await files.mv(filePath);
            resolve({
              status: true,
              result: [resFilePath],
            });
          } else {
            resolve({
              status: false,
              message: `Invalid file type/size`,
            });
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  deleteFile(filePath: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const basePath = `./src/public/files/`;
        const fileName = path.basename(filePath);
        filePath = basePath.concat(fileName);

        fs.unlink(filePath, (error) => {
          if (error) {
            resolve({
              status: false,
              message: `No such file or directory`,
            });
          } else {
            resolve({
              status: true,
              message: `File deleted successfully`,
            });
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
