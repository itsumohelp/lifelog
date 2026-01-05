"use client";

import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
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
    dailyDistanceKm: number | null;
    outsideTemp: number | null;
};

export default function BatteryRangeChart({data}: {data: Point[]}) {
    return (
        <div style={{border: "1px solid #ddd", borderRadius: 12, padding: 12}}>
            <div style={{width: "100%", height: 360, marginTop: 12}}>
                <ResponsiveContainer>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{fontSize: 11}} />
                        {/* 左軸：% と 気温(℃) */}
                        <YAxis
                            yAxisId="left"
                            domain={[-10, 100]}
                            tick={{fontSize: 11}}
                            label={{value: "% / ℃", angle: -90, position: "insideLeft", fontSize: 11}}
                        />
                        {/* 右軸：km */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{fontSize: 11}}
                            label={{value: "km", angle: 90, position: "insideRight", fontSize: 11}}
                        />

                        <Tooltip />
                        <Legend />

                        {/* 電池残量（左軸・%）- 棒グラフ */}
                        <Bar
                            yAxisId="left"
                            dataKey="batteryLevel"
                            name="電池残量(%)"
                            fill="#22c55e"
                            opacity={0.6}
                            barSize={12}
                        />
                        {/* 車外気温（左軸・℃） */}
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="outsideTemp"
                            name="車外気温(℃)"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={false}
                        />
                        {/* 走行可能距離（右軸・km） */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="batteryRangeKm"
                            name="走行可能距離(km)"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                        />
                        {/* 日次走行距離（右軸・km） */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="dailyDistanceKm"
                            name="日次走行距離(km)"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <p style={{margin: "8px 0 0", opacity: 0.7, fontSize: 12}}>
                ※欠測（null）はグラフ上で途切れます。気温と電池残量・走行距離の相関を確認できます。
            </p>
        </div>
    );
}
