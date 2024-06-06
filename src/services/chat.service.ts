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

  createNewChatGroup(groupAdminId: string, groupAdminName: string, chatGroupName: string, groupParticipants: string[]) {
    return new Promise(async (resolve: any, reject: any) => {
      if (!chatGroupName || !groupParticipants) {
        resolve({
          status: false,
          message: `Invalid input`,
        });
      } else {
        groupParticipants = Array.isArray(groupParticipants) ? groupParticipants : new Array(groupParticipants);

        if (groupParticipants.length < 2) {
          resolve({
            status: false,
            message: `Participants must be more than 2`,
          });
        } else {
          //create new group
          const newGroup = await prismaClient.chat.create({
            data: {
              isGroupChat: true,
              groupAdminID: groupAdminId,
              chatName: chatGroupName,
              participantIDs: [groupAdminId, ...groupParticipants],
            },
          });

          const groupDetails = await prismaClient.chat.findUnique({
            where: {
              id: newGroup.id,
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

          if (groupDetails) {
            resolve({
              status: true,
              result: groupDetails,
            });
          } else {
            resolve({
              status: false,
              message: `Cannot find the group chat`,
            });
          }
        }
      }
      try {
      } catch (err) {
        reject(err);
      }
    });
  }

  renameChatGroup(userId: string, groupId: string, groupName: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        if (!groupId || !groupName) {
          resolve({
            status: false,
            message: `Invalid arguments`,
          });
        } else {
          const group = await prismaClient.chat.findUnique({
            where: {
              id: groupId,
              isGroupChat: true,
            },
          });

          if (group) {
            if (group.participantIDs.includes(userId)) {
              await prismaClient.chat.update({
                where: {
                  id: groupId,
                  isGroupChat: true,
                },
                data: {
                  chatName: groupName,
                },
              });

              resolve({
                status: true,
                message: `Group name updated successfully`,
              });
            } else {
              resolve({
                status: false,
                message: `Invalid user`,
              });
            }
          } else {
            resolve({
              status: false,
              message: `Group doesn't exists`,
            });
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  addNewUsersToGroup(userId: string, groupId: string, newUsers: string | string[]) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        if (!groupId || !newUsers) {
          resolve({
            status: false,
            message: `Invalid arguments`,
          });
        } else {
          const group = await prismaClient.chat.findUnique({
            where: {
              id: groupId,
            },
          });

          if (group) {
            //check if the user is admin
            if (group.groupAdminID == userId) {
              newUsers = Array.isArray(newUsers) ? newUsers : new Array(newUsers);

              //check if any of new users already a participant of group
              const isParticipant = newUsers.some((userId: string) => group.participantIDs.includes(userId));

              if (isParticipant) {
                resolve({
                  status: false,
                  message: `One of new user already a group participant`,
                });
              } else {
                await prismaClient.chat.update({
                  where: {
                    id: groupId,
                  },
                  data: {
                    participantIDs: {
                      set: [...group.participantIDs, ...newUsers],
                    },
                  },
                });

                resolve({
                  status: true,
                  message: `Users added successfully`,
                });
              }
            } else {
              resolve({
                status: false,
                message: `Only admin can add new members`,
              });
            }
          } else {
            resolve({
              status: false,
              message: `Group doesn't exists`,
            });
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  removeUserFromGroup(userId: string, groupId: string, removeUserId: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        if (!groupId || !removeUserId) {
          resolve({
            status: false,
            message: `Invalid arguments`,
          });
        } else {
          const group = await prismaClient.chat.findUnique({
            where: {
              id: groupId,
            },
          });

          if (group) {
            //check if the user is admin
            if (group.groupAdminID == userId) {
              //check if any of new users already a participant of group
              const isParticipant = group.participantIDs.includes(removeUserId);

              if (isParticipant) {
                if (removeUserId === group.groupAdminID) {
                  resolve({
                    status: false,
                    message: `Admin cannot be removed`,
                  });
                } else {
                  await prismaClient.chat.update({
                    where: {
                      id: groupId,
                    },
                    data: {
                      participantIDs: {
                        set: group.participantIDs.filter((participantId: string) => participantId != removeUserId),
                      },
                    },
                  });

                  resolve({
                    status: true,
                    message: `Users removed successfully`,
                  });
                }
              } else {
                resolve({
                  status: false,
                  message: `User is not a group participant`,
                });
              }
            } else {
              resolve({
                status: false,
                message: `Only admin can remove members`,
              });
            }
          } else {
            resolve({
              status: false,
              message: `Group doesn't exists`,
            });
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  getChatGroupDetails(userId: string, groupId: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        if (!groupId) {
          resolve({
            status: false,
            message: `Invalid arguments`,
          });
        } else {
          const group = await prismaClient.chat.findUnique({
            where: {
              id: groupId,
            },
          });

          if (group) {
            resolve({
              status: true,
              result: group,
            });
          } else {
            resolve({
              status: false,
              message: `Group doesn't exists`,
            });
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  deleteChatGroup(userId: string, groupId: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        if (!groupId) {
          resolve({
            status: false,
            message: `Invalid arguments`,
          });
        } else {
          const group = await prismaClient.chat.findUnique({
            where: {
              id: groupId,
              isGroupChat: true,
            },
          });

          if (group) {
            if (group.groupAdminID === userId) {
              //delete group
              await prismaClient.chat.delete({
                where: {
                  id: groupId,
                },
              });
              resolve({
                status: true,
                message: `Group deleted successfully`,
              });
            } else {
              resolve({
                status: false,
                message: `Only group admin can delete the group`,
              });
            }
          } else {
            resolve({
              status: false,
              message: `Group doesn't exists`,
            });
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  leaveChatGroup(userId: string, groupId: string) {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        if (!groupId) {
          resolve({
            status: false,
            message: `Invalid arguments`,
          });
        } else {
          const group = await prismaClient.chat.findUnique({
            where: {
              id: groupId,
              isGroupChat: true,
            },
          });

          if (group) {
            if (group.groupAdminID === userId) {
              resolve({
                status: false,
                message: `Group admin cannot leave the group`,
              });
            } else {
              //leave group
              await prismaClient.chat.update({
                where: {
                  id: groupId,
                },
                data: {
                  participantIDs: {
                    set: group.participantIDs.filter((participantId: string) => participantId != userId),
                  },
                },
              });

              resolve({
                status: true,
                message: `You have left the group successfully`,
              });
            }
          } else {
            resolve({
              status: false,
              message: `Group doesn't exists`,
            });
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}
