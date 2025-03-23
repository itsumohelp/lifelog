'use server'

import { auth } from "@/auth";
import { prisma } from "@/prisma";
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
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
    })
        return NextResponse.json(titleList);    
}