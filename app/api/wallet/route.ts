import {auth} from "@/auth";
import {PrismaClient} from "@prisma/client";
import {randomUUID} from "crypto";
import {NextResponse} from 'next/server';

const prisma = new PrismaClient()

interface Come {
  id: string;
  name: string;
  balance: number;
  last7balance: number;
  last30balance: number;
  loginUserId: string;
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json(null, {status: 401})
  const walletList = await prisma.wallet.findFirst({
    where: {
      userId: session.user.id
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

export async function POST(request: Request) {
  const receiveData = await request.json()
  const session = await auth()
  if (!session?.user) return NextResponse.json(null, {status: 401})

  const walletregist = await prisma.wallet.create({
    data: {
      id: randomUUID(),
      name: receiveData.name,
      userId: session.user.id ?? "",
      balance: 0,
    }
  })

  await prisma.walletshare.create({
    data: {
      id: randomUUID(),
      walletId: walletregist.id,
      userId: session.user.id ?? "",
    }
  })
  return NextResponse.json(walletregist);
}
