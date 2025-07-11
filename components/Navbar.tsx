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

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full backdrop-blur bg-emerald-700 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo ou titre ici si besoin */}
          <div className="flex items-center justify-between w-full">
            {/* Desktop menu */}
            <div className="hidden md:flex lg:space-x-12 space-x-4">
              {navItems.map((item) =>
                item.isLogout ? (
                  <button
                    key={item.href}
                    className={
                      "font-semibold px-3 py-2 rounded hover:bg-emerald-100 hover:text-emerald-700 transition-colors" +
                      ((pathname === item.href || (item.href !== '/logout' && item.href !== '/accueil' && pathname.startsWith(item.href))) ? " bg-white text-emerald-800 font-bold" : " text-white")
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
                      ((pathname === item.href || (item.href !== '/logout' && item.href !== '/accueil' && pathname.startsWith(item.href))) ? " bg-white text-emerald-800 font-bold" : " text-white")
                    }
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
            {/* Hamburger for mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white focus:outline-none"
                aria-label="Ouvrir le menu"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col space-y-2 py-2">
            {navItems.map((item) =>
              item.isLogout ? (
                <button
                  key={item.href}
                  className={
                    "font-semibold px-3 py-2 rounded hover:bg-emerald-100 hover:text-emerald-700 transition-colors text-white text-left w-full" +
                    ((pathname === item.href || (item.href !== '/logout' && item.href !== '/accueil' && pathname.startsWith(item.href))) ? " bg-white text-green-800 font-bold" : "")
                  }
                  onClick={() => { openDialog(); setDialogInternalOpen(true); setMenuOpen(false); }}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "font-semibold px-3 py-2 cursor-pointer rounded hover:bg-emerald-100 hover:text-emerald-700 transition-colors block w-full text-left" +
                    ((pathname === item.href || (item.href !== '/logout' && item.href !== '/accueil' && pathname.startsWith(item.href))) ? " bg-white text-green-800 font-bold" : "")
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        )}
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
