import {checkTargetUser, processSyncJob} from "@/app/job/getDailyCheck/getDailyCheck";

export async function POST() {
  const job = await checkTargetUser();

  if (!job.result) {
    return Response.json(job);
  }

  return Response.json({job});
}
