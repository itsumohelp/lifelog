import {auth} from "@/auth";
import {PrismaClient} from "@prisma/client";
import {NextResponse} from 'next/server';

const prisma = new PrismaClient()

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({message: "Not authenticated"}, {status: 401})

  const sharewallet = await prisma.walletshare.findMany({
    where: {
      userId: session?.user.id
    },
    select: {
      id: true,
      walletId: true,
      createdAt: true,
      wallet: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  })
  return NextResponse.json(sharewallet);
}
