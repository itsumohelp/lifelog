import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient()
export const GET = auth( async function GET(req) {
    if (!req.auth) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
        const userlist = await prisma.user.findMany({})
        return NextResponse.json(userlist);
})