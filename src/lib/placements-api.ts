import { placementsApi } from "@/lib/api/modules/placements";

export * from "@/lib/api/modules/placements";

export const createPlacement = placementsApi.createPlacement;
export const fetchPlacementById = placementsApi.fetchPlacementById;
export const fetchPlacementsByEngagement = placementsApi.fetchPlacementsByEngagement;
export const updatePlacementStatus = placementsApi.updatePlacementStatus;
export const markPlacementGuaranteed = placementsApi.markPlacementGuaranteed;
export const selectPlacementCandidate = placementsApi.selectPlacementCandidate;
