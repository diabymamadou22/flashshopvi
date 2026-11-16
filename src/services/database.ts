import { DONNEES_INITIALES } from '../data/initialData';
import { BaseDonnees } from '../types';

const CLE_STORAGE = 'flash_shop_db_v1';

/**
 * Charge l'ensemble des données depuis le stockage local du navigateur (localStorage).
 * Si aucune donnée n'existe encore, initialise la base avec les données de démonstration.
 */
export function chargerBase(): BaseDonnees {
  try {
    const brut = localStorage.getItem(CLE_STORAGE);
    if (!brut) {
      sauvegarderBase(DONNEES_INITIALES);
      return structuredClone(DONNEES_INITIALES);
    }
    const parsed = JSON.parse(brut) as Partial<BaseDonnees>;
    return {
      categories: parsed.categories ?? DONNEES_INITIALES.categories,
      produits: parsed.produits ?? DONNEES_INITIALES.produits,
      ventes: parsed.ventes ?? DONNEES_INITIALES.ventes,
      mouvementsStock: parsed.mouvementsStock ?? DONNEES_INITIALES.mouvementsStock,
      depenses: parsed.depenses ?? DONNEES_INITIALES.depenses,
      parametres: {
        ...DONNEES_INITIALES.parametres,
        ...(parsed.parametres ?? {}),
      },
    };
  } catch {
    return structuredClone(DONNEES_INITIALES);
  }
}

/**
 * Enregistre l'état courant de la base de données dans localStorage.
 */
export function sauvegarderBase(donnees: BaseDonnees): void {
  try {
    localStorage.setItem(CLE_STORAGE, JSON.stringify(donnees));
  } catch (erreur) {
    console.error('Erreur lors de la sauvegarde locale :', erreur);
  }
}

/**
 * Réinitialise complètement la base locale avec les données de départ.
 */
export function reinitialiserBase(): BaseDonnees {
  const copie = structuredClone(DONNEES_INITIALES);
  sauvegarderBase(copie);
  return copie;
}
