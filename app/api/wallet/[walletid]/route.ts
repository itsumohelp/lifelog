import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function POST(request: NextRequest,{ params, }:  { params: Promise<{ walletid: string }> }) {
    const receiveData = await request.json()
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
        try {
            await prisma.come.create({
            data: {
             id: randomUUID(),
             amount: Number(receiveData.amount),
             userId: session.user.id ?? "",
             walletId: (await params).walletid,
             paymentDate: new Date(receiveData.paymentDate)
                }
            })
        } catch (error) {
            console.error("Error creating come:", error);
            return NextResponse.json({ message: "Error creating come" }, { status: 500 })
        }

        try {
            await prisma.wallet.update({
                where: {
                    id: (await params).walletid,
                },
                data: {
                    balance: {
                        increment: Number(receiveData.amount),
                    }
                }
            })
        } catch (error) {
            console.error("Error creating wallet:", error);
            return NextResponse.json({ message: "Error creating wallet" }, { status: 500 })
        }

    return NextResponse.json({messge: 'success' ,  status: 200 })
}

export async function GET(request: NextRequest,{ params, }:  { params: Promise<{ walletid: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
    const todoPosession = await prisma.come.findMany({
            where: {
                walletId: (await params).walletid,
            },
            select: {
                id: true,
                amount: true,
                paymentDate: true,
                userId: true,
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                paymentDate: 'asc'
            },
            take: 5,
    })
    return NextResponse.json(todoPosession);
}
