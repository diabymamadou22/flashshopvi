import { FormEvent, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { MouvementStock, Produit } from '../types';
import { formatDateHeure, genererId } from '../utils/format';

interface StocksPageProps {
  produits: Produit[];
  mouvements: MouvementStock[];
  onEnregistrerMouvement: (mouvement: MouvementStock) => void;
}

export default function StocksPage({
  produits,
  mouvements,
  onEnregistrerMouvement,
}: StocksPageProps) {
  const [produitId, setProduitId] = useState(produits[0]?.id ?? '');
  const [type, setType] = useState<'entree' | 'sortie'>('entree');
  const [quantite, setQuantite] = useState('1');
  const [motif, setMotif] = useState('');
  const [erreur, setErreur] = useState('');

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    const produit = produits.find((p) => p.id === produitId);
    const qte = Number(quantite);

    if (!produit) {
      setErreur('Veuillez sélectionner un produit.');
      return;
    }
    if (Number.isNaN(qte) || qte <= 0) {
      setErreur('La quantité doit être supérieure à 0.');
      return;
    }
    if (type === 'sortie' && qte > produit.stock) {
      setErreur(`Stock insuffisant : seulement ${produit.stock} unité(s) disponible(s).`);
      return;
    }

    onEnregistrerMouvement({
      id: genererId('mvt'),
      produitId: produit.id,
      nomProduit: produit.nom,
      type,
      quantite: qte,
      motif:
        motif.trim() ||
        (type === 'entree' ? 'Approvisionnement boutique' : 'Sortie manuelle de stock'),
      date: new Date().toISOString(),
    });

    setQuantite('1');
    setMotif('');
    setErreur('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Formulaire de mouvement de stock */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-1">
        <h2 className="mb-4 text-base font-bold text-slate-900">Mouvement de stock</h2>

        <form onSubmit={soumettre} className="space-y-4">
          {erreur && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {erreur}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Produit *</label>
            <select
              value={produitId}
              onChange={(e) => setProduitId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              {produits.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.reference} — {p.nom} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Type d&apos;opération
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('entree')}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  type === 'entree'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownCircle className="h-4 w-4" />
                Entrée (+)
              </button>
              <button
                type="button"
                onClick={() => setType('sortie')}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  type === 'sortie'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpCircle className="h-4 w-4" />
                Sortie (-)
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Quantité *</label>
            <input
              type="number"
              min={1}
              required
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Motif</label>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex: Réception commande fournisseur"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="min-h-[44px] w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Enregistrer le mouvement
          </button>
        </form>
      </section>

      {/* Historique des mouvements */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
        <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5 sm:py-4">
          <h2 className="text-base font-bold text-slate-900">
            Journal des mouvements ({mouvements.length})
          </h2>
        </div>

        {/* Vue cartes mobile (< md) */}
        <div className="divide-y divide-slate-100 md:hidden">
          {mouvements.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              Aucun mouvement de stock enregistré.
            </p>
          ) : (
            mouvements.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{m.nomProduit}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{m.motif}</div>
                  <div className="mt-1 text-[11px] text-slate-400">{formatDateHeure(m.date)}</div>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`font-mono text-sm font-bold tabular-nums ${
                      m.type === 'entree' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {m.type === 'entree' ? `+${m.quantite}` : `-${m.quantite}`}
                  </span>
                  <div className="text-[11px] font-medium text-slate-500">
                    {m.type === 'entree' ? 'Entrée' : 'Sortie'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#0D357A] text-xs font-semibold text-white">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Quantité</th>
                <th className="px-4 py-3">Motif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mouvements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    Aucun mouvement de stock enregistré.
                  </td>
                </tr>
              ) : (
                mouvements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {formatDateHeure(m.date)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{m.nomProduit}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {m.type === 'entree' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <ArrowDownCircle className="h-3.5 w-3.5" /> Entrée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                          <ArrowUpCircle className="h-3.5 w-3.5" /> Sortie
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">
                      {m.type === 'entree' ? `+${m.quantite}` : `-${m.quantite}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{m.motif}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
