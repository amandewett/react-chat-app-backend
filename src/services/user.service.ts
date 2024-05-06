import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
import bcrypt from "bcrypt";
import { profile } from "console";
import jsonWebToken from "jsonwebtoken";
import path from "path";
import fs from "fs";

export class UserService {
  constructor() {}

  signup(name: string, email: string, password: string, profilePicture?: any) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const arrAllowedExtensions = [".jpg", ".jpeg", ".png"];
        const allowedFileSize = +process.env.ALLOWED_FILE_SIZE_IN_MB! || 2;
        if (!name || !email || !password) {
          resolve({
            status: false,
            message: `Invalid inputs`,
          });
        }

        //check if use already exists
        const user = await prismaClient.user.findFirst({
          where: {
            email: email,
          },
        });

        if (user) {
          resolve({
            status: false,
            message: `Email already exists`,
          });
        } else {
          // get hashed password
          const hashedPassword: any = await this.getHashString(password);

          if (hashedPassword.status) {
            //check if profile picture exists
            if (profilePicture) {
              const fileDir = `./src/public/profilePictures`;
              const resFileDir = `./profilePictures`;

              if (!fs.existsSync(`./src/public`)) {
                fs.mkdirSync(`./src/public`);
              }

              if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir);
              }

              // console.log(JSON.stringify(profilePicture));
              const fileSize: string = (
                +profilePicture.size /
                1024 /
                1024
              ).toFixed(1);

              const fileExt = path.extname(profilePicture.name);
              if (
                +fileSize <= allowedFileSize &&
                arrAllowedExtensions.includes(fileExt)
              ) {
                const fileName = `${Date.now()}_${profilePicture.name}`;
                const filePath = `${fileDir}/${fileName}`;
                const resFilePath = `${resFileDir}/${fileName}`;
                await profilePicture.mv(filePath);

                await prismaClient.user.create({
                  data: {
                    email: email,
                    name: name,
                    password: hashedPassword.result,
                    profilePicture: resFilePath,
                  },
                });
              } else {
                resolve({
                  status: false,
                  message: `Invalid profile picture`,
                });
              }
            } else {
              await prismaClient.user.create({
                data: {
                  email: email,
                  name: name,
                  password: hashedPassword.result,
                },
              });
            }

            resolve({
              status: true,
              password: `User created successfully`,
            });
          } else {
            resolve(hashedPassword);
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  login(email: string, password: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        //check if user exists
        const user = await prismaClient.user.findFirst({
          where: {
            email: email,
          },
        });

        if (user) {
          //compare password
          const isPasswordValid: any = await this.compareHashString(
            password,
            user.password
          );

          if (isPasswordValid.status) {
            const jwt = jsonWebToken.sign(
              {
                _id: user.id,
                email: user.email,
              },
              process.env.JWT_SECRET || "monday",
              {
                expiresIn: "2 days",
              }
            );

            const { password, createdAt, updatedAt, ...result } = user;
            resolve({
              status: true,
              message: `Login successful`,
              result,
              token: jwt,
            });
          } else {
            resolve({
              status: false,
              message: `Invalid credentials`,
            });
          }
        } else {
          resolve({
            status: false,
            message: `Invalid credentials`,
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  getHashString(input: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        bcrypt.hash(input, 10, async (err, hashedString) => {
          if (err) {
            console.log(err);
            resolve({
              status: false,
              message: err.message,
            });
          } else {
            resolve({
              status: true,
              result: hashedString,
            });
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  compareHashString(string: string, hashString: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        bcrypt.compare(string, hashString, async (err, isVerified) => {
          if (err) {
            resolve({
              status: false,
              message: err.message,
            });
          } else {
            if (isVerified) {
              resolve({
                status: true,
                message: `Success`,
              });
            } else {
              resolve({
                status: false,
                message: "Invalid password",
              });
            }
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
