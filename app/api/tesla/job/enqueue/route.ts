import {enqueueAutoSyncJobs} from "@/app/job/getDailyCheck/enEueue";

export async function GET() {

  return Response.json({message: "tesla job enqueue endpoint"});
}

export async function POST() {
  const job = await enqueueAutoSyncJobs();

  if (job?.result) {
    return Response.json(
      {ok: false, error: "jobs queue was failed"},
      {status: 500}
    );
  }

  return Response.json({"result": "job complete"});
}
