import {
  BarChart3,
  Boxes,
  History,
  Home,
  LayoutGrid,
  MapPin,
  Package,
  Phone,
  Settings,
  ShoppingCart,
  Store,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { PageId, ParametresBoutique } from '../types';

interface SidebarProps {
  pageActive: PageId;
  onChangerPage: (page: PageId) => void;
  parametres: ParametresBoutique;
  ouvertMobile: boolean;
  onFermerMobile: () => void;
}

const ELEMENTS_MENU: { id: PageId; label: string; icone: typeof Home }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icone: Home },
  { id: 'produits', label: 'Produits', icone: Package },
  { id: 'categories', label: 'Catégories', icone: LayoutGrid },
  { id: 'caisse', label: 'Ventes (Caisse)', icone: ShoppingCart },
  { id: 'historique', label: 'Historique des ventes', icone: History },
  { id: 'stocks', label: 'Stocks', icone: Boxes },
  { id: 'depenses', label: 'Dépenses', icone: Wallet },
  { id: 'rapports', label: 'Rapports', icone: BarChart3 },
  { id: 'parametres', label: 'Paramètres', icone: Settings },
];

export default function Sidebar({
  pageActive,
  onChangerPage,
  parametres,
  ouvertMobile,
  onFermerMobile,
}: SidebarProps) {
  const selectionner = (page: PageId) => {
    onChangerPage(page);
    onFermerMobile();
  };

  return (
    <>
      {ouvertMobile && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={onFermerMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between bg-gradient-to-b from-[#0A3072] to-[#061E4A] text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          ouvertMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* En-tête de la marque */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <Zap className="h-5 w-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-bold tracking-tight text-white">
                  {parametres.nomBoutique}
                </div>
                <div className="truncate text-xs text-blue-200">{parametres.sousTitre}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onFermerMobile}
              className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu principal */}
          <nav className="space-y-1 px-3 py-4" aria-label="Navigation principale">
            {ELEMENTS_MENU.map((item) => {
              const Icone = item.icone;
              const estActif = pageActive === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectionner(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors whitespace-nowrap ${
                    estActif
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icone className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Carte d'information boutique en bas */}
        <div className="p-3.5">
          <div className="rounded-xl border border-white/15 bg-white/5 p-3.5 text-xs text-blue-100">
            <div className="mb-2.5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                <Store className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-white">{parametres.nomBoutique}</div>
                <div className="truncate text-[11px] text-blue-200">Boutique Électronique</div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px] text-blue-100">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-blue-300" />
                <span className="truncate tabular-nums">{parametres.telephone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-300" />
                <span className="truncate">{parametres.adresse}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
