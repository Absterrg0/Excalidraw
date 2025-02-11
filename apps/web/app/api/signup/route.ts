import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import bcrypt from 'bcryptjs'
import {signUpSchema} from '@repo/common/types'
export async function POST(req:NextRequest){
    try{
        const body = await req.json();

        const validatedBody = await signUpSchema.safeParse(body);

        if(!validatedBody){
            return NextResponse.json({
                msg:"Invalid body format"
            },{
                status:400
            })
        }

        const {username,password,name}=body;


        const userExists = await prisma.user.findFirst({
            where:{
                username
            }
        })
        if(userExists){
            return NextResponse.json({
                msg:"User already exists"
            },{
                status:409
            })
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await prisma.user.create({
            data:{
                username,
                password:hashedPassword,
                name
            }
        })


        return NextResponse.json({
            msg:"User successfully created",
            userId:user.id
        },{
            status:200
        })



    }
    catch(e){
        return NextResponse.json({
            msg:"Error while signing up"
        })
    }
}