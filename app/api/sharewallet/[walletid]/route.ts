import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function GET(request: NextRequest,{ params, }:  { params: Promise<{ walletid: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
    const sharewallet = await prisma.wallet.findUnique({
            where: {
                id: (await params).walletid,
            },
            select: {
                id: true,
                name: true,
                userId: true,
                createdAt: true,
                walletshare: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            }
    })
    return NextResponse.json(sharewallet);
}

export async function POST(request: NextRequest,{ params, }:  { params: Promise<{ walletid: string }> }) {
    const receiveData = await request.json()
    const session = await auth()
    if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    
        try {
            await prisma.walletshare.create({
            data: {
             id: randomUUID(),
             userId: receiveData.userId,
             walletId: (await params).walletid,
                }
            })
        } catch (error) {
            console.error("Error creating come:", error);
            return NextResponse.json({ message: "Error creating come" }, { status: 500 })
        }

    return NextResponse.json({messge: 'success' ,  status: 200 })
}