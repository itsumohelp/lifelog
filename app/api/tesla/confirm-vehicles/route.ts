import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getIronSession} from "iron-session";

import {prisma} from "@/prisma";
import {sessionOptions, SessionData} from "@/app/lib/session";

type VehicleOverrideInput = {
    vehicleId: string;
    displayName: string | null;
    vehicleGrade: string | null;
    capacityKwh: number | null;
};

type RequestBody = {
    vehicles: VehicleOverrideInput[];
};

export async function POST(req: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const teslaSub = session.teslaSub;

    if (!teslaSub) {
        return NextResponse.json(
            {ok: false, error: "not authed (missing teslaSub)"},
            {status: 401}
        );
    }

    // TeslaAccountを取得
    const account = await prisma.teslaAccount.findUnique({
        where: {teslaSub},
        include: {
            vehicles: {
                select: {id: true},
            },
        },
    });

    if (!account) {
        return NextResponse.json(
            {ok: false, error: "TeslaAccount not found"},
            {status: 404}
        );
    }

    const body: RequestBody = await req.json();

    if (!body.vehicles || !Array.isArray(body.vehicles)) {
        return NextResponse.json(
            {ok: false, error: "invalid request body"},
            {status: 400}
        );
    }

    // リクエストされた車両IDがアカウントに紐づいているか確認
    const accountVehicleIds = new Set(account.vehicles.map((v) => v.id));
    for (const v of body.vehicles) {
        if (!accountVehicleIds.has(v.vehicleId)) {
            return NextResponse.json(
                {ok: false, error: `vehicle ${v.vehicleId} not found in account`},
                {status: 403}
            );
        }
    }

    const now = new Date();

    // トランザクションで全車両のoverride情報を保存
    await prisma.$transaction(
        body.vehicles.map((v) =>
            prisma.teslaVehicleOverride.upsert({
                where: {vehicleId: v.vehicleId},
                update: {
                    displayName: v.displayName,
                    vehicleGrade: v.vehicleGrade,
                    capacityKwh: v.capacityKwh,
                    confirmedAt: now,
                },
                create: {
                    vehicleId: v.vehicleId,
                    displayName: v.displayName,
                    vehicleGrade: v.vehicleGrade,
                    capacityKwh: v.capacityKwh,
                    confirmedAt: now,
                },
            })
        )
    );

    return NextResponse.json({ok: true});
}
