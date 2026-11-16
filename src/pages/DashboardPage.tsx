import { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Package,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { BaseDonnees, PageId } from '../types';
import { formatDateHeure, formatPrix, getStatutStock } from '../utils/format';

interface DashboardPageProps {
  donnees: BaseDonnees;
  onAllerPage: (page: PageId) => void;
}

export default function DashboardPage({ donnees, onAllerPage }: DashboardPageProps) {
  const { produits, ventes, depenses, parametres } = donnees;

  const resume = useMemo(() => {
    const chiffreAffaires = ventes.reduce((acc, v) => acc + v.total, 0);
    const valeurStock = produits.reduce((acc, p) => acc + p.prixAchat * p.stock, 0);
    const totalDepenses = depenses.reduce((acc, d) => acc + d.montant, 0);
    const alertes = produits.filter((p) => getStatutStock(p.stock, p.seuil) !== 'en_stock');

    return {
      chiffreAffaires,
      valeurStock,
      totalDepenses,
      nombreVentes: ventes.length,
      alertes,
    };
  }, [produits, ventes, depenses]);

  const dernieresVentes = ventes.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Cartes statistiques principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Chiffre d&apos;affaires</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatPrix(resume.chiffreAffaires, parametres.devise)}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            {resume.nombreVentes} vente(s) enregistrée(s)
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Valeur du stock (achat)</span>
            <Boxes className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatPrix(resume.valeurStock, parametres.devise)}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            {produits.length} référence(s) au catalogue
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total des dépenses</span>
            <ShoppingCart className="h-4 w-4 text-slate-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatPrix(resume.totalDepenses, parametres.devise)}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            {depenses.length} dépense(s) saisie(s)
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Alertes de stock</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 tabular-nums">
            {resume.alertes.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">Produits à réapprovisionner</div>
        </div>
      </div>

      {/* Raccourcis d'action */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onAllerPage('caisse')}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <ShoppingCart className="h-4 w-4" />
          Ouvrir la caisse
        </button>
        <button
          type="button"
          onClick={() => onAllerPage('produits')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          <Package className="h-4 w-4" />
          Gérer les produits
        </button>
        <button
          type="button"
          onClick={() => onAllerPage('stocks')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          <Boxes className="h-4 w-4" />
          Entrée de stock
        </button>
      </div>

      {/* Deux colonnes : Dernières ventes + Alertes stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Dernières ventes</h2>
            <button
              type="button"
              onClick={() => onAllerPage('historique')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
            >
              Tout voir <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {dernieresVentes.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Aucune vente enregistrée pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {dernieresVentes.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {v.numeroFacture} · {v.clientNom}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDateHeure(v.date)} · {v.modePaiement}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatPrix(v.total, parametres.devise)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Produits sous le seuil</h2>
            <button
              type="button"
              onClick={() => onAllerPage('stocks')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
            >
              Réapprovisionner <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {resume.alertes.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Tous les articles ont un niveau de stock normal.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {resume.alertes.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="min-w-0 pr-3">
                    <div className="truncate font-semibold text-slate-900">{p.nom}</div>
                    <div className="font-mono text-xs text-slate-500">
                      Réf: {p.reference} · Seuil: {p.seuil}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-xs font-bold tabular-nums ${
                      p.stock === 0 ? 'text-red-600' : 'text-amber-600'
                    }`}
                  >
                    {p.stock === 0 ? 'Rupture (0)' : `${p.stock} en stock`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
