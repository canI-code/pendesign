import { DashboardTopNav } from "@/components/layout/DashboardTopNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
            <DashboardTopNav />
            <div className="max-w-7xl mx-auto w-full">
                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
