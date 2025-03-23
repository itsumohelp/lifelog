'use server'

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { randomUUID } from "crypto";
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await auth()
    if (!session?.user) return NextResponse.json(null, { status: 401 })
        const titleList = await prisma.article.findMany({
            where: {
                userId: session.user.id
            },
            select: {
                id: true,
                context: true,
                userId: true,
            }
        })
        return NextResponse.json(titleList);    
}

export async function POST(request: Request) {
    const receiveData = await request.json()
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
    await prisma.article.create({
        data: {
            id: randomUUID(),
            context: receiveData.content,
            userId: session.user.id ?? ""
        }
    })
    return NextResponse.json(receiveData);
}