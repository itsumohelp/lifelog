import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function GET() {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
        const userlist = await prisma.user.findMany({})
        return NextResponse.json(userlist);    
}