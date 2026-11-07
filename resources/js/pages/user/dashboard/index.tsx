import DashboardStats from "./components/DashboardStats";
import UserLayout from "../layout";

export default function Dashboard() {
    return (
        <>
            <DashboardStats />
        </>
    );
}

Dashboard.layout = UserLayout;
