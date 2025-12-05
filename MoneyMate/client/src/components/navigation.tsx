import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, UserPlus, Database } from "lucide-react";
import AuthDialog from "@/components/auth-dialog";
import BackupDialog from "@/components/backup-dialog";

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/add", label: "Add Transaction" },
    { path: "/transactions", label: "Transactions" },
    { path: "/reports", label: "Reports" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold finance-blue" data-testid="app-title">
                MoneyMate
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    isActive(item.path)
                      ? "border-[var(--finance-blue)] finance-blue border-b-2"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2"
                  } py-4 px-1 text-sm font-medium transition-colors`}
                  data-testid={`nav-link-${item.path === "/" ? "dashboard" : item.path.slice(1)}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/add">
              <Button 
                className="bg-finance-green text-white hover:bg-green-700 transition-colors"
                data-testid="button-add-transaction"
              >
                + Add Transaction
              </Button>
            </Link>
            <BackupDialog>
              <Button 
                className="bg-finance-blue text-white hover:bg-blue-700 transition-colors"
                data-testid="button-backup"
              >
                <Database className="w-4 h-4 mr-2" />
                Backup
              </Button>
            </BackupDialog>
            <AuthDialog>
              <Button 
                className="bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                data-testid="button-auth"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </AuthDialog>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${
                  isActive(item.path)
                    ? "finance-blue bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } block px-3 py-2 text-base font-medium rounded-md transition-colors`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`nav-link-mobile-${item.path === "/" ? "dashboard" : item.path.slice(1)}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-3 py-2 space-y-2">
              <Link href="/add">
                <Button 
                  className="w-full bg-finance-green text-white hover:bg-green-700 transition-colors"
                  data-testid="button-add-transaction-mobile"
                >
                  + Add Transaction
                </Button>
              </Link>
              <BackupDialog>
                <Button 
                  className="w-full bg-finance-blue text-white hover:bg-blue-700 transition-colors"
                  data-testid="button-backup-mobile"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Backup Data
                </Button>
              </BackupDialog>
              <AuthDialog>
                <Button 
                  className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  data-testid="button-auth-mobile"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </AuthDialog>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
