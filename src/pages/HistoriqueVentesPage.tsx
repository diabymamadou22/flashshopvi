import { useState } from 'react';
import { Eye, Printer, X } from 'lucide-react';
import { ParametresBoutique, Vente } from '../types';
import { formatDateHeure, formatPrix } from '../utils/format';

interface HistoriqueVentesPageProps {
  ventes: Vente[];
  parametres: ParametresBoutique;
}

export default function HistoriqueVentesPage({
  ventes,
  parametres,
}: HistoriqueVentesPageProps) {
  const [venteSelectionnee, setVenteSelectionnee] = useState<Vente | null>(null);

  return (
    <div className="space-y-5">
      <div className="no-print overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3.5 sm:px-5 sm:py-4">
          <h2 className="text-base font-bold text-slate-900">
            Historique des factures ({ventes.length})
          </h2>
        </div>

        {/* Vue cartes mobile (< md) */}
        <div className="divide-y divide-slate-100 md:hidden">
          {ventes.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              Aucune vente enregistrée pour le moment.
            </p>
          ) : (
            ventes.map((v) => (
              <div key={v.id} className="space-y-2.5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs font-bold text-blue-700">
                      {v.numeroFacture}
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{v.clientNom}</div>
                    <div className="text-xs text-slate-500">
                      {formatDateHeure(v.date)} · {v.modePaiement}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {formatPrix(v.total, parametres.devise)}
                    </div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      {v.lignes.reduce((s, l) => s + l.quantite, 0)} article(s)
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVenteSelectionnee(v)}
                  className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Voir / Imprimer la facture
                </button>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#0D357A] text-xs font-semibold text-white">
                <th className="px-4 py-3">N° Facture</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3 text-right">Articles</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Facture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    Aucune vente enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                ventes.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">
                      {v.numeroFacture}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {formatDateHeure(v.date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{v.clientNom}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{v.modePaiement}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {v.lignes.reduce((s, l) => s + l.quantite, 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatPrix(v.total, parametres.devise)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setVenteSelectionnee(v)}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Détail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale de consultation / impression de facture */}
      {venteSelectionnee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="no-print mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Facture {venteSelectionnee.numeroFacture}
              </h3>
              <button
                type="button"
                onClick={() => setVenteSelectionnee(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="text-base font-bold text-slate-900">
                    {parametres.nomBoutique}
                  </div>
                  <div className="text-xs text-slate-500">{parametres.sousTitre}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    {parametres.adresse} · {parametres.telephone}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <div className="font-mono font-bold text-slate-900">
                    {venteSelectionnee.numeroFacture}
                  </div>
                  <div>{formatDateHeure(venteSelectionnee.date)}</div>
                  <div>Paiement : {venteSelectionnee.modePaiement}</div>
                </div>
              </div>

              <div className="text-xs text-slate-700">
                Client : <span className="font-semibold">{venteSelectionnee.clientNom}</span>
              </div>

              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 text-left">Produit</th>
                    <th className="py-2 text-right">Qté</th>
                    <th className="py-2 text-right">P.U.</th>
                    <th className="py-2 text-right">Sous-total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {venteSelectionnee.lignes.map((l) => (
                    <tr key={l.produitId}>
                      <td className="py-2 font-medium text-slate-900">{l.nomProduit}</td>
                      <td className="py-2 text-right font-mono tabular-nums">{l.quantite}</td>
                      <td className="py-2 text-right font-mono tabular-nums">
                        {formatPrix(l.prixUnitaire, parametres.devise)}
                      </td>
                      <td className="py-2 text-right font-mono font-semibold tabular-nums">
                        {formatPrix(l.sousTotal, parametres.devise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                <span>Total payé</span>
                <span className="font-mono tabular-nums">
                  {formatPrix(venteSelectionnee.total, parametres.devise)}
                </span>
              </div>
            </div>

            <div className="no-print mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </button>
              <button
                type="button"
                onClick={() => setVenteSelectionnee(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
