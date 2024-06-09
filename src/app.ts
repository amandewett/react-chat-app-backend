import dotenv from "dotenv";
dotenv.config();
import express, { Express, NextFunction, Request, Response } from "express";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import httpErrors from "http-errors";
import expressFileUpload from "express-fileupload";
import path from "path";
import { errorHandler } from "./middleware/errorHandlers";
import { createServer, Server as HttpServerType, IncomingMessage, ServerResponse } from "http";

//routes
import indexRouter from "./routes/index";

const app: Express = express();
const server: HttpServerType<typeof IncomingMessage, typeof ServerResponse> = createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3001",
  },
});

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
  res.header("Access-Control-Allow-Methods", "*");
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

io.on("connection", (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  console.log(`Socket connected`);

  //create separate room for each user
  socket.on("createRoom", (userData: any) => {
    socket.join(userData.id);
    socket.emit(`${userData.name} connected`);
  });

  //join chat
  socket.on("joinChatRoom", (chatId: string) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  //handle new message
  socket.on("newMessage", (payload: any, arrOtherUsers: string[]) => {
    const chatDetails = payload.chat;

    if (chatDetails.participantIDs.length === 0) console.log(`Chat doesn't have users`);

    chatDetails.participantIDs.map((participantId: string) => {
      if (participantId === payload.senderId) return;

      socket.in(participantId).emit("newMessageReceived", { payload, arrOtherUsers });
    });
  });

  //handle new group

  socket.on("disconnect", () => {
    console.log(`Socket disconnect`);
  });
});

//starting listening server using express
server.listen(PORT, () => {
  console.log(`Server started at ${PORT} in ${process.env.ENV} environment`);
});

export default app;
