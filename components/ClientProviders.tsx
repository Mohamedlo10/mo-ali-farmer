"use client";
import { LoaderProvider, useLoader } from "@/components/LoaderContext";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { DialogProvider, useDialog } from "@/components/DialogContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import { usePathname } from "next/navigation";

function GlobalLoader() {
  const { loading } = useLoader();
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      <Loader size={64} />
    </div>
  );
}

function DialogWrapper({ children }: { children: React.ReactNode }) {
  const { dialogOpen } = useDialog();
  return (
    <div className={dialogOpen ? "blur-sm transition-all duration-200" : "transition-all duration-200"}>
      {children}
    </div>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/";
  return (
    <LoaderProvider>
      <DialogProvider>
        <GlobalLoader />
        {!hideNavbar && <Navbar />}
        <DialogWrapper>{children}</DialogWrapper>
        {/* Le ConfirmDialog sera appelé depuis la Navbar, mais peut être rendu ici si tu veux un dialog global */}
      </DialogProvider>
    </LoaderProvider>
  );
}
