"use client";

import { placementsApi } from "@/lib/api/modules/placements";
import { useApiOperation } from "@/hooks/api/useApiOperation";

export function usePlacementsApi() {
  const createPlacement = useApiOperation(placementsApi.createPlacement);
  const fetchPlacementById = useApiOperation(placementsApi.fetchPlacementById);
  const fetchPlacementsByEngagement = useApiOperation(placementsApi.fetchPlacementsByEngagement);
  const updatePlacementStatus = useApiOperation(placementsApi.updatePlacementStatus);
  const markPlacementGuaranteed = useApiOperation(placementsApi.markPlacementGuaranteed);
  const selectPlacementCandidate = useApiOperation(placementsApi.selectPlacementCandidate);

  return {
    createPlacement,
    fetchPlacementById,
    fetchPlacementsByEngagement,
    updatePlacementStatus,
    markPlacementGuaranteed,
    selectPlacementCandidate,
  };
}
