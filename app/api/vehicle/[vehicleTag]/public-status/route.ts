import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {prisma} from "@/prisma";
import {sessionOptions, SessionData} from "@/app/lib/session";

export async function GET(
    request: Request,
    {params}: {params: Promise<{vehicleTag: string}>}
) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const teslaSub = session.teslaSub;

    if (!teslaSub) {
        return NextResponse.json({isPublic: false}, {status: 401});
    }

    const {vehicleTag} = await params;

    // 車両を検索（ログインユーザーの車両かチェック）
    const vehicle = await prisma.teslaVehicle.findFirst({
        where: {
            teslaVehicleId: BigInt(vehicleTag),
            teslaAccount: {teslaSub},
        },
        include: {
            override: true,
        },
    });

    if (!vehicle) {
        return NextResponse.json({isPublic: false}, {status: 404});
    }

    return NextResponse.json({
        isPublic: vehicle.override?.isPublic ?? false,
    });
}
