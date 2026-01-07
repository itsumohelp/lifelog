"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import type {VehicleWithOverride} from "./page";

type VehicleFormData = {
    vehicleId: string;
    displayName: string;
    vehicleGrade: string;
    capacityKwh: string;
};

type Props = {
    vehicles: VehicleWithOverride[];
};

export default function VehicleConfirmForm({vehicles}: Props) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 初期値: overrideがあればその値、なければオリジナル値
    const [formData, setFormData] = useState<VehicleFormData[]>(
        vehicles.map((v) => ({
            vehicleId: v.id,
            displayName: v.override?.displayName ?? v.displayName ?? "",
            vehicleGrade: v.override?.vehicleGrade ?? v.vehicleGrade ?? "",
            capacityKwh: v.override?.capacityKwh?.toString() ?? v.capacityKwh?.toString() ?? "",
        }))
    );

    const handleChange = (index: number, field: keyof VehicleFormData, value: string) => {
        setFormData((prev) => {
            const updated = [...prev];
            updated[index] = {...updated[index], [field]: value};
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                vehicles: formData.map((v) => ({
                    vehicleId: v.vehicleId,
                    displayName: v.displayName || null,
                    vehicleGrade: v.vehicleGrade || null,
                    capacityKwh: v.capacityKwh ? parseFloat(v.capacityKwh) : null,
                })),
            };

            const res = await fetch("/api/tesla/confirm-vehicles", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.error || "保存に失敗しました");
            }

            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                {vehicles.map((vehicle, index) => (
                    <div
                        key={vehicle.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            車両 {index + 1}
                            {vehicle.displayName && (
                                <span className="text-gray-500 font-normal ml-2">
                                    ({vehicle.displayName})
                                </span>
                            )}
                        </h2>

                        <div className="space-y-4">
                            {/* 表示名 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    表示名
                                </label>
                                <div className="text-xs text-gray-500 mb-1">
                                    API取得値: {vehicle.displayName || "(なし)"}
                                </div>
                                <input
                                    type="text"
                                    value={formData[index].displayName}
                                    onChange={(e) => handleChange(index, "displayName", e.target.value)}
                                    placeholder="例: マイカー"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* 車種 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    車種
                                </label>
                                <div className="text-xs text-gray-500 mb-1">
                                    API取得値: {vehicle.vehicleGrade || "(なし)"}
                                </div>
                                <input
                                    type="text"
                                    value={formData[index].vehicleGrade}
                                    onChange={(e) => handleChange(index, "vehicleGrade", e.target.value)}
                                    placeholder="例: Model 3 Long Range"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* バッテリー容量 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    バッテリー容量 (kWh)
                                </label>
                                <div className="text-xs text-gray-500 mb-1">
                                    API取得値: {vehicle.capacityKwh ? `${vehicle.capacityKwh} kWh` : "(なし)"}
                                </div>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData[index].capacityKwh}
                                    onChange={(e) => handleChange(index, "capacityKwh", e.target.value)}
                                    placeholder="例: 75.0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <div className="mt-6 flex justify-center">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? "保存中..." : "この内容でOK"}
                </button>
            </div>
        </form>
    );
}
