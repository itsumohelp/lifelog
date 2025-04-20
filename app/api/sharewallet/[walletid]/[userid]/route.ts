import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function DELETE(request: NextRequest,{ params, }:  { params: Promise<{ walletid: string, userid: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
        try {
            await prisma.walletshare.deleteMany({
            where: {
             userId: (await params).userid,
             walletId: (await params).walletid,
                }
            })
        } catch (error) {
            console.error("Error creating come:", error);
            return NextResponse.json({ message: "Error creating come" }, { status: 500 })
        }

    return NextResponse.json({messge: 'success' ,  status: 200 })
}