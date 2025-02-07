import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { JWT_SECRET } from '@repo/backend-common/config';

dotenv.config();

export function middleware(req:Request,res:Response,next:NextFunction){

    const token = req.headers["authorization"] ?? "";
    const verification = jwt.verify(token,JWT_SECRET);

    if(typeof(verification)==="string"){
        return;
    }

    if(verification.id){

        //@ts-ignore
        req.id=verification.id;

        next();
    }
    else{
        res.json("Unauthorized");
    }

}