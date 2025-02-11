import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
import { middleware } from './middleware';
import {roomSchema, signInSchema, signUpSchema} from '@repo/common/types'
import { prisma } from '@repo/db';
import { JWT_SECRET } from '@repo/backend-common/config';
dotenv.config();
import bcrypt from 'bcryptjs'
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
         res.json("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const response = await prisma.user.create({
            data:{
                username,
                password:hashedPassword,
                name
            }
        })

        res.status(200).json({
            msg:"Successfully signed up",
            response
        })

        return;

    }catch(e){
        console.error(e);
    }
})


app.post('/signin', async (req,res):Promise<any>=>{
    try{
        const data = signInSchema.safeParse(req.body);
        if(!data.success){
            res.status(409).json({
                msg:"Incorrect inputs"
            })
        }

        const {username,password}=await req.body;

        if(!username || !password){
            return res.json("Username or password missing")
        }


        const user = await prisma.user.findFirst({
            where:{
                username:username
            }
        })

        if(!user){
            res.json("User does not exist")
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password,user?.password)

        if(isPasswordCorrect){
            res.json("Incorrect credentials");
            return;
        }

        const userId=user?.id;

        const token = jwt.sign({userId},JWT_SECRET)


        res.json(token);

    }catch(e){
        console.error(e);
    }
})


app.post('/room', middleware,async(req:Request,res:Response):Promise<any>=>{
    

    const data = await roomSchema.safeParse(req.body);
    if(!data.success){
        res.json("Invalid types");
        return;
    }

    const {slug} = req.body;
    const userId = req.userId;
    if(!userId || !slug){
        res.json("Slug or userId missing");
        return;

    }

    const isRoomPresent = await prisma.room.findFirst({
        where:{
            slug
        }
    })
    if(isRoomPresent){
        res.status(400).json("Room with the same slug already exists");
        return;
    }

    const room = await prisma.room.create({
        data:{
            hostId:userId,
            slug:slug,
        }
    })

    res.json({
        msg:"Room successfully created",
        room
    })

})

app.listen(3001);


