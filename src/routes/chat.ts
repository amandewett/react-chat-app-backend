import { Router, Request, Response } from "express";
import { hasRole } from "../middleware/authHandler";
import { Roles } from "../enums/enums";
import { IRequest } from "../middleware/IRequest";
import { ChatService } from "../services/chat.service";
const chatService = new ChatService();

const router: Router = Router();

router.post("/create", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const senderId = req.user.id;
  const senderName = req.user.name;
  const receiverId = req.body.receiverId;

  const result: any = await chatService.createNewChat(senderId, senderName, receiverId);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.get("/all", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const userId = req.user.id;

  const result: any = await chatService.getAllUserChats(userId);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.post("/group/create", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const groupAdminId = req.user.id;
  const groupAdminName = req.user.name;
  const chatGroupName = req.body.groupName;
  const groupParticipants = req.body.groupParticipants;

  const result: any = await chatService.createNewChatGroup(groupAdminId, groupAdminName, chatGroupName, groupParticipants);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.put("/group/rename", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const userId = req.user.id;
  const groupId = req.body.groupId;
  const groupName = req.body.groupName;

  const result: any = await chatService.renameChatGroup(userId, groupId, groupName);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.put("/group/addUser", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const userId = req.user.id;
  const groupId = req.body.groupId;
  const newUsers = req.body.users;

  const result: any = await chatService.addNewUsersToGroup(userId, groupId, newUsers);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.put("/group/removeUser", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const userId = req.user.id;
  const groupId = req.body.groupId;
  const userToRemove = req.body.userId;

  const result: any = await chatService.removeUserFromGroup(userId, groupId, userToRemove);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.get("/group/details/:id", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const userId = req.user.id;
  const groupId = req.params.id;

  const result: any = await chatService.getChatGroupDetails(userId, groupId);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.delete("/group/delete/:id", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const userId = req.user.id;
  const groupId = req.params.id;

  const result: any = await chatService.deleteChatGroup(userId, groupId);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.delete("/group/leave/:id", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const userId = req.user.id;
  const groupId = req.params.id;

  const result: any = await chatService.leaveChatGroup(userId, groupId);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

export default router;
