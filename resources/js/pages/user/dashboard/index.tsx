import DashboardStats from './components/DashboardStats';
import UserLayout from '../../../Layouts/UserLayout';

export default function Dashboard() {
    return (
        <>
            <DashboardStats />
        </>
    );
}

Dashboard.layout = UserLayout;
