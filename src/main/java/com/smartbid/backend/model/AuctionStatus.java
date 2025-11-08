package com.smartbid.backend.model;

/**
 * Cycle de vie d'une enchère inversée.
 * DRAFT     : en brouillon, pas encore planifiée.
 * SCHEDULED : planifiée, commence à startAt.
 * RUNNING   : en cours entre startAt et endAt.
 * PAUSED    : pause manuelle éventuelle (optionnel pour plus tard).
 * FINISHED  : terminée normalement (endAt dépassé).
 * CANCELED  : annulée.
 */
public enum AuctionStatus {
    DRAFT,
    SCHEDULED,
    RUNNING,
    PAUSED,
    FINISHED,
    CANCELED
}
