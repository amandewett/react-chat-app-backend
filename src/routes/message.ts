import { Router, Request, Response } from "express";
import { hasRole } from "../middleware/authHandler";
import { Roles } from "../enums/enums";
import { IRequest } from "../middleware/IRequest";
import { MessageService } from "../services/message.service";
const messageService = new MessageService();

const router: Router = Router();

router.post("/send/:chatId", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const senderId = req.user.id;
  const chatId = req.params.chatId;
  const message = req.body.message;

  const result: any = await messageService.sendMessage(senderId, chatId, message);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.get("/all/:chatId", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const chatId = req.params.chatId;

  const result: any = await messageService.getAllMessages(chatId);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

export default router;
