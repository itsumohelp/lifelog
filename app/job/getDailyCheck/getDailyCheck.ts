import {prisma} from "@/prisma";
import {getAccessTokenFromDB} from "@/app/lib/getAccessToken";
import {syncVehiclesAndDailySnapshot} from "./syncVehicles";
import {$Enums} from "@prisma/client";


export async function checkTargetUser() {
  const targetUserList = await prisma.syncJob.findMany({
    where: {status: "RUNNING"},
  });
  if (targetUserList.length !== 0) {
    return {"result": false, "doneCount": 0, "message": "Another job is running"};
  }

  const BUDGET_MS = 60_000;
  const startAt = Date.now();
  let result = true;
  let doneCount = 0;
  const MAX_RUNNING_JOBS = 1;


  while (true) {
    if (Date.now() - startAt >= BUDGET_MS) {
      break;
    }
    const job = await prisma.syncJob.findFirst({
      where: {
        status: "WAITING",
        scheduledAt: {lte: new Date()},
      },
      orderBy: {scheduledAt: "asc"},
    });

    if (!job) break;

    const updated = await prisma.syncJob.updateMany({
      where: {
        id: job.id,
        status: "WAITING",
      },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      continue;
    }
    processSyncJob(job).catch((e) => {
      console.error("Error processing sync job:", e);
    });
    doneCount += 1;

  }
  return {"result": result, "doneCount": doneCount};
}

export async function processSyncJob(job: {id: string; createdAt: Date; updatedAt: Date; teslaAccountId: string; status: $Enums.SyncJobStatus; jobType: $Enums.SyncJobType; scheduledAt: Date; startedAt: Date | null; finishedAt: Date | null; attempt: number; lastError: string | null;}) {
  try {
    const accessToken = await getAccessTokenFromDB(job.teslaAccountId);

    // 既存の同期ロジック
    await syncVehiclesAndDailySnapshot({teslaAccountId: job.teslaAccountId, accessToken: accessToken});

    await prisma.syncJob.update({
      where: {id: job.id},
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
      },
    });
  } catch (e: any) {
    await prisma.syncJob.update({
      where: {id: job.id},
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        lastError: String(e?.message ?? e),
      },
    });
  }
}
