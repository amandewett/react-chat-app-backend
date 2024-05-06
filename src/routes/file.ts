import { Router, Request, Response } from "express";
import { IRequest } from "src/middleware/IRequest";
const router: Router = Router();
import { FileService } from "../services/file.service";
const fileService = new FileService();

router.post("/upload", async (req: IRequest, res: Response) => {
  const files = req.files.files;

  const result: any = await fileService.uploadFiles(files);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

router.delete("/delete", async (req: IRequest, res: Response) => {
  const filePath = req.body.filePath;

  const result: any = await fileService.deleteFile(filePath);

  if (result.status) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

export default router;
