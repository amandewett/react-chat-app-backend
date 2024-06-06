import { PrismaClient } from "@prisma/client";
import { messageResponseInclude } from "../utils";
const prismaClient = new PrismaClient();

export class MessageService {
  constructor() {}

  sendMessage(senderId: string, chatId: string, message: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        if (!chatId || !message) {
          resolve({
            status: false,
            message: `Invalid arguments`,
          });
        }

        const messageObj = await prismaClient.message.create({
          data: {
            senderId: senderId,
            chatId: chatId,
            message: message,
          },
        });

        //set latest message
        await prismaClient.chat.update({
          where: {
            id: chatId,
          },
          data: {
            latestMessageId: messageObj.id,
          },
        });

        resolve({
          status: true,
          message: "Message sent successfully",
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  getAllMessages(chatId: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        if (!chatId) {
          resolve({
            status: false,
            message: `Invalid chat id`,
          });
        }

        const messages = await prismaClient.message.findMany({
          where: {
            chatId: chatId,
          },
          include: messageResponseInclude,
        });

        resolve({
          status: true,
          result: messages,
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
