"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";

type Point = {
    date: string;
    batteryLevel: number | null;
    batteryRangeKm: number | null;
    estBatteryRangeKm: number | null;
};

export default function BatteryRangeChart({data}: {data: Point[]}) {
    return (
        <div style={{border: "1px solid #ddd", borderRadius: 12, padding: 12}}>
            <div style={{width: "100%", height: 320, marginTop: 12}}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        {/* 左軸：% */}
                        <YAxis yAxisId="left" domain={[0, 100]} />
                        {/* 右軸：km（データに合わせて自動） */}
                        <YAxis yAxisId="right" orientation="right" />

                        <Tooltip />
                        <Legend />

                        {/* null を跨いで線を繋ぎたくないなら connectNulls={false}（デフォルト） */}
                        <Line yAxisId="left" type="monotone" dataKey="batteryLevel" name="残量(%)" dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="batteryRangeKm" name="定格レンジ(km)" dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="estBatteryRangeKm" name="推定レンジ(km)" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p style={{margin: "8px 0 0", opacity: 0.7, fontSize: 12}}>
                ※欠測（null）はグラフ上で途切れます
            </p>
        </div>
    );
}
