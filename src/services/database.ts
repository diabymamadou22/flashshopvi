import { DONNEES_INITIALES } from '../data/initialData';
import { BaseDonnees } from '../types';

const CLE_STORAGE = 'flash_shop_db_v1';
const NOM_IDB = 'flash_shop_local_db';
const STORE_IDB = 'donnees';
const CLE_IDB = 'etat_courant';

/**
 * Fusionne proprement les données lues avec la structure initiale par défaut.
 */
function normaliserBase(parsed: Partial<BaseDonnees>): BaseDonnees {
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
}

/**
 * Ouvre la base IndexedDB du navigateur (sauvegarde persistante complémentaire sur mobile).
 */
function ouvrirIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(NOM_IDB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_IDB)) {
        db.createObjectStore(STORE_IDB);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function ecrireIndexedDB(donnees: BaseDonnees): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await ouvrirIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_IDB, 'readwrite');
      tx.objectStore(STORE_IDB).put(donnees, CLE_IDB);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Fallback silencieux sur localStorage si IndexedDB est indisponible
  }
}

async function lireIndexedDB(): Promise<BaseDonnees | null> {
  if (typeof indexedDB === 'undefined') return null;
  try {
    const db = await ouvrirIndexedDB();
    const resultat = await new Promise<Partial<BaseDonnees> | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_IDB, 'readonly');
      const req = tx.objectStore(STORE_IDB).get(CLE_IDB);
      req.onsuccess = () => resolve(req.result as Partial<BaseDonnees> | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return resultat ? normaliserBase(resultat) : null;
  } catch {
    return null;
  }
}

/**
 * Demande au système (Android/iOS/Desktop) de protéger les données contre l'effacement automatique.
 */
export async function demanderStockagePersistant(): Promise<void> {
  try {
    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      await navigator.storage.persist();
    }
  } catch {
    // Ignoré si non supporté par le navigateur
  }
}

/**
 * Charge les données de manière synchrone au démarrage depuis localStorage.
 */
export function chargerBase(): BaseDonnees {
  try {
    const brut = localStorage.getItem(CLE_STORAGE);
    if (!brut) {
      const copie = structuredClone(DONNEES_INITIALES);
      localStorage.setItem(CLE_STORAGE, JSON.stringify(copie));
      return copie;
    }
    const parsed = JSON.parse(brut) as Partial<BaseDonnees>;
    return normaliserBase(parsed);
  } catch {
    return structuredClone(DONNEES_INITIALES);
  }
}

/**
 * Vérifie au démarrage si une sauvegarde plus fiable existe dans IndexedDB
 * (utile si le navigateur mobile a vidé localStorage après un redémarrage).
 */
export async function verifierRestaurationLocale(): Promise<BaseDonnees | null> {
  const brut = localStorage.getItem(CLE_STORAGE);
  const dansIdb = await lireIndexedDB();
  if (dansIdb && !brut) {
    localStorage.setItem(CLE_STORAGE, JSON.stringify(dansIdb));
    return dansIdb;
  }
  return null;
}

/**
 * Sauvegarde les données simultanément dans localStorage et IndexedDB.
 */
export function sauvegarderBase(donnees: BaseDonnees): void {
  try {
    localStorage.setItem(CLE_STORAGE, JSON.stringify(donnees));
  } catch (erreur) {
    console.error('Erreur lors de la sauvegarde locale :', erreur);
  }
  void ecrireIndexedDB(donnees);
}

/**
 * Réinitialise complètement la base locale avec les données de départ.
 */
export function reinitialiserBase(): BaseDonnees {
  const copie = structuredClone(DONNEES_INITIALES);
  sauvegarderBase(copie);
  return copie;
}

/**
 * Valide et restaure un objet JSON importé depuis une sauvegarde.
 */
export function importerBaseJson(contenuJson: string): BaseDonnees {
  const parsed = JSON.parse(contenuJson) as Partial<BaseDonnees>;
  if (!Array.isArray(parsed.produits) || !Array.isArray(parsed.categories)) {
    throw new Error('Format de sauvegarde invalide.');
  }
  const propre = normaliserBase(parsed);
  sauvegarderBase(propre);
  return propre;
}
