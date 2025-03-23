import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient()
export async function DELETE(req: NextRequest,{ params, }:  { params: Promise<{ articleid: string }> })  {

    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })

    const { articleid } = await params
    console.log("kore " + articleid)
    const deleteUser = await prisma.article.delete({
        where: {
            id: articleid,
            userId: session.user.id
        }
    })
    if (!deleteUser) return NextResponse.json({ message: "Not found" }, { status: 404 })

    return NextResponse.json("{}");
}