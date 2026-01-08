import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/prisma";
import VehicleCards, { Vehicle } from "@/app/dashboard/vehicle-cards";
import BatteryRangeChart from "@/app/dashboard/BatteryRangeChart";

// JSTの日次キー（JST 00:00 をUTC Dateとして表現し、DBのキーに使う）
function getJstDayKey(d = new Date()): Date {
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = jst.getUTCMonth();
  const day = jst.getUTCDate();
  const jstMidnightUtc = Date.UTC(y, m, day, 0, 0, 0) - 9 * 60 * 60 * 1000;
  return new Date(jstMidnightUtc);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

type Props = {
  params: Promise<{ vehicleTag: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vehicleTag } = await params;

  // vehicleTag（teslaVehicleId）で車両を検索
  const vehicle = await prisma.teslaVehicle.findUnique({
    where: { teslaVehicleId: BigInt(vehicleTag) },
    include: {
      override: true,
    },
  });

  // 車両が存在しない、または公開されていない場合は404
  if (!vehicle || !vehicle.override?.isPublic) {
    return { title: "Not Found | Marsflare" };
  }

  // 最新の日次スナップショットを取得
  const snapshot = await prisma.teslaVehicleDailySnapshot.findFirst({
    where: { teslaVehicleId: vehicle.teslaVehicleId },
    orderBy: { snapshotDate: "desc" },
  });

  const displayName =
    vehicle.override?.displayName ?? vehicle.displayName ?? "My Tesla";
  const odometerKm = snapshot?.odometerKm
    ? Math.round(snapshot.odometerKm).toLocaleString()
    : null;

  const title = odometerKm
    ? `${displayName} - ${odometerKm} km | Marsflare`
    : `${displayName} | Marsflare`;
  const description = odometerKm
    ? `${displayName}の走行距離: ${odometerKm} km - Marsflare Tesla Dashboard`
    : `${displayName} - Marsflare Tesla Dashboard`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://itsumo.help";
  const ogImageUrl = `${baseUrl}/api/og/${vehicleTag}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/public/${vehicleTag}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "Marsflare",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicVehicleDashboardPage({ params }: Props) {
  const { vehicleTag } = await params;

  // vehicleTag（teslaVehicleId）で車両を検索
  const vehicle = await prisma.teslaVehicle.findUnique({
    where: { teslaVehicleId: BigInt(vehicleTag) },
    include: {
      override: true,
      vehicleOptions: {
        orderBy: { code: "asc" },
      },
    },
  });

  // 車両が存在しない、または公開されていない場合は404
  if (!vehicle || !vehicle.override?.isPublic) {
    notFound();
  }

  const vehicles: Vehicle[] = [vehicle as Vehicle];

  // 今日・前日（JST）の日次スナップショットを取得
  const todayKey = getJstDayKey(new Date());
  const yesterdayKey = getJstDayKey(addDays(new Date(), -1));

  const [todaySnapshots, yesterdaySnapshots] = await Promise.all([
    prisma.teslaVehicleDailySnapshot.findMany({
      where: { teslaVehicleId: vehicle.teslaVehicleId, snapshotDate: todayKey },
    }),
    prisma.teslaVehicleDailySnapshot.findMany({
      where: { teslaVehicleId: vehicle.teslaVehicleId, snapshotDate: yesterdayKey },
    }),
  ]);

  // BigInt -> string key の map
  const todayMap = Object.fromEntries(
    todaySnapshots.map((s) => [s.teslaVehicleId.toString(), s]),
  );
  const yesterdayMap = Object.fromEntries(
    yesterdaySnapshots.map((s) => [s.teslaVehicleId.toString(), s]),
  );

  const days = 30; // 直近30日
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await prisma.teslaVehicleDailySnapshot.findMany({
    where: {
      teslaVehicleId: vehicle.teslaVehicleId,
      snapshotDate: { gte: from },
    },
    orderBy: { snapshotDate: "asc" },
  });

  const chartData = rows.map((r) => ({
    date: r.snapshotDate.toISOString().slice(0, 10),
    batteryLevel: r.batteryLevel ?? null,
    batteryRangeKm:
      r.batteryRangeKm != null ? Math.round(r.batteryRangeKm) : null,
    dailyDistanceKm:
      r.odometerDeltaKm != null ? Math.round(r.odometerDeltaKm) : null,
    outsideTemp: r.outsideTemp ?? null,
  }));

  return (
    <main style={{ padding: "3px 10px 0px 10px", display: "grid", gap: 16 }}>
      <VehicleCards
        vehicles={vehicles as any}
        todayMap={todayMap as any}
        yesterdayMap={yesterdayMap as any}
        hideVehicleTag={true}
      />
      <section style={{ display: "grid", gap: 8 }}>
        <b>電池残量 / 走行可能距離</b>

        {rows.length === 0 ? (
          <p>車両データがありません。</p>
        ) : (
          <BatteryRangeChart data={chartData} />
        )}
      </section>
    </main>
  );
}
