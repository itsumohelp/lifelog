import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function DELETE(request: NextRequest,{ params, }:  { params: Promise<{ comeid: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
        try {
            const come = await prisma.come.findUnique({
                where: {
                    id:(await params).comeid,
                },
                select: {
                    id: true,
                    amount: true,
                    walletId: true,
                }
            })

            await prisma.wallet.update({
                where: {
                    id: come?.walletId,
                },
                data: {
                    balance: {
                        increment: Number(come?.amount) * -1,
                    }
                }
            })

            await prisma.come.delete({
                where: {
                    id: come?.id,
                }
            })

        } catch (error) {
            console.error("Error creating wallet:", error);
            return NextResponse.json({ message: "Error creating wallet" }, { status: 500 })
        }

    return NextResponse.json({messge: 'delete success' ,  status: 200 })
}
