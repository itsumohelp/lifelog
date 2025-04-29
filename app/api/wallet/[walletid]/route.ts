import {auth} from "@/auth";
import {PrismaClient} from "@prisma/client";
import {randomUUID} from "crypto";
import {NextRequest, NextResponse} from 'next/server';

const prisma = new PrismaClient()

interface Come {
  id: string;
  name: string;
  balance: number;
  last7balance: number;
  last30balance: number;
  loginUserId: string
}

export async function POST(request: NextRequest, {params, }: {params: Promise<{walletid: string}>}) {
  const receiveData = await request.json()
  const session = await auth()
  if (!session?.user) return NextResponse.json({message: "Not authenticated"}, {status: 401})

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
    return NextResponse.json({message: "Error creating come"}, {status: 500})
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
    return NextResponse.json({message: "Error creating wallet"}, {status: 500})
  }

  return NextResponse.json({messge: 'success', status: 200})
}

export async function GET(request: NextRequest, {params, }: {params: Promise<{walletid: string}>}) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({message: "Not authenticated"}, {status: 401})

  const paramWalletid: string = (await params).walletid


  const walletList = await prisma.wallet.findFirst({
    where: {
      id: paramWalletid,
    },
    select: {
      id: true,
      name: true,
      balance: true,
    }
  })

  const last7Balance = await prisma.come.groupBy({
    by: ['userId'],
    where: {
      userId: session.user.id,
      paymentDate: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      }
    },
    _sum: {
      amount: true,
    },
  })

  const last30Balance = await prisma.come.groupBy({
    by: ['userId'],
    where: {
      userId: session.user.id,
      paymentDate: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      }
    },
    _sum: {
      amount: true,
    },
  })

  const Wallet: Come = {
    id: walletList?.id ?? "",
    name: walletList?.name ?? "",
    balance: walletList?.balance ?? 0,
    last7balance: last7Balance[0]?._sum.amount ?? 0,
    last30balance: last30Balance[0]?._sum.amount ?? 0,
    loginUserId: session.user.id ?? "",
  };
  return NextResponse.json(Wallet);

}
