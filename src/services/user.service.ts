import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
import bcrypt from "bcrypt";
import jsonWebToken from "jsonwebtoken";
import { Roles } from "../enums/enums";

export class UserService {
  constructor() {}

  signup(name: string, email: string, password: string, profilePicture?: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
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
              await prismaClient.user.create({
                data: {
                  email: email,
                  name: name,
                  password: hashedPassword.result,
                  profilePicture: profilePicture,
                },
              });
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
              message: `User created successfully`,
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
        const user: any = await prismaClient.user.findFirst({
          where: {
            email: email,
          },
        });

        if (user) {
          //compare password
          const isPasswordValid: any = await this.compareHashString(password, user.password);

          if (isPasswordValid.status) {
            const jwt = jsonWebToken.sign(
              {
                id: user.id,
                email: user.email,
                role: Roles.User,
              },
              process.env.JWT_SECRET || "monday",
              {
                expiresIn: "2 days",
              }
            );

            user["token"] = jwt;
            const { password, chatIDs, ...result } = user;
            resolve({
              status: true,
              message: `Login successful`,
              result,
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

  getUserList(userId: string, searchKeyword?: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        searchKeyword = searchKeyword && searchKeyword !== "" ? searchKeyword.toLowerCase() : "";
        const users = await prismaClient.user.findMany({
          where:
            searchKeyword !== ""
              ? {
                  NOT: { id: userId },
                  AND: [
                    {
                      OR: [
                        {
                          name: { contains: searchKeyword, mode: "insensitive" },
                        },
                        {
                          email: { contains: searchKeyword, mode: "insensitive" },
                        },
                      ],
                    },
                  ],
                }
              : {
                  NOT: { id: userId },
                },
        });

        const modifiedUsers = users.map((user) => {
          const { password, chatIDs, ...result } = user;
          return result;
        });

        resolve({
          status: true,
          result: modifiedUsers,
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  getUserDetails(userId: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const user = await prismaClient.user.findUnique({
          where: {
            id: userId,
          },
        });
        if (user) {
          const { password, chatIDs, ...rest } = user;
          resolve({
            status: true,
            result: rest,
          });
        } else {
          resolve({
            status: false,
            message: `User doesn't exists`,
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}
