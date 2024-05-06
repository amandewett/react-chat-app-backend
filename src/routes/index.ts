import { Router, Request, Response } from "express";
const router: Router = Router();
import userRouter from "./user";
import fileRouter from "./file";

//router config
router.use("/file", fileRouter);
router.use("/user", userRouter);

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to React chat app server");
});

export default router;
