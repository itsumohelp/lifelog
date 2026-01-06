import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {prisma} from "@/prisma";
import {sessionOptions, SessionData} from "@/app/lib/session";

export async function GET() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const teslaSub = session.teslaSub;

    if (!teslaSub) {
        return NextResponse.json({id: null}, {status: 401});
    }

    const account = await prisma.teslaAccount.findUnique({
        where: {teslaSub},
        select: {id: true},
    });

    if (!account) {
        return NextResponse.json({id: null}, {status: 404});
    }

    return NextResponse.json({id: account.id});
}
