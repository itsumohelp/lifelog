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

    const userlist = await prisma.user.findMany({})
    return NextResponse.json(userlist);
}