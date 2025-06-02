import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, BuildingIcon, Factory, Boxes, Search, ClipboardCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r border-border">
        <div className="flex items-center justify-center h-16 border-b border-border">
          <h1 className="text-xl font-bold text-primary">Rmanage</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/" className={`flex items-center px-4 py-3 rounded-md ${isActive('/')}`}>
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/empresas" className={`flex items-center px-4 py-3 rounded-md ${isActive('/empresas')}`}>
                <Building2 className="mr-3 h-5 w-5" />
                Empresas
              </Link>
            </li>
            <li>
              <Link to="/unidades" className={`flex items-center px-4 py-3 rounded-md ${isActive('/unidades')}`}>
                <BuildingIcon className="mr-3 h-5 w-5" />
                Unidades
              </Link>
            </li>
            <li>
              <Link to="/setores" className={`flex items-center px-4 py-3 rounded-md ${isActive('/setores')}`}>
                <Factory className="mr-3 h-5 w-5" />
                Setores
              </Link>
            </li>
            <li>
              <Link to="/equipamentos" className={`flex items-center px-4 py-3 rounded-md ${isActive('/equipamentos')}`}>
                <Boxes className="mr-3 h-5 w-5" />
                Equipamentos
              </Link>
            </li>
            <li>
              <Link to="/inspecoes" className={`flex items-center px-4 py-3 rounded-md ${isActive('/inspecoes')}`}>
                <ClipboardCheck className="mr-3 h-5 w-5" />
                Inspeções
              </Link>
            </li>
            <li>
              <Link to="/busca" className={`flex items-center px-4 py-3 rounded-md ${isActive('/busca')}`}>
                <Search className="mr-3 h-5 w-5" />
                Busca
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
        <div className="grid h-full grid-cols-7">
          <Link to="/" className="flex flex-col items-center justify-center">
            <LayoutDashboard className={`h-6 w-6 ${location.pathname === '/' ? 'text-primary' : 'text-gray-500'}`} />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link to="/empresas" className="flex flex-col items-center justify-center">
            <Building2 className={`h-6 w-6 ${location.pathname === '/empresas' ? 'text-primary' : 'text-gray-500'}`} />
            <span className="text-xs mt-1">Empresas</span>
          </Link>
          <Link to="/unidades" className="flex flex-col items-center justify-center">
            <BuildingIcon className={`h-6 w-6 ${location.pathname === '/unidades' ? 'text-primary' : 'text-gray-500'}`} />
            <span className="text-xs mt-1">Unidades</span>
          </Link>
          <Link to="/setores" className="flex flex-col items-center justify-center">
            <Factory className={`h-6 w-6 ${location.pathname === '/setores' ? 'text-primary' : 'text-gray-500'}`} />
            <span className="text-xs mt-1">Setores</span>
          </Link>
          <Link to="/equipamentos" className="flex flex-col items-center justify-center">
            <Boxes className={`h-6 w-6 ${location.pathname === '/equipamentos' ? 'text-primary' : 'text-gray-500'}`} />
            <span className="text-xs mt-1">Equipamentos</span>
          </Link>
          <Link to="/inspecoes" className="flex flex-col items-center justify-center">
            <ClipboardCheck className={`h-6 w-6 ${location.pathname === '/inspecoes' ? 'text-primary' : 'text-gray-500'}`} />
            <span className="text-xs mt-1">Inspeções</span>
          </Link>
          <Link to="/busca" className="flex flex-col items-center justify-center">
            <Search className={`h-6 w-6 ${location.pathname === '/busca' ? 'text-primary' : 'text-gray-500'}`} />
            <span className="text-xs mt-1">Busca</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;