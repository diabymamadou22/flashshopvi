import { FormEvent, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { Categorie, Produit } from '../types';
import { genererId } from '../utils/format';

interface CategoriesPageProps {
  categories: Categorie[];
  produits: Produit[];
  onAjouterCategorie: (categorie: Categorie) => void;
  onModifierCategorie: (categorie: Categorie) => void;
  onSupprimerCategorie: (id: string) => void;
}

export default function CategoriesPage({
  categories,
  produits,
  onAjouterCategorie,
  onModifierCategorie,
  onSupprimerCategorie,
}: CategoriesPageProps) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [categorieEnEdition, setCategorieEnEdition] = useState<Categorie | null>(null);
  const [messageErreur, setMessageErreur] = useState('');

  const compterProduits = (categorieId: string) =>
    produits.filter((p) => p.categorieId === categorieId).length;

  const demarrerEdition = (cat: Categorie) => {
    setCategorieEnEdition(cat);
    setNom(cat.nom);
    setDescription(cat.description);
    setMessageErreur('');
  };

  const annulerEdition = () => {
    setCategorieEnEdition(null);
    setNom('');
    setDescription('');
    setMessageErreur('');
  };

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      setMessageErreur('Le nom de la catégorie est obligatoire.');
      return;
    }

    if (categorieEnEdition) {
      onModifierCategorie({
        ...categorieEnEdition,
        nom: nom.trim(),
        description: description.trim(),
      });
    } else {
      onAjouterCategorie({
        id: genererId('cat'),
        nom: nom.trim(),
        description: description.trim(),
      });
    }

    annulerEdition();
  };

  const tenterSuppression = (cat: Categorie) => {
    const nb = compterProduits(cat.id);
    if (nb > 0) {
      setMessageErreur(
        `Impossible de supprimer "${cat.nom}" : ${nb} produit(s) utilisent encore cette catégorie.`
      );
      return;
    }
    setMessageErreur('');
    onSupprimerCategorie(cat.id);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Formulaire d'ajout / modification */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-1">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {categorieEnEdition ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          {categorieEnEdition && (
            <button
              type="button"
              onClick={annulerEdition}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <form onSubmit={soumettre} className="space-y-4">
          {messageErreur && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {messageErreur}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Téléphones"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description courte de la famille de produits..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              {categorieEnEdition ? 'Mettre à jour' : 'Ajouter'}
            </button>
            {categorieEnEdition && (
              <button
                type="button"
                onClick={annulerEdition}
                className="min-h-[44px] rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Liste des catégories */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
        <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5 sm:py-4">
          <h2 className="text-base font-bold text-slate-900">
            Liste des catégories ({categories.length})
          </h2>
        </div>

        {/* Vue cartes mobile (< md) */}
        <div className="divide-y divide-slate-100 md:hidden">
          {categories.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Aucune catégorie enregistrée.
            </p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{cat.nom}</div>
                  <div className="text-xs text-slate-500">{cat.description || '—'}</div>
                  <div className="mt-1 font-mono text-xs font-semibold text-blue-700 tabular-nums">
                    {compterProduits(cat.id)} produit(s)
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => demarrerEdition(cat)}
                    className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    aria-label={`Modifier ${cat.nom}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => tenterSuppression(cat)}
                    className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"
                    aria-label={`Supprimer ${cat.nom}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#0D357A] text-xs font-semibold text-white">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Produits</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                    Aucune catégorie enregistrée.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{cat.nom}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {cat.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 tabular-nums">
                      {compterProduits(cat.id)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => demarrerEdition(cat)}
                          className="rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-700"
                          title="Modifier"
                          aria-label={`Modifier ${cat.nom}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => tenterSuppression(cat)}
                          className="rounded-lg bg-red-600 p-1.5 text-white hover:bg-red-700"
                          title="Supprimer"
                          aria-label={`Supprimer ${cat.nom}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
