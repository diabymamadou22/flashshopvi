import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import Sidebar from './components/Sidebar';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import DepensesPage from './pages/DepensesPage';
import HistoriqueVentesPage from './pages/HistoriqueVentesPage';
import ParametresPage from './pages/ParametresPage';
import ProduitsPage from './pages/ProduitsPage';
import RapportsPage from './pages/RapportsPage';
import StocksPage from './pages/StocksPage';
import VentesCaissePage from './pages/VentesCaissePage';
import {
  chargerBase,
  demanderStockagePersistant,
  importerBaseJson,
  reinitialiserBase,
  sauvegarderBase,
  verifierRestaurationLocale,
} from './services/database';
import {
  BaseDonnees,
  Categorie,
  Depense,
  MouvementStock,
  PageId,
  ParametresBoutique,
  Produit,
  Vente,
} from './types';
import { getStatutStock } from './utils/format';

export default function App() {
  // Chargement initial de la base locale (localStorage)
  const [donnees, setDonnees] = useState<BaseDonnees>(() => chargerBase());
  const [pageActive, setPageActive] = useState<PageId>('produits');
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);

  // Demande de stockage persistant + restauration depuis IndexedDB si nécessaire
  useEffect(() => {
    void demanderStockagePersistant();
    void verifierRestaurationLocale().then((restauree) => {
      if (restauree) {
        setDonnees(restauree);
      }
    });
  }, []);

  // Sauvegarde automatique dans localStorage et IndexedDB à chaque modification
  useEffect(() => {
    sauvegarderBase(donnees);
  }, [donnees]);

  // Liste des produits ayant atteint ou dépassé leur seuil minimal
  const produitsEnAlerte = useMemo(
    () => donnees.produits.filter((p) => getStatutStock(p.stock, p.seuil) !== 'en_stock'),
    [donnees.produits]
  );

  // --- Opérations CRUD Produits ---
  const ajouterProduit = (produit: Produit) => {
    setDonnees((prev) => ({
      ...prev,
      produits: [produit, ...prev.produits],
    }));
  };

  const modifierProduit = (produitModifie: Produit) => {
    setDonnees((prev) => ({
      ...prev,
      produits: prev.produits.map((p) => (p.id === produitModifie.id ? produitModifie : p)),
    }));
  };

  const supprimerProduit = (id: string) => {
    setDonnees((prev) => ({
      ...prev,
      produits: prev.produits.filter((p) => p.id !== id),
    }));
  };

  // --- Opérations CRUD Catégories ---
  const ajouterCategorie = (categorie: Categorie) => {
    setDonnees((prev) => ({
      ...prev,
      categories: [...prev.categories, categorie],
    }));
  };

  const modifierCategorie = (categorieModifiee: Categorie) => {
    setDonnees((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categorieModifiee.id ? categorieModifiee : c
      ),
    }));
  };

  const supprimerCategorie = (id: string) => {
    setDonnees((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }));
  };

  // --- Validation d'une vente (enregistre la facture + décrémente le stock) ---
  const validerVente = (vente: Vente) => {
    setDonnees((prev) => {
      const produitsMisAJour = prev.produits.map((produit) => {
        const ligne = vente.lignes.find((l) => l.produitId === produit.id);
        if (!ligne) return produit;
        return {
          ...produit,
          stock: Math.max(0, produit.stock - ligne.quantite),
        };
      });

      return {
        ...prev,
        produits: produitsMisAJour,
        ventes: [vente, ...prev.ventes],
      };
    });
  };

  // --- Mouvement de stock manuel (entrée ou sortie) ---
  const enregistrerMouvementStock = (mouvement: MouvementStock) => {
    setDonnees((prev) => {
      const produitsMisAJour = prev.produits.map((p) => {
        if (p.id !== mouvement.produitId) return p;
        const nouveauStock =
          mouvement.type === 'entree'
            ? p.stock + mouvement.quantite
            : Math.max(0, p.stock - mouvement.quantite);
        return { ...p, stock: nouveauStock };
      });

      return {
        ...prev,
        produits: produitsMisAJour,
        mouvementsStock: [mouvement, ...prev.mouvementsStock],
      };
    });
  };

  // --- Dépenses ---
  const ajouterDepense = (depense: Depense) => {
    setDonnees((prev) => ({
      ...prev,
      depenses: [depense, ...prev.depenses],
    }));
  };

  const supprimerDepense = (id: string) => {
    setDonnees((prev) => ({
      ...prev,
      depenses: prev.depenses.filter((d) => d.id !== id),
    }));
  };

  // --- Paramètres ---
  const sauvegarderParametres = (parametres: ParametresBoutique) => {
    setDonnees((prev) => ({
      ...prev,
      parametres,
    }));
  };

  const handleImporter = (contenuJson: string) => {
    const nouvelleBase = importerBaseJson(contenuJson);
    setDonnees(nouvelleBase);
  };

  const handleReinitialiser = () => {
    const basePropre = reinitialiserBase();
    setDonnees(basePropre);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        pageActive={pageActive}
        onChangerPage={setPageActive}
        parametres={donnees.parametres}
        ouvertMobile={menuMobileOuvert}
        onFermerMobile={() => setMenuMobileOuvert(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pageActive={pageActive}
          parametres={donnees.parametres}
          produitsEnAlerte={produitsEnAlerte}
          onOuvrirMenu={() => setMenuMobileOuvert(true)}
          onAllerPage={setPageActive}
        />

        <main className="flex-1 p-3 pb-24 sm:p-6 lg:pb-6">
          {pageActive === 'dashboard' && (
            <DashboardPage donnees={donnees} onAllerPage={setPageActive} />
          )}

          {pageActive === 'produits' && (
            <ProduitsPage
              produits={donnees.produits}
              categories={donnees.categories}
              devise={donnees.parametres.devise}
              onAjouterProduit={ajouterProduit}
              onModifierProduit={modifierProduit}
              onSupprimerProduit={supprimerProduit}
            />
          )}

          {pageActive === 'categories' && (
            <CategoriesPage
              categories={donnees.categories}
              produits={donnees.produits}
              onAjouterCategorie={ajouterCategorie}
              onModifierCategorie={modifierCategorie}
              onSupprimerCategorie={supprimerCategorie}
            />
          )}

          {pageActive === 'caisse' && (
            <VentesCaissePage
              produits={donnees.produits}
              parametres={donnees.parametres}
              nombreVentesExistantes={donnees.ventes.length}
              onValiderVente={validerVente}
            />
          )}

          {pageActive === 'historique' && (
            <HistoriqueVentesPage ventes={donnees.ventes} parametres={donnees.parametres} />
          )}

          {pageActive === 'stocks' && (
            <StocksPage
              produits={donnees.produits}
              mouvements={donnees.mouvementsStock}
              onEnregistrerMouvement={enregistrerMouvementStock}
            />
          )}

          {pageActive === 'depenses' && (
            <DepensesPage
              depenses={donnees.depenses}
              devise={donnees.parametres.devise}
              onAjouterDepense={ajouterDepense}
              onSupprimerDepense={supprimerDepense}
            />
          )}

          {pageActive === 'rapports' && <RapportsPage donnees={donnees} />}

          {pageActive === 'parametres' && (
            <ParametresPage
              donnees={donnees}
              onSauvegarderParametres={sauvegarderParametres}
              onImporterBase={handleImporter}
              onReinitialiserBase={handleReinitialiser}
            />
          )}
        </main>
      </div>

      <MobileBottomNav
        pageActive={pageActive}
        onChangerPage={setPageActive}
        onOuvrirMenu={() => setMenuMobileOuvert(true)}
      />
    </div>
  );
}
