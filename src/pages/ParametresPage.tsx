import { FormEvent, useState } from 'react';
import { CheckCircle2, Download, RotateCcw, Save } from 'lucide-react';
import { BaseDonnees, ParametresBoutique } from '../types';

interface ParametresPageProps {
  donnees: BaseDonnees;
  onSauvegarderParametres: (parametres: ParametresBoutique) => void;
  onReinitialiserBase: () => void;
}

export default function ParametresPage({
  donnees,
  onSauvegarderParametres,
  onReinitialiserBase,
}: ParametresPageProps) {
  const [form, setForm] = useState<ParametresBoutique>(donnees.parametres);
  const [messageSucces, setMessageSucces] = useState('');
  const [confirmationReset, setConfirmationReset] = useState(false);

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    onSauvegarderParametres(form);
    setMessageSucces('Paramètres enregistrés dans la base locale.');
    setTimeout(() => setMessageSucces(''), 3000);
  };

  const exporterSauvegardeJson = () => {
    const contenu = JSON.stringify(donnees, null, 2);
    const blob = new Blob([contenu], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `flash-shop-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    lien.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Informations de la boutique */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
        <h2 className="mb-4 text-base font-bold text-slate-900">Informations de la boutique</h2>

        <form onSubmit={soumettre} className="space-y-4">
          {messageSucces && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {messageSucces}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nom de la boutique
              </label>
              <input
                type="text"
                required
                value={form.nomBoutique}
                onChange={(e) => setForm({ ...form, nomBoutique: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Activité / Sous-titre
              </label>
              <input
                type="text"
                value={form.sousTitre}
                onChange={(e) => setForm({ ...form, sousTitre: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone</label>
              <input
                type="text"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse</label>
              <input
                type="text"
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nom du gérant
              </label>
              <input
                type="text"
                value={form.nomGerant}
                onChange={(e) => setForm({ ...form, nomGerant: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Devise</label>
              <input
                type="text"
                value={form.devise}
                onChange={(e) => setForm({ ...form, devise: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Save className="h-4 w-4" />
            Enregistrer les modifications
          </button>
        </form>
      </section>

      {/* Gestion de la base locale */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">Base de données locale</h2>
        <p className="text-xs leading-relaxed text-slate-600">
          Les données (produits, catégories, ventes, mouvements et dépenses) sont enregistrées
          localement dans votre navigateur via <code className="font-mono">localStorage</code>.
        </p>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={exporterSauvegardeJson}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Exporter les données (JSON)
          </button>

          {!confirmationReset ? (
            <button
              type="button"
              onClick={() => setConfirmationReset(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser les données de démo
            </button>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <p className="mb-2 font-semibold">
                Confirmer la remise à zéro avec les données initiales ?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onReinitialiserBase();
                    setConfirmationReset(false);
                    setMessageSucces('Base locale réinitialisée.');
                  }}
                  className="rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700"
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmationReset(false)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
