import { StatutStock } from '../types';

/**
 * Formate un montant numérique avec séparateur de milliers (ex: 280 000).
 */
export function formatNombre(valeur: number): string {
  return Math.round(valeur)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Formate un montant avec la devise configurée (par défaut FCFA).
 */
export function formatPrix(valeur: number, devise = 'FCFA'): string {
  return `${formatNombre(valeur)} ${devise}`;
}

/**
 * Détermine l'état du stock d'un produit à partir de son seuil minimal.
 */
export function getStatutStock(stock: number, seuil: number): StatutStock {
  if (stock <= 0) return 'rupture';
  if (stock <= seuil) return 'stock_faible';
  return 'en_stock';
}

/**
 * Formate une date ISO en date lisible (ex: 16/11/2026 14:30).
 */
export function formatDateHeure(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate une date ISO en jour/mois/année (ex: 16/11/2026).
 */
export function formatDateCourte(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Génère un identifiant court unique pour les nouveaux enregistrements.
 */
export function genererId(prefixe: string): string {
  return `${prefixe}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
