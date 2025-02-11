// global.d.ts
import { Request } from "express"; // or other frameworks if applicable

declare global {
  namespace Express {
    interface Request {
        userId:string;
    }
  }
}

export {};
