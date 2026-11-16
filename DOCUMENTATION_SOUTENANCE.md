# Documentation Technique et Méthodologique — Projet FLASH-SHOP

**Niveau :** Licence 3 (L3) — Soutenance de projet de développement web  
**Application :** FLASH-SHOP (Gestion de stock, caisse et suivi commercial pour boutique électronique)  
**Technologies :** React 19, TypeScript, Tailwind CSS, Vite, Stockage local (`localStorage`)

---

## 1. Présentation générale du projet

### 1.1 Contexte et problématique
Les boutiques de matériels électroniques (téléphones, ordinateurs, accessoires, téléviseurs) gèrent souvent leurs stocks et leurs ventes sur papier ou dans des classeurs Excel séparés. Cela entraîne :
- Des erreurs de calcul lors de l'encaissement en caisse ;
- Des ruptures de stock imprévues faute d'alerte sur les seuils minimaux ;
- Une difficulté à connaître la marge commerciale réelle et le bénéfice net après déduction des dépenses.

### 1.2 Objectif de l'application
**FLASH-SHOP** est une application web monopage (SPA) légère et réactive permettant à un gérant de boutique de centraliser :
1. Le catalogue des **produits** et leurs **catégories** (sans alourdir la base par des images produits) ;
2. Les **ventes au comptoir (Caisse)** avec décrémentation automatique du stock et impression de reçu ;
3. Le suivi des **mouvements de stock** (entrées / sorties) et les **alertes de seuil** ;
4. Les **dépenses** courantes et les **rapports financiers** ;
5. La sauvegarde persistante dans une **base de données locale** intégrée au navigateur (`localStorage`).

---

## 2. Démarche Agile (Méthode Scrum)

Le développement a suivi une approche itérative et incrémentale découpée en **4 Sprints** de 1 à 2 semaines chacun.

### 2.1 Rôles Scrum (adaptés au projet L3)
- **Product Owner (Client / Encadrant) :** Définit les besoins de la boutique FLASH-SHOP et valide les fonctionnalités.
- **Scrum Master / Développeur (Étudiant L3) :** Planifie les sprints, lève les blocages techniques et réalise le développement.

### 2.2 Product Backlog et découpage en Sprints

| Sprint | Objectif du Sprint | User Stories (Histoires utilisateur) | État |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Mise en place du socle et gestion des produits | En tant que gérant, je veux créer, modifier, supprimer, filtrer et rechercher des produits par référence, nom ou code-barres afin de suivre mon catalogue. | Terminé |
| **Sprint 2** | Catégories et gestion des stocks | En tant que gérant, je veux organiser mes articles par catégorie, enregistrer les entrées/sorties de stock et voir les alertes de seuil critique. | Terminé |
| **Sprint 3** | Caisse (POS) et historique des factures | En tant que caissier, je veux ajouter des articles au panier, choisir le mode de paiement, valider la vente, décrémenter le stock et imprimer le reçu. | Terminé |
| **Sprint 4** | Dépenses, rapports financiers et paramètres | En tant que gérant, je veux saisir mes charges, consulter la marge brute / bénéfice net et exporter/réinitialiser ma base locale. | Terminé |

---

## 3. Architecture technique du code

L'application suit une architecture modulaire simple et lisible, séparant clairement les **types**, la **persistance locale**, les **utilitaires** et les **vues React**.

```text
src/
├── types.ts                     # Modèles TypeScript (Produit, Categorie, Vente, etc.)
├── utils/
│   └── format.ts                # Fonctions de formatage (FCFA, dates, statut de stock)
├── data/
│   └── initialData.ts           # Jeu de données initial de démonstration
├── services/
│   └── database.ts              # Couche d'accès à la base locale (localStorage)
├── components/
│   ├── Sidebar.tsx              # Barre latérale de navigation et fiche boutique
│   └── Header.tsx               # Barre supérieure avec titre et cloche d'alertes stock
├── pages/
│   ├── DashboardPage.tsx        # Tableau de bord récapitulatif
│   ├── ProduitsPage.tsx         # Catalogue produits (KPI, filtres, CRUD, pagination)
│   ├── CategoriesPage.tsx       # Gestion des catégories
│   ├── VentesCaissePage.tsx     # Point de vente (panier, encaissement, ticket)
│   ├── HistoriqueVentesPage.tsx # Liste des factures et impression
│   ├── StocksPage.tsx           # Entrées/sorties de stock et journal
│   ├── DepensesPage.tsx         # Saisie et suivi des dépenses
│   ├── RapportsPage.tsx         # Bilan financier et valorisation du stock
│   └── ParametresPage.tsx       # Infos boutique, export JSON, réinitialisation
└── App.tsx                      # Composant racine (état global et routage interne)
```

---

## 4. Modèle de données et base locale (`localStorage`)

### 4.1 Pourquoi `localStorage` ?
Pour une boutique fonctionnant sur un poste dédié sans serveur distant complexe, `localStorage` offre une persistance immédiate côté client :
- **Aucune installation de SGBD requise** ;
- **Fonctionnement hors-ligne** (après chargement de l'application) ;
- **Format JSON standard** facilement exportable pour archivage.

### 4.2 Clé de stockage et persistance après redémarrage (`src/services/database.ts`)
Toutes les collections sont stockées sous la clé `flash_shop_db_v1` dans `localStorage` et dupliquées automatiquement dans **IndexedDB** (`flash_shop_local_db`) :
1. **`chargerBase()` :** Lit `localStorage` au démarrage pour un affichage instantané.
2. **`sauvegarderBase(donnees)` :** Enregistre simultanément dans `localStorage` et dans `IndexedDB` à chaque mise à jour via `useEffect`.
3. **`demanderStockagePersistant()` & `verifierRestaurationLocale()` :** Demande au navigateur mobile (`navigator.storage.persist()`) de protéger les données contre le nettoyage automatique et restaure depuis `IndexedDB` si nécessaire après un redémarrage du téléphone.
4. **`reinitialiserBase()` & `importerBaseJson()` :** Permettent de restaurer les données initiales ou d'importer une sauvegarde `.json`.

### 4.3 Dictionnaire des entités (`src/types.ts`)
- **`Categorie`** : `id`, `nom`, `description`.
- **`Produit`** : `id`, `reference`, `codeBarre`, `nom`, `description`, `categorieId` (clé étrangère vers `Categorie`), `prixAchat`, `prixVente`, `stock`, `seuil`, `dateAjout`.
- **`Vente`** : `id`, `numeroFacture`, `date`, `clientNom`, `modePaiement`, `lignes` (`LigneVente[]`), `total`.
- **`MouvementStock`** : `id`, `produitId`, `nomProduit`, `type` (`'entree' | 'sortie'`), `quantite`, `motif`, `date`.
- **`Depense`** : `id`, `libelle`, `categorie`, `montant`, `date`.
- **`ParametresBoutique`** : `nomBoutique`, `sousTitre`, `telephone`, `adresse`, `nomGerant`, `roleGerant`, `devise`.

---

## 5. Explication détaillée du fonctionnement React

### 5.1 Gestion de l'état centralisée dans `App.tsx`
Plutôt que d'introduire Redux ou un store externe complexe, l'état global `donnees` est géré par un simple `useState` dans `App.tsx` :
- `useState(() => chargerBase())` charge les données une seule fois à l'initialisation.
- `useEffect(() => { sauvegarderBase(donnees); }, [donnees])` synchronise automatiquement toute modification avec le disque du navigateur.
- Les fonctions métier (`ajouterProduit`, `modifierProduit`, `supprimerProduit`, `validerVente`, `enregistrerMouvementStock`, etc.) sont passées en **props** aux pages concernées (principe du flux de données unidirectionnel de React).

### 5.2 Calcul automatique du statut de stock (`src/utils/format.ts`)
La fonction `getStatutStock(stock, seuil)` garantit la cohérence dans toute l'interface (tableau produits, alertes de la cloche, tableau de bord) :
- Si `stock <= 0` $\rightarrow$ **`rupture`**
- Si `stock <= seuil` $\rightarrow$ **`stock_faible`**
- Sinon $\rightarrow$ **`en_stock`**

### 5.3 Optimisation des calculs avec `useMemo`
Dans `ProduitsPage.tsx`, `DashboardPage.tsx` et `RapportsPage.tsx`, le hook `useMemo` évite de recalculer inutilement les filtres, les totaux financiers ou les statistiques tant que les données sources n'ont pas changé.

### 5.4 Cohérence transactionnelle lors d'une vente (`validerVente`)
Lorsqu'une vente est validée dans `VentesCaissePage.tsx` :
1. Le caissier ne peut jamais ajouter plus d'unités que le stock disponible (`produit.stock`).
2. `validerVente(vente)` dans `App.tsx` réalise deux opérations dans le même `setDonnees` :
   - Soustrait les quantités vendues du stock de chaque produit concerné ;
   - Ajoute la facture en tête de la liste `ventes`.

---

## 6. Préparation à la soutenance (Questions fréquentes du jury)

1. **Pourquoi avoir utilisé TypeScript avec React ?**  
   TypeScript vérifie les types à la compilation (`tsc --noEmit`), ce qui évite les erreurs de saisie sur les propriétés des objets (ex. confondre `prixAchat` et `prixVente`) et rend le code auto-documenté.

2. **Comment fonctionne la persistance sans serveur ?**  
   La couche `src/services/database.ts` utilise l'API native `localStorage` du navigateur. Un `useEffect` dans `App.tsx` sauvegarde l'état JSON après chaque action CRUD. De plus, l'écran *Paramètres* permet d'exporter un fichier `.json` de sauvegarde.

3. **Comment est assurée la mise à jour du stock après une vente ?**  
   La fonction `validerVente` parcourt les produits et décrémente `produit.stock` selon la quantité présente dans chaque ligne de la facture, en bloquant à `0` minimum via `Math.max(0, ...)`.

4. **Quelles évolutions futures sont possibles ?**  
   Grâce à l'isolation de la couche `src/services/database.ts`, on pourra facilement remplacer `localStorage` par une API REST (Node.js / Express + PostgreSQL ou MySQL) sans réécrire les composants d'interface.

---

## 7. Explication détaillée fichier par fichier (Guide de relecture du code)

Cette section vous permet d'expliquer chaque fichier si le jury vous demande d'ouvrir le code source pendant la soutenance.

### 7.1 Couche Modèle, Utilitaires et Données
- **`src/types.ts`** : Définit les 8 interfaces et types TypeScript (`PageId`, `StatutStock`, `Categorie`, `Produit`, `LigneVente`, `Vente`, `MouvementStock`, `Depense`, `ParametresBoutique`, `BaseDonnees`). Aucune logique d'exécution : uniquement la structure stricte des données.
- **`src/utils/format.ts`** : Contient des fonctions pures réutilisables :
  - `formatNombre(valeur)` / `formatPrix(valeur, devise)` : ajoute les espaces des milliers (`280 000 FCFA`).
  - `getStatutStock(stock, seuil)` : retourne `'rupture'`, `'stock_faible'` ou `'en_stock'`.
  - `formatDateHeure(isoDate)` / `formatDateCourte(isoDate)` : formate les dates ISO en format français (`jj/mm/aaaa`).
  - `genererId(prefixe)` : fabrique un identifiant unique à partir de l'horodatage (`Date.now()`) et d'un suffixe aléatoire.
- **`src/data/initialData.ts`** : Exporte l'objet `DONNEES_INITIALES` utilisé uniquement au tout premier démarrage (ou lors d'une réinitialisation) avec 4 catégories, 10 produits, 2 ventes, 2 mouvements de stock et 2 dépenses.
- **`src/services/database.ts`** : Gère les 3 opérations de persistance dans `localStorage` sous la clé `flash_shop_db_v1` (`chargerBase`, `sauvegarderBase`, `reinitialiserBase`).

### 7.2 Composants de mise en page (`src/components/`)
- **`src/components/Sidebar.tsx`** :
  - Affiche le logo et le nom de la boutique, la liste des 9 écrans (`ELEMENTS_MENU`), et la carte d'adresse/téléphone en bas.
  - Gère l'affichage responsive sur mobile via les props `ouvertMobile` et `onFermerMobile`.
  - Met en surbrillance l'onglet actif en orange (`bg-orange-500`) lorsque `pageActive === item.id`.
- **`src/components/Header.tsx`** :
  - Affiche le titre et l'icône de la page active via le dictionnaire `TITRES_PAGES`.
  - Contient l'état local `alertesOuvertes` pour afficher/masquer le menu déroulant des produits sous le seuil critique (`produitsEnAlerte`), ainsi qu'un bouton vers les paramètres du gérant.

### 7.3 Composant racine (`src/App.tsx`)
- Maintient trois états principaux : `donnees` (initialisé par `chargerBase()`), `pageActive` (initialisé sur `'produits'`), et `menuMobileOuvert`.
- Synchronise `donnees` avec `localStorage` via `useEffect`.
- Calcule `produitsEnAlerte` avec `useMemo`.
- Définit les fonctions métier (`ajouterProduit`, `modifierProduit`, `supprimerProduit`, `ajouterCategorie`, `modifierCategorie`, `supprimerCategorie`, `validerVente`, `enregistrerMouvementStock`, `ajouterDepense`, `supprimerDepense`, `sauvegarderParametres`, `handleReinitialiser`) et rend la page correspondant à `pageActive`.

### 7.4 Pages fonctionnelles (`src/pages/`)
- **`ProduitsPage.tsx`** : Gère la recherche textuelle (`recherche`), les filtres (`filtreCategorie`, `filtreStatut`), la pagination (`pageActuelle`, `parPage`), et 3 fenêtres modales (formulaire ajout/édition, fiche détail, confirmation de suppression).
- **`CategoriesPage.tsx`** : Formulaire à gauche et tableau à droite. Avant toute suppression, `tenterSuppression()` vérifie avec `compterProduits(cat.id)` qu'aucun produit n'utilise cette catégorie.
- **`VentesCaissePage.tsx`** : Gère l'état local `panier` (`LigneVente[]`), `clientNom`, `modePaiement` et `derniereVente`. Empêche de dépasser `produit.stock`, calcule `totalPanier` et déclenche `onValiderVente` puis permet l'impression du reçu via `window.print()`.
- **`HistoriqueVentesPage.tsx`** : Liste les factures triées de la plus récente à la plus ancienne et ouvre une modale de facture imprimable au clic sur *Détail*.
- **`StocksPage.tsx`** : Formulaire d'entrée (`+`) ou de sortie (`-`) de stock avec contrôle qu'une sortie ne dépasse pas le stock disponible, suivi du journal chronologique des mouvements.
- **`DepensesPage.tsx`** : Saisie des dépenses de fonctionnement avec calcul automatique du total.
- **`RapportsPage.tsx`** : Utilise `useMemo` pour calculer la marge brute (`chiffreAffaires - coutMarchandises`), le bénéfice net (`margeBrute - totalDepenses`) et la valorisation du stock par catégorie avec barres de progression CSS.
- **`ParametresPage.tsx`** : Permet d'éditer les paramètres de la boutique, de télécharger une sauvegarde complète en `.json` (`Blob` + `URL.createObjectURL`) et de réinitialiser la base locale après confirmation.

---

## 8. Relations entre les données (Schéma logique)

```text
[Categorie] 1 ─────── * [Produit] 1 ─────── * [MouvementStock]
                            │
                            │ *
                            ▼
[Vente]     1 ─────── * [LigneVente]

[Depense]   (table autonome des charges)
[ParametresBoutique] (enregistrement unique de configuration)
```

**Flux lors d'une vente à la caisse :**
1. Le caissier choisit des `Produit` $\rightarrow$ création de `LigneVente[]` dans le panier.
2. Validation $\rightarrow$ création d'une `Vente` (`FAC-2026-XXX`).
3. Décrémentation automatique de `Produit.stock` pour chaque article vendu.
4. Sauvegarde immédiate de `BaseDonnees` dans `localStorage`.

---

## 9. Plan conseillé pour votre présentation orale (10 à 15 min)

1. **Introduction (2 min) :** Présentation du contexte (boutique FLASH-SHOP à Bamako), des problèmes de gestion manuelle et des objectifs de l'application.
2. **Méthodologie Agile Scrum (2 min) :** Présentation du Product Backlog et du découpage en 4 Sprints avec livrables incrémentaux.
3. **Architecture & Choix techniques (3 min) :** Pourquoi React + TypeScript + Tailwind CSS + `localStorage` (simplicité, rapidité, typage strict, fonctionnement sans serveur externe).
4. **Démonstration en direct (5 min) :**
   - Montrer l'écran **Produits** (recherche, filtres, ajout d'un produit sans image).
   - Montrer la **Caisse** (ajouter un article au panier, valider la vente, montrer que le stock a diminué automatiquement dans **Produits** et que l'alerte de la cloche se met à jour).
   - Montrer **Historique des ventes**, **Stocks**, **Dépenses**, **Rapports** (bénéfice net calculé) et **Paramètres** (export JSON).
5. **Conclusion & Perspectives (1–2 min) :** Bilan de l'expérience L3 et évolutions possibles (passage vers une API backend + base PostgreSQL/MySQL, gestion multi-utilisateurs).

