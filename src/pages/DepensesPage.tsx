import { FormEvent, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Depense } from '../types';
import { formatDateCourte, formatPrix, genererId } from '../utils/format';

interface DepensesPageProps {
  depenses: Depense[];
  devise: string;
  onAjouterDepense: (depense: Depense) => void;
  onSupprimerDepense: (id: string) => void;
}

export default function DepensesPage({
  depenses,
  devise,
  onAjouterDepense,
  onSupprimerDepense,
}: DepensesPageProps) {
  const [libelle, setLibelle] = useState('');
  const [categorie, setCategorie] = useState<Depense['categorie']>('Loyer');
  const [montant, setMontant] = useState('');

  const totalDepenses = useMemo(
    () => depenses.reduce((acc, d) => acc + d.montant, 0),
    [depenses]
  );

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    const valeur = Number(montant);
    if (!libelle.trim() || Number.isNaN(valeur) || valeur <= 0) return;

    onAjouterDepense({
      id: genererId('dep'),
      libelle: libelle.trim(),
      categorie,
      montant: valeur,
      date: new Date().toISOString(),
    });

    setLibelle('');
    setMontant('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Formulaire de saisie d'une dépense */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-1">
        <h2 className="mb-4 text-base font-bold text-slate-900">Enregistrer une dépense</h2>
        <form onSubmit={soumettre} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Libellé *</label>
            <input
              type="text"
              required
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              placeholder="Ex: Facture d'électricité"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Catégorie</label>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value as Depense['categorie'])}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="Loyer">Loyer</option>
              <option value="Electricite">Électricité / Eau</option>
              <option value="Transport">Transport / Livraison</option>
              <option value="Salaires">Salaires</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Montant ({devise}) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="Ex: 25000"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums focus:border-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Ajouter la dépense
          </button>
        </form>
      </section>

      {/* Tableau des dépenses */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Dépenses enregistrées ({depenses.length})
          </h2>
          <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
            Total : {formatPrix(totalDepenses, devise)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#0D357A] text-xs font-semibold text-white">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Libellé</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {depenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    Aucune dépense saisie.
                  </td>
                </tr>
              ) : (
                depenses.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {formatDateCourte(d.date)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{d.libelle}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{d.categorie}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatPrix(d.montant, devise)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onSupprimerDepense(d.id)}
                        className="rounded-lg bg-red-600 p-1.5 text-white hover:bg-red-700"
                        title="Supprimer"
                        aria-label={`Supprimer ${d.libelle}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
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
