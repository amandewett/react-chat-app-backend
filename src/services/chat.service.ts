import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();
import { UserService } from "./user.service";
import { populate } from "dotenv";
const userService = new UserService();

export class ChatService {
  constructor() {}

  createNewChat(senderId: string, senderName: string, receiverId: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        //check if chat exists with the receiver
        const chat = await prismaClient.chat.findFirst({
          where: {
            NOT: {
              isGroupChat: true,
            },
            AND: [
              {
                participantIDs: {
                  hasEvery: [senderId, receiverId],
                },
              },
            ],
          },
          include: {
            participants: {
              select: {
                name: true,
                email: true,
                id: true,
                profilePicture: true,
              },
            },
          },
        });

        if (chat) {
          //chat already exists
          resolve({
            status: true,
            result: chat,
          });
        } else {
          //create new chat
          const newChat = await prismaClient.chat.create({
            data: {
              chatName: senderName,
              isGroupChat: false,
              participantIDs: [senderId, receiverId],
            },
          });

          const chatDetails = await prismaClient.chat.findUnique({
            where: {
              id: newChat.id,
            },
            include: {
              participants: {
                select: {
                  name: true,
                  email: true,
                  id: true,
                  profilePicture: true,
                },
              },
            },
          });

          if (chatDetails) {
            resolve({
              status: true,
              result: chatDetails,
            });
          } else {
            resolve({
              status: false,
              message: `Cannot find the chat`,
            });
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  getAllUserChats(userId: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const chats = await prismaClient.chat.findMany({
          where: {
            participantIDs: {
              has: userId,
            },
          },
          include: {
            participants: {
              select: {
                name: true,
                email: true,
                id: true,
                profilePicture: true,
              },
            },
          },
        });

        resolve({
          status: true,
          result: chats,
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
