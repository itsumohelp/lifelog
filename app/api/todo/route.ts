import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function GET() {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
        const todoList = await prisma.todo.findFirst({
            where: {
                userId: session.user.id
            },
            select: {
                id: true,
                title: true,
                }
        })
        return NextResponse.json(todoList);    
}

export async function POST(request: Request) {
    const receiveData = await request.json()
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
    await prisma.todo.create({
        data: {
            id: randomUUID(),
            title: receiveData.title,
            userId: session.user.id ?? ""
        }
    })
    return NextResponse.json(receiveData);
}