import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function GET(request: NextRequest,{ params, }:  { params: Promise<{ todoid: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
    const todoPosession = await prisma.todoshare.findMany({
            where: {
                todoId: (await params).todoid,
            },
            select: {
                id: true,
                userId: true,
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                todo: {
                    select: {
                        title: true,
                    }
                }
            },
    })
    return NextResponse.json(todoPosession);
}
