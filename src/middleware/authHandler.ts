import { Response, NextFunction } from "express";
import jsonWebToken from "jsonwebtoken";
import { UserService } from "../services/user.service";
import { IRequest } from "./IRequest";
const userService = new UserService();

const hasRole = (...arrRoles: string[]) => {
  return async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      let token = req.headers.authorization;

      if (!token) {
        return res.status(401).send("Not Authorized!");
      }

      token = token.replace("Bearer ", "");
      const JWTPayload: any = jsonWebToken.verify(token, process.env.JWT_SECRET || "monday");
      const arrAllowedRoles = Array.isArray(arrRoles) ? arrRoles : new Array(arrRoles);

      if (arrAllowedRoles.indexOf(JWTPayload!.role) !== -1) {
        const result: any = await userService.getUserDetails(JWTPayload.id);
        if (result.status) {
          req.user = result.result;
          next();
        } else {
          return res.status(401).send("Not Authorized!");
        }
      } else {
        return res.status(401).send("Not Authorized!");
      }
    } catch (err) {
      return res.status(401).send("Not Authorized!");
    }
  };
};

export { hasRole };
