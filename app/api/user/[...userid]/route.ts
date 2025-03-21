import { PrismaClient } from "@prisma/client";
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient()
export async function GET() {
    const cookieStore = await cookies()
    const theme = cookieStore.get('authjs.session-token')

    if (!theme) {
        return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const sessionId = await sessioncheck(theme.value)
    if (!sessionId?.userId) {
        return Response.json({ message: "Not authenticated" }, { status: 401 })
    }
    const myself = await prisma.user.findFirst({
        where: {
            id: sessionId.userId
        },
        select: {
            id: true
        }
    })
    return NextResponse.json(myself);
}

async function sessioncheck(sessiontoken:string) {
    return await prisma.session.findFirst({
        where: {
            sessionToken: sessiontoken
        },
        select: {
            userId: true
        }
    })
}