import React, { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/common/Button";
import {
  FiHome,
  FiDollarSign,
  FiTarget,
  FiMessageCircle,
  FiLogOut,
  FiCreditCard,
} from "react-icons/fi";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/contas", icon: FiCreditCard, label: "Contas" },
    { path: "/movimentacoes", icon: FiDollarSign, label: "Movimentações" },
    { path: "/metas", icon: FiTarget, label: "Metas" },
    { path: "/chat", icon: FiMessageCircle, label: "Chat IA" },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold fontcolorprimary">Lumis</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                            isActive
                              ? "borderprimary fontcolorprimary"
                              : "borderfontheader"
                          }`
                        }
                      >
                        <Icon className="mr-2" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  {usuario?.nome}
                </span>
                <Button
                  variant="secondary"
                  className="flex justify-center items-center buttoncolorheaderout"
                  onClick={handleLogout}
                >
                  <FiLogOut className="mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        isActive
                          ? "borderprimary fontcolorprimary"
                          : "borderfontheader"
                      }`
                    }
                  >
                    <Icon className="inline mr-2" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>

      <style>{`
        .borderfontheader {
          color: #a9a9a9;
          border-color: transparent;
          transition: color 0.3s ease-in-out, border-color 0.3s ease-in-out;
        }

        .borderfontheader:hover {
          color:var(--color-secondary);
          border-color: var(--color-secondary);
        }

        .buttoncolorheaderout {
          font-color: var(--color-primary);
          background-color: var(--color-secondary-opacity);
          transition: var(--trasitions-buttons);
        }

        .buttoncolorheaderout:hover {
          color: var(--white);
          background-color: var(--color-primary);
          box-shadow: var(--box-shadow-button);
        }
      `}</style>
    </>
  );
};
