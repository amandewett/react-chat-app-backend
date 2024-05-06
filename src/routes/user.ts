import { Router, Request, Response } from "express";
const router: Router = Router();
import { UserService } from "../services/user.service";
import { IRequest } from "src/middleware/IRequest";
const userService = new UserService();

router.post("/signup", async (req: IRequest, res: Response) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const profilePicture = req.files?.profilePicture;

  const result: any = await userService.signup(
    name,
    email,
    password,
    profilePicture
  );

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

export default router;
