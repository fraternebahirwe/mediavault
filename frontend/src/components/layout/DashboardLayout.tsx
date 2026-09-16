import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { UploadProvider, useUploadContext } from "../../context/UploadContext";
import { UploadModal } from "../files/UploadModal";

function LayoutContent() {
  const { openUpload } = useUploadContext();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onUploadClick={() => openUpload()} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <UploadModal />
    </div>
  );
}

export function DashboardLayout() {
  return (
    <UploadProvider>
      <LayoutContent />
    </UploadProvider>
  );
}
