import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function POST(request: NextRequest,{ params, }:  { params: Promise<{ todoid: string }> }) {
    const receiveData = await request.json()
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
    await prisma.article.create({
        data: {
            id: randomUUID(),
            context: receiveData.content,
            userId: session.user.id ?? "",
            todoId: (await params).todoid
        }
    })
    return NextResponse.json(receiveData);
}
