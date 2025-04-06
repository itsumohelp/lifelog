import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function GET() {
    const session = await auth()
    if (!session?.user) return NextResponse.json(null, { status: 401 })
        const todoList = await prisma.wallet.findFirst({
            where: {
                userId: session.user.id
            },
            select: {
                id: true,
                name: true,
                balance: true,
                }
        })
        return NextResponse.json(todoList);    
}

export async function POST(request: Request) {
    const receiveData = await request.json()
    const session = await auth()
    if (!session?.user) return NextResponse.json(null , { status: 401 })
    
    await prisma.wallet.create({
        data: {
            id: randomUUID(),
            name: receiveData.name,
            userId: session.user.id ?? "",
            balance: 0,
        }
    })
    return NextResponse.json(receiveData);
}