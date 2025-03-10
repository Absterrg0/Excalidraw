import { NextRequest, NextResponse } from "next/server";
import {auth} from "../../../lib/auth"
import prisma from "@repo/db";




export async function POST(req:NextRequest){

    try{
        const body = await req.json();
        const session = await auth();
        if(!session?.user?.id || !session.user){
            return NextResponse.json({
                msg:"Unauthorized"
            },{
                status:403
            })
        }
        const {slug}=body;

        const isNameAvailable = await prisma.room.findFirst({
            where:{
                slug:slug
            }
        })

        if(isNameAvailable){
            return NextResponse.json({
                msg:"Room with name already exists"
            },{
                status:409
            })
        }

        const room = await prisma.room.create({
            data:{
                slug:slug,
                hostId:session?.user?.id
            }
        })


        return NextResponse.json({
            msg:"Room created successfully",
            roomId:room?.id
        },{
            status:201
        })


    }
    catch(e){
        return NextResponse.json({
            msg:"Error while creating room"
        })
    }

}