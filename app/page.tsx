export default function Home() {
    return (
        <div>
            <h1>Welcome to Wallet Manager 0.1.3</h1>
            <div>Build: {process.env.APP_BUILD_SHA ?? "unknown"}</div>
        </div >
    );
}
