import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { LigneVente, ModePaiement, ParametresBoutique, Produit, Vente } from '../types';
import { formatDateHeure, formatPrix, genererId } from '../utils/format';

interface VentesCaissePageProps {
  produits: Produit[];
  parametres: ParametresBoutique;
  nombreVentesExistantes: number;
  onValiderVente: (vente: Vente) => void;
}

export default function VentesCaissePage({
  produits,
  parametres,
  nombreVentesExistantes,
  onValiderVente,
}: VentesCaissePageProps) {
  const [recherche, setRecherche] = useState('');
  const [panier, setPanier] = useState<LigneVente[]>([]);
  const [clientNom, setClientNom] = useState('Client comptoir');
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Especes');
  const [derniereVente, setDerniereVente] = useState<Vente | null>(null);
  const [erreur, setErreur] = useState('');

  const produitsDisponibles = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return produits.filter(
      (p) =>
        !terme ||
        p.nom.toLowerCase().includes(terme) ||
        p.reference.toLowerCase().includes(terme) ||
        p.codeBarre.toLowerCase().includes(terme)
    );
  }, [produits, recherche]);

  const totalPanier = useMemo(
    () => panier.reduce((acc, ligne) => acc + ligne.sousTotal, 0),
    [panier]
  );

  const ajouterAuPanier = (produit: Produit) => {
    setErreur('');
    if (produit.stock <= 0) {
      setErreur(`Le produit "${produit.nom}" est en rupture de stock.`);
      return;
    }

    setPanier((precedent) => {
      const existant = precedent.find((l) => l.produitId === produit.id);
      if (existant) {
        if (existant.quantite >= produit.stock) {
          setErreur(`Stock maximum atteint pour "${produit.nom}" (${produit.stock} disponibles).`);
          return precedent;
        }
        return precedent.map((l) =>
          l.produitId === produit.id
            ? {
                ...l,
                quantite: l.quantite + 1,
                sousTotal: (l.quantite + 1) * l.prixUnitaire,
              }
            : l
        );
      }

      return [
        ...precedent,
        {
          produitId: produit.id,
          reference: produit.reference,
          nomProduit: produit.nom,
          quantite: 1,
          prixAchatUnitaire: produit.prixAchat,
          prixUnitaire: produit.prixVente,
          sousTotal: produit.prixVente,
        },
      ];
    });
  };

  const modifierQuantite = (produitId: string, delta: number) => {
    setErreur('');
    const produit = produits.find((p) => p.id === produitId);
    const stockMax = produit?.stock ?? 0;

    setPanier((precedent) =>
      precedent
        .map((ligne) => {
          if (ligne.produitId !== produitId) return ligne;
          const nouvelleQte = ligne.quantite + delta;
          if (nouvelleQte <= 0) return null;
          if (nouvelleQte > stockMax) {
            setErreur(`Quantité demandée supérieure au stock disponible (${stockMax}).`);
            return ligne;
          }
          return {
            ...ligne,
            quantite: nouvelleQte,
            sousTotal: nouvelleQte * ligne.prixUnitaire,
          };
        })
        .filter((l): l is LigneVente => l !== null)
    );
  };

  const retirerDuPanier = (produitId: string) => {
    setPanier((precedent) => precedent.filter((l) => l.produitId !== produitId));
  };

  const encaisserVente = () => {
    if (panier.length === 0) {
      setErreur('Ajoutez au moins un produit au panier avant de valider.');
      return;
    }

    const numero = String(nombreVentesExistantes + 1).padStart(3, '0');
    const nouvelleVente: Vente = {
      id: genererId('v'),
      numeroFacture: `FAC-2026-${numero}`,
      date: new Date().toISOString(),
      clientNom: clientNom.trim() || 'Client comptoir',
      modePaiement,
      lignes: panier,
      total: totalPanier,
    };

    onValiderVente(nouvelleVente);
    setDerniereVente(nouvelleVente);
    setPanier([]);
    setClientNom('Client comptoir');
    setErreur('');
  };

  const nbArticlesPanier = panier.reduce((s, l) => s + l.quantite, 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Bandeau d'accès rapide au panier sur mobile */}
      {nbArticlesPanier > 0 && (
        <div className="no-print lg:hidden">
          <a
            href="#panier-caisse"
            className="flex min-h-[44px] items-center justify-between rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            <span>Panier ({nbArticlesPanier} article(s))</span>
            <span className="font-mono tabular-nums">
              {formatPrix(totalPanier, parametres.devise)} →
            </span>
          </a>
        </div>
      )}

      {/* Colonne gauche : sélection des produits */}
      <section className="no-print space-y-4 lg:col-span-7">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Chercher un article (nom, référence, code-barres)..."
              className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {produitsDisponibles.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono font-semibold">{p.reference}</span>
                  <span
                    className={`font-mono font-semibold tabular-nums ${
                      p.stock === 0 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    Stock: {p.stock}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-bold text-slate-900">{p.nom}</h3>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="font-mono text-sm font-bold text-blue-700 tabular-nums">
                  {formatPrix(p.prixVente, parametres.devise)}
                </span>
                <button
                  type="button"
                  disabled={p.stock <= 0}
                  onClick={() => ajouterAuPanier(p)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Colonne droite : Panier et encaissement */}
      <section id="panier-caisse" className="space-y-4 lg:col-span-5">
        <div className="no-print rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#0A3072]" />
              <h2 className="text-base font-bold text-slate-900">Panier en cours</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              {nbArticlesPanier} article(s)
            </span>
          </div>

          {erreur && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {erreur}
            </div>
          )}

          {panier.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Sélectionnez des produits pour démarrer une vente.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {panier.map((ligne) => (
                <div key={ligne.produitId} className="flex items-center justify-between gap-2 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {ligne.nomProduit}
                    </div>
                    <div className="font-mono text-xs text-slate-500 tabular-nums">
                      {formatPrix(ligne.prixUnitaire, parametres.devise)} × {ligne.quantite}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => modifierQuantite(ligne.produitId, -1)}
                      className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center font-mono text-xs font-bold tabular-nums">
                      {ligne.quantite}
                    </span>
                    <button
                      type="button"
                      onClick={() => modifierQuantite(ligne.produitId, 1)}
                      className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => retirerDuPanier(ligne.produitId)}
                      className="ml-1 flex min-h-[38px] min-w-[38px] items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                      aria-label="Retirer du panier"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Nom du client</label>
              <input
                type="text"
                value={clientNom}
                onChange={(e) => setClientNom(e.target.value)}
                className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mode de paiement
              </label>
              <select
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
                className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              >
                <option value="Especes">Espèces</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Moov Money">Moov Money</option>
                <option value="Carte">Carte bancaire</option>
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">Total à payer</span>
              <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                {formatPrix(totalPanier, parametres.devise)}
              </span>
            </div>

            <button
              type="button"
              onClick={encaisserVente}
              disabled={panier.length === 0}
              className="min-h-[48px] w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              Valider et encaisser la vente
            </button>
          </div>
        </div>

        {/* Ticket de caisse généré après validation */}
        {derniereVente && (
          <div className="rounded-xl border border-emerald-200 bg-white p-5">
            <div className="no-print mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Vente enregistrée
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimer reçu
              </button>
            </div>

            <div className="space-y-2 border-t border-dashed border-slate-200 pt-3 text-xs text-slate-700">
              <div className="text-center">
                <div className="text-sm font-bold text-slate-900">{parametres.nomBoutique}</div>
                <div>
                  {parametres.adresse} · {parametres.telephone}
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <span>Facture : {derniereVente.numeroFacture}</span>
                <span>{formatDateHeure(derniereVente.date)}</span>
              </div>
              <div>
                Client : <span className="font-semibold">{derniereVente.clientNom}</span> (
                {derniereVente.modePaiement})
              </div>
              <div className="border-t border-slate-100 pt-2">
                {derniereVente.lignes.map((l) => (
                  <div key={l.produitId} className="flex justify-between py-0.5 tabular-nums">
                    <span>
                      {l.quantite} × {l.nomProduit}
                    </span>
                    <span className="font-mono font-semibold">
                      {formatPrix(l.sousTotal, parametres.devise)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900 tabular-nums">
                <span>TOTAL</span>
                <span className="font-mono">
                  {formatPrix(derniereVente.total, parametres.devise)}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
