import {auth} from "@/auth";
import {PrismaClient} from "@prisma/client";
import {NextRequest, NextResponse} from 'next/server';

const prisma = new PrismaClient()

export async function GET(request: NextRequest, {params, }: {params: Promise<{walletid: string}>}) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({message: "Not authenticated"}, {status: 401})

  const paramWalletid: string = (await params).walletid

  const comeCount = await prisma.come.count({
    where: {
      walletId: paramWalletid
    }
  })

  if (comeCount < 5) {
    const comeData = await prisma.come.findMany({
      where: {
        walletId: paramWalletid
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
        createdAt: 'asc'
      }
    })
    return NextResponse.json(comeData);
  }

  const comePos = comeCount - 5
  const comeData = await prisma.come.findMany({
    where: {
      walletId: paramWalletid
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
      createdAt: 'asc'
    },
    skip: comePos,
    take: 5,
  })
  return NextResponse.json(comeData);
}
