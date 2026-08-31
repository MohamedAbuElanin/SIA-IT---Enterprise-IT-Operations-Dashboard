import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

const routeNameMap: Record<string, string> = {
  assets: 'Assets',
  inventory: 'Inventory',
  maintenance: 'Maintenance',
  kb: 'Knowledge Base',
  licenses: 'Licenses',
  network: 'Network',
  servers: 'Servers',
  reports: 'Reports',
  settings: 'Settings',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-2 space-x-reverse text-xs text-slate-400 py-1">
      <Link to="/" className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>HQ Portal</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[value] || value;

        return (
          <React.Fragment key={to}>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-200">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-slate-200 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
