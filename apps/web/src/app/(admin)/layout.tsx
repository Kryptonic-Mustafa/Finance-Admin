import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { RealtimeSync } from "@/components/layout/realtime-sync";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getAllowedPaths } from "@/server/actions/permission-actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const role = session.role;
  const name = session.name;
  const authUserId = session.id;
  const isMasterAdmin = session.isMasterAdmin;

  const cookieStore = await cookies();
  const currentView = cookieStore.get('impersonated_user')?.value || authUserId;

  let allUsers: any[] = [];
  if (isMasterAdmin) {
    allUsers = await prisma.user.findMany({ where: { status: 'ACTIVE' }, select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } });
  }

  // Fetch Currency Master Data and current user's preference
  const currencies = await prisma.currency.findMany({ orderBy: { code: 'asc' } });
  let currentCurrency = 'USD';
  if (authUserId) {
    const user = await prisma.user.findUnique({ where: { id: authUserId }, select: { currencyCode: true } });
    if (user?.currencyCode) currentCurrency = user.currencyCode;
  }

  const allowedPaths = await getAllowedPaths(authUserId);

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      <Sidebar allowedPaths={allowedPaths} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userRole={role} userName={name} authUserId={authUserId} allUsers={allUsers} currentView={currentView} currencies={currencies} currentCurrency={currentCurrency} isMasterAdmin={isMasterAdmin} />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
          {children}
        </main>
        <BottomNav allowedPaths={allowedPaths} />
        <RealtimeSync />
      </div>
    </div>
  );
}
