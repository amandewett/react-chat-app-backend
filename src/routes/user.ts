import { Router, Request, Response } from "express";
const router: Router = Router();
import { UserService } from "../services/user.service";
import { IRequest } from "src/middleware/IRequest";
import { hasRole } from "../middleware/authHandler";
import { Roles } from "../enums/enums";
const userService = new UserService();

router.post("/signup", async (req: IRequest, res: Response) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const profilePicture = req.body?.profilePicture;

  const result: any = await userService.signup(name, email, password, profilePicture);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.post("/login", async (req: IRequest, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  const result: any = await userService.login(email, password);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.get("/all", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const userId = req.user.id;
  const searchKeyword = req.query.search?.toString();

  const result: any = await userService.getUserList(userId, searchKeyword);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.post("/changeProfilePicture", hasRole(Roles.User), async (req: IRequest, res: Response) => {
  const userId = req.user.id;
  const profilePicture = req.body.profilePicture;

  const result: any = await userService.changeProfilePicture(userId, profilePicture);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

export default router;
