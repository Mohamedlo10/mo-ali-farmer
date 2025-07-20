import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, LogOut, Plus, ChevronDown, Menu, X, User } from "lucide-react";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Accueil", href: "/accueil", icon: Home },
  { label: "Détection", href: "/detection", icon: Search },
  { label: "Marchés", href: "/marche", icon: ShoppingCart },
  { label: "Déconnexion", href: "/logout", icon: LogOut, isLogout: true },
];

// Ajouter cette interface pour typer les sous-routes
interface SubRoute {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Mettre à jour la déclaration de subRoutes avec un index signature
const subRoutes: Record<string, SubRoute[]> = {
  "/accueil": [
    { label: "Nouveau", href: "/accueil/nouveau", icon: Plus },
    { label: "Profile", href: "/accueil/profile", icon: User }
  ]
};


interface BreadcrumbItemType {
  label: string;
  href: string;
  isLast: boolean;
}



export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    setShowLogoutDialog(false);
    // Logique de déconnexion ici
    router.push("/");
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.length === 0) return [];
    
    const breadcrumbs: BreadcrumbItemType[] = [];
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const navItem = navItems.find(item => item.href === currentPath);
      const isLast = index === segments.length - 1;
      
      if (navItem) {
        breadcrumbs.push({
          label: navItem.label,
          href: currentPath,
          isLast
        });
      } else {
        // Pour les sous-routes
        const parentPath = `/${segments[0]}`;
        const subRoute = subRoutes[parentPath]?.find(sub => sub.href === currentPath);
        if (subRoute) {
          breadcrumbs.push({
            label: subRoute.label,
            href: currentPath,
            isLast
          });
        }
      }
    });
    
    return breadcrumbs;
  };

  const isActiveRoute = (href: string) => {
    if (href === '/logout') return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

// Mettre à jour la fonction getCurrentSubRoutes pour gérer le cas où la route n'existe pas
const getCurrentSubRoutes = (): SubRoute[] => {
  const mainRoute = '/' + pathname.split('/')[1];
  return subRoutes[mainRoute as keyof typeof subRoutes] || [];
};

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-emerald-100 h-full shadow-sm">
        <div className="w-full">
          <div className="flex items-center justify-center h-16">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center md:space-x-8 space-x-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                const currentSubs = item.href !== '/logout' ? getCurrentSubRoutes() : [];
                const hasSubRoutes = currentSubs.length > 0 && isActive;

                if (item.isLogout) {
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      onClick={() => setShowLogoutDialog(true)}
                      className={`
                        h-12 px-4 rounded-lg transition-all duration-300 ease-in-out
                        text-gray-700 hover:text-[#0f612d] hover:bg-emerald-50
                        border border-transparent hover:border-emerald-100
                        group relative overflow-hidden font-medium
                      `}
                    >
                      <Icon className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  );
                }

                return (
                  <div key={item.href} className="relative group">
                    <Button
                      variant="ghost"
                      onClick={() => router.push(item.href)}
                      className={`
                        h-12 px-4 rounded-lg transition-all duration-300 ease-in-out
                        border relative overflow-hidden
                        ${isActive 
                          ? 'bg-emerald-50 text-[#0f612d] border-emerald-200 shadow-sm' 
                          : 'text-gray-700 hover:text-[#0f612d] hover:bg-emerald-50/80 border-transparent hover:border-emerald-100'
                        }
                        group-hover:scale-[1.02] font-medium
                      `}
                    >
                      <Icon className={`w-4 h-4 mr-2 transition-all duration-200 ${isActive ? 'text-[#0f612d]' : ''} group-hover:scale-110`} />
                      <span className="font-medium">{item.label}</span>
                      {hasSubRoutes && (
                        <ChevronDown className="w-3 h-3 ml-1 transition-transform duration-200 group-hover:rotate-180" />
                      )}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-400/20 rounded-lg -z-10 opacity-50" />
                      )}
                    </Button>
                    
                    {/* Dropdown pour les sous-routes */}
                    {hasSubRoutes && (
                      <div className="absolute top-full left-0 mt-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                        <div className="bg-white rounded-lg shadow-lg border border-emerald-50 overflow-hidden">
                          {currentSubs.map((subItem:any) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = pathname === subItem.href;
                            return (
                              <button
                                key={subItem.href}
                                onClick={() => router.push(subItem.href)}
                                className={`
                                  w-full px-4 py-3 text-left transition-all duration-200
                                  flex items-center space-x-2 hover:bg-emerald-50
                                  ${isSubActive ? 'bg-emerald-50 text-[#0f612d]' : 'text-gray-700'}
                                `}
                              >
                                <SubIcon className="w-4 h-4" />
                                <span className="font-medium">{subItem.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/20 bg-white/95 backdrop-blur-md">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);

                if (item.isLogout) {
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      onClick={() => {
                        setShowLogoutDialog(true);
                        setMobileOpen(false);
                      }}
                      className="w-full justify-start text-red-600 hover:bg-red-50 font-medium"
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  );
                }

                return (
                  <div key={item.href}>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        router.push(item.href);
                        setMobileOpen(false);
                      }}
                      className={`
                        w-full justify-start transition-all duration-200
                        ${isActive 
                          ? 'bg-emerald-50 text-[#0f612d] border-l-4 border-[#0f612d]' 
                          : 'text-gray-700 hover:bg-emerald-50'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                    
                    {/* Sous-routes mobiles */}
                    {isActive && getCurrentSubRoutes().map((subItem:any) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = location.pathname === subItem.href;
                      return (
                        <Button
                          key={subItem.href}
                          variant="ghost"
                          onClick={() => {
                            router.push(subItem.href);
                            setMobileOpen(false);
                          }}
                          className={`
                            w-full justify-start ml-6 transition-all duration-200
                            ${isSubActive ? 'bg-emerald-50 text-[#0f612d]' : 'text-gray-600 hover:bg-emerald-50'}
                          `}
                        >
                          <SubIcon className="w-4 h-4 mr-3" />
                          {subItem.label}
                        </Button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumbs */}
      {getBreadcrumbs().length > 0 && (
        <div className="bg-white  border-emerald-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                {getBreadcrumbs().map((crumb, index) => (
                  <BreadcrumbItem key={crumb.href}>
                    {crumb.isLast ? (
                      <BreadcrumbPage className="text-[#0f612d] font-medium">
                        {/* {crumb.label} */}
                      </BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink 
                          onClick={() => router.push(crumb.href)}
                          className="text-gray-600 hover:text-[#0f612d] transition-colors duration-200 cursor-pointer font-medium"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                      </>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 transform transition-all duration-200 scale-100 border border-emerald-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-[#0f612d]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Déconnexion</h3>
                <p className="text-gray-600">Voulez-vous vraiment vous déconnecter ?</p>
              </div>
            </div>
            <div className="flex space-x-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#0f612d] hover:bg-[#0d5427] text-white"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}