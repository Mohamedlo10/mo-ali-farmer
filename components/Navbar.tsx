import Link from "next/link";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { userDeConnection } from "@/app/api/auth/query";
import { useRouter, usePathname } from "next/navigation";
import { useLoader } from "@/components/LoaderContext";
import { useDialog } from "@/components/DialogContext";

const navItems = [
  { label: "Accueil", href: "/accueil" },
  { label: "Détection cultures", href: "/detection" },
  { label: "Plans optimisés", href: "/plans" },
  { label: "Cultures", href: "/cultures" },
  { label: "Marché", href: "/marche" },
  { label: "Déconnexion", href: "/logout", isLogout: true },
];

export default function Navbar() {
  const [dialogInternalOpen, setDialogInternalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { showLoader, hideLoader } = useLoader();
  const { dialogOpen, openDialog, closeDialog } = useDialog();

  const handleLogout = async () => {
    closeDialog();
    setDialogInternalOpen(false);
    showLoader();
    try {
      await userDeConnection();
      router.push("/");
    } catch (err) {
      // Optionnel: afficher une erreur
    } finally {
      hideLoader();
    }
  };

  return (
    <nav className="w-full backdrop-blur bg-emerald-700 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-center">
          <div className="flex lg:space-x-12 space-x-4">
            {navItems.map((item) =>
              item.isLogout ? (
                <button
                  key={item.href}
                  className={
                    "font-semibold px-3 py-2 rounded hover:bg-emerald-100 hover:text-emerald-700 transition-colors" +
                    (pathname === item.href ? " bg-white text-emerald-800 font-bold" : " text-white")
                  }
                  onClick={() => { openDialog(); setDialogInternalOpen(true); }}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "font-semibold px-3 py-2 cursor-pointer rounded hover:bg-emerald-100 hover:text-emerald-700 transition-colors" +
                    (pathname === item.href ? " bg-white text-emerald-800 font-bold" : " text-white")
                  }
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={dialogOpen && dialogInternalOpen}
        title="Déconnexion"
        description="Voulez-vous vraiment vous déconnecter ?"
        onConfirm={handleLogout}
        onCancel={() => { closeDialog(); setDialogInternalOpen(false); }}
      />
    </nav>
  );
}
