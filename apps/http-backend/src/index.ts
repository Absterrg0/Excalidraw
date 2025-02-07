import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
import { middleware } from './middleware';
import {signUpSchema} from '@repo/common/types'
import { prisma } from '@repo/db';
import { JWT_SECRET } from '@repo/backend-common/config';
dotenv.config();
const app = express();

app.use(express.json());



app.post('/signup', async(req,res):Promise<any>=>{
    try{    

        const data = signUpSchema.safeParse(req.body);
        if(!data.success){
            res.status(409).json({
                msg:"Incorrect inputs"
            })
        }

        const {username,password,name} = await req.body;
        

        if(!username || !password || !name){
            return res.json("Username or password missing");
        }

        const userExists = await prisma.user.findFirst({
            where:{
                username
            }
        })

        if(userExists){
            return res.json("User already exists");
        }

        const response = await prisma.user.create({
            data:{
                username,
                password,
                name
            }
        })


    }catch(e){
        console.error(e);
    }
})


app.post('/signin', async (req,res):Promise<any>=>{
    try{

        const {username,password}=await req.body;

        if(!username || !password){
            return res.json("Username or password missing")
        }

        const user = await prisma.user.findFirst({
            where:{
                username:username
            }
        })

        const userId=user?.id;

        const token = jwt.sign({userId},JWT_SECRET)


        res.json(token);

    }catch(e){
        console.error(e);
    }
})


app.post('/room', middleware,async(req:Request,res:Response):Promise<any>=>{
    
})

app.listen(3001);


