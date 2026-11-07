import { StatCard } from "@/components/ui";

export default function DashboardStats() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Documents" value="—" detail="No data yet" />
            <StatCard label="Conversations" value="—" detail="No data yet" />
            <StatCard label="Requests" value="—" detail="No data yet" />
            <StatCard label="Requests" value="—" detail="No data yet" />
            <StatCard label="Requests" value="—" detail="No data yet" />
            <StatCard label="Requests" value="—" detail="No data yet" />
        </div>
    );
}
