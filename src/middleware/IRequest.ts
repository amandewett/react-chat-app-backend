import { Request } from "express";

//created custom type using express's Request
export interface IRequest extends Request {
  user?: any;
  files?: any;
}
