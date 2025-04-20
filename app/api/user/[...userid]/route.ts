import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function GET(request: NextRequest,{ params, }:  { params: Promise<{ userid: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
        console.log("this is koredesu " + (await params).userid)
    const todoPosession = await prisma.user.findUnique({
            where: {
                id: (await params).userid.toString()
            }
    })
    console.log("todoPosession", todoPosession);
    if (!todoPosession) return NextResponse.json({ message: "Not found" }, { status: 404 })
    return NextResponse.json(todoPosession);
}