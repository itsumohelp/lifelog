import { SessionData, sessionOptions } from "@/app/lib/session";
import { prisma } from "@/prisma";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
} from "react";

export default async function Page() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const teslaSub = session.teslaSub;

  if (!teslaSub) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Dashboard</h1>
        <p>未ログインです。先に Tesla ログインしてください。</p>
      </main>
    );
  }

  // ログイン中ユーザーの TeslaAccount を取得（車両も一緒に）
  const account = await prisma.teslaAccount.findUnique({
    where: { teslaSub },
    include: {
      vehicles: {
        orderBy: { lastSeenAt: "desc" },
      },
    },
  });

  if (!account) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Dashboard</h1>
        <p>Teslaアカウントが見つかりません。</p>
      </main>
    );
  }

  const logs = await prisma.teslaFleetApiCallLog.findMany({
    where: account.id ? { teslaAccountId: account.id } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-3">
        <div className="grid grid-cols-6 gap-2 text-sm font-medium opacity-70">
          <div>日時</div>
          <div className="col-span-2">path</div>
          <div>結果</div>
        </div>

        <div className="mt-2 space-y-2">
          {logs.map(
            (l: {
              id: Key | null | undefined;
              createdAt: string | number | Date;
              purpose: any;
              path:
                | string
                | number
                | bigint
                | boolean
                | ReactElement<unknown, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | ReactPortal
                | Promise<
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactPortal
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | null
                    | undefined
                  >
                | null
                | undefined;
              isSuccess: any;
              statusCode:
                | string
                | number
                | bigint
                | boolean
                | ReactElement<unknown, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | ReactPortal
                | Promise<
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactPortal
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | null
                    | undefined
                  >
                | null
                | undefined;
              durationMs: any;
              errorMessage:
                | string
                | number
                | bigint
                | boolean
                | ReactElement<unknown, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | ReactPortal
                | Promise<
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactPortal
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | null
                    | undefined
                  >
                | null
                | undefined;
              errorType:
                | string
                | number
                | bigint
                | boolean
                | ReactElement<unknown, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | ReactPortal
                | Promise<
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactPortal
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | null
                    | undefined
                  >
                | null
                | undefined;
            }) => (
              <div
                key={l.id}
                className="grid grid-cols-6 gap-2 text-sm rounded-xl border p-2"
              >
                <div>{new Date(l.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</div>
                <div className="col-span-2 truncate">{l.path}</div>
                <div>
                  {l.isSuccess ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5">
                      OK {l.statusCode}
                    </span>
                  ) : (
                    <span className="rounded bg-rose-100 px-2 py-0.5">
                      NG {l.statusCode ?? "-"} {l.errorType}: {l.errorMessage}
                    </span>
                  )}
                  <span className="ml-2 opacity-60">
                    {l.durationMs ? `${l.durationMs}ms` : ""}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
