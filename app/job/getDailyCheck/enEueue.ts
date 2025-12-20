import {prisma} from "@/prisma";

export async function enqueueAutoSyncJobs() {

  const checkExistingJob = await prisma.syncJob.findFirst({
    where: {
      jobType: "SYNC_VEHICLES",
      status: {in: ["WAITING", "RUNNING"]},
    },
    select: {id: true},
  });

  if (checkExistingJob) {
    return {"result": "false", "message": "既に保留中または実行中のジョブがあります。"};
  }


  const autoAccounts = await prisma.teslaSettings.findMany({
    where: {mode: "AUTO"},
    select: {teslaAccountId: true},
  });

  for (const {teslaAccountId} of autoAccounts) {
    const exists = await prisma.syncJob.findFirst({
      where: {
        teslaAccountId,
        jobType: "SYNC_VEHICLES",
        status: {in: ["WAITING", "RUNNING"]},
      },
      select: {id: true},
    });

    if (exists) {
      continue;
    }

    await prisma.syncJob.create({
      data: {
        teslaAccountId,
        jobType: "SYNC_VEHICLES",
        status: "WAITING",
        scheduledAt: new Date(),
      },
    });
  }
  if (checkExistingJob) {
    return {"result": "true", "message": "ユーザーをキューに追加しました。"};
  }

}
