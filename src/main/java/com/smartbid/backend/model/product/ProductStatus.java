package com.smartbid.backend.model.product;

/**
 * Statut de vie d'un produit dans le catalogue.
 * DRAFT   : en préparation, non visible pour créer des enchères.
 * ACTIVE  : prêt/visible pour être utilisé dans des enchères.
 * ARCHIVED: archivé (historique), ne doit plus être utilisé.
 */
public enum ProductStatus {
    DRAFT,
    ACTIVE,
    ARCHIVED
}