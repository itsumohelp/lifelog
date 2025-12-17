export default function Home() {
    console.log("client_s " + process.env.TESLA_CLIENT_SECRET!);

    return (
        <div>
            <h1>Welcome to Wallet Manager 0.1.9</h1>
            <a href="/dashboard">Go to Dashboard</a>
            <a href="/setting/tesla" style={{marginLeft: 16}}>Go to Tesla Settings</a>
            <a href="/api/tesla/login" style={{marginLeft: 16}}>Login with Tesla</a>
        </div >
    );
}
