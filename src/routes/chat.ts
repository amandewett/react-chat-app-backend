import { Router, Request, Response } from "express";
import { hasRole } from "../middleware/authHandler";
import { Roles } from "../enums/enums";
import { IRequest } from "../middleware/IRequest";
const router: Router = Router();
import { ChatService } from "../services/chat.service";
const chatService = new ChatService();

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

export default router;
