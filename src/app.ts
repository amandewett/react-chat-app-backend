import dotenv from "dotenv";
dotenv.config();
import express, { Express, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import httpErrors from "http-errors";
import expressFileUpload from "express-fileupload";
import path from "path";
import { errorHandler } from "./middleware/errorHandlers";

//routes
import indexRouter from "./routes/index";

const app: Express = express();
//it helps to parse incoming JSON data from HTTP requests
app.use(express.json());
app.use(
  expressFileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));
// It parses incoming requests with URL-encoded payloads and is based on a body parser
app.use(
  express.urlencoded({
    extended: false,
  })
);
//helps to parse cookies attached to the client request
app.use(cookieParser());
//handling request from origins
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
//adding middleware to log all the requests using morgan module
app.use(morgan("dev"));
//routes configured with their prefix
app.use("/api", indexRouter);

// catch 404 and forward to error handler --> http-errors
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(httpErrors(404));
});

//error handler
app.use(errorHandler);

const PORT: number = Number(process.env.PORT) || 3001;
//starting listening server using express
app.listen(PORT, () => {
  console.log(`Server started at ${PORT} in ${process.env.ENV} environment`);
});

export default app;
