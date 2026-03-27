import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <AdminSidebar />
      <div className="flex-1 bg-gray-50 p-6 lg:p-8">{children}</div>
    </div>
  );
}
