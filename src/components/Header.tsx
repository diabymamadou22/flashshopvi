import { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  History,
  Home,
  LayoutGrid,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  UserCircle2,
  Wallet,
} from 'lucide-react';
import { PageId, ParametresBoutique, Produit } from '../types';
import PWAInstallButton from './PWAInstallButton';

interface HeaderProps {
  pageActive: PageId;
  parametres: ParametresBoutique;
  produitsEnAlerte: Produit[];
  onOuvrirMenu: () => void;
  onAllerPage: (page: PageId) => void;
}

const TITRES_PAGES: Record<PageId, { titre: string; icone: typeof Home }> = {
  dashboard: { titre: 'Tableau de bord', icone: Home },
  produits: { titre: 'Produits', icone: Package },
  categories: { titre: 'Catégories', icone: LayoutGrid },
  caisse: { titre: 'Ventes (Caisse)', icone: ShoppingCart },
  historique: { titre: 'Historique des ventes', icone: History },
  stocks: { titre: 'Stocks', icone: Boxes },
  depenses: { titre: 'Dépenses', icone: Wallet },
  rapports: { titre: 'Rapports', icone: BarChart3 },
  parametres: { titre: 'Paramètres', icone: Settings },
};

export default function Header({
  pageActive,
  parametres,
  produitsEnAlerte,
  onOuvrirMenu,
  onAllerPage,
}: HeaderProps) {
  const [alertesOuvertes, setAlertesOuvertes] = useState(false);
  const info = TITRES_PAGES[pageActive];
  const IconePage = info.icone;

  return (
    <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-3 sm:h-16 sm:px-6">
      {/* Zone gauche : bouton mobile + titre de page */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOuvrirMenu}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <IconePage className="h-5 w-5 shrink-0 text-[#0A3072]" />
          <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-xl">
            {info.titre}
          </h1>
        </div>
      </div>

      {/* Zone droite : bouton installation + alertes stock + compte gérant */}
      <div className="relative flex shrink-0 items-center gap-1.5 sm:gap-3">
        <PWAInstallButton />

        <button
          type="button"
          onClick={() => setAlertesOuvertes((prev) => !prev)}
          className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Alertes de stock"
        >
          <Bell className="h-5 w-5" />
          {produitsEnAlerte.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white tabular-nums">
              {produitsEnAlerte.length}
            </span>
          )}
        </button>

        {alertesOuvertes && (
          <div className="absolute right-0 top-12 z-30 w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-sm font-semibold text-slate-900">
                Alertes stock ({produitsEnAlerte.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setAlertesOuvertes(false);
                  onAllerPage('stocks');
                }}
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                Gérer les stocks
              </button>
            </div>
            {produitsEnAlerte.length === 0 ? (
              <p className="py-3 text-center text-xs text-slate-500">
                Tous les produits ont un stock suffisant.
              </p>
            ) : (
              <ul className="max-h-60 space-y-2 overflow-y-auto">
                {produitsEnAlerte.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 shrink-0 ${
                          p.stock === 0 ? 'text-red-600' : 'text-amber-600'
                        }`}
                      />
                      <span className="truncate font-medium text-slate-800">{p.nom}</span>
                    </div>
                    <span
                      className={`shrink-0 font-mono font-semibold tabular-nums ${
                        p.stock === 0 ? 'text-red-600' : 'text-amber-700'
                      }`}
                    >
                      {p.stock} restant(s)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => onAllerPage('parametres')}
          className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-1.5 text-left transition-colors hover:bg-slate-50"
        >
          <UserCircle2 className="h-7 w-7 shrink-0 text-[#0A3072]" />
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-900">{parametres.nomGerant}</div>
            <div className="text-[11px] text-slate-500">{parametres.roleGerant}</div>
          </div>
        </button>
      </div>
    </header>
  );
}
