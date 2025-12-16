import BuildInfo from "./buildInfo";
import SyncVehiclesButton from "./sync-vehicles-button";

export default function DashboardPage() {
    return (
        <main style={{padding: 16}}>
            <h1>Dashboard</h1>

            <section style={{marginTop: 16}}>
                <h2>車両データ</h2>
                <p>Fleet APIから車両一覧を取得してDBに同期します。</p>
                <SyncVehiclesButton />
            </section>
            <BuildInfo />
        </main>
    );
}
