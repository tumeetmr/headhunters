import { get, post, put } from "@/lib/api";

export type PlacementStatus =
  | "PENDING"
  | "OFFERED"
  | "ACCEPTED"
  | "STARTED"
  | "GUARANTEED"
  | "CANCELLED";

export interface Placement {
  id: string;
  engagementId: string;
  candidateName: string;
  candidateEmail?: string | null;
  candidateLinkedin?: string | null;
  offeredSalary?: number | string | null;
  guaranteeDays?: number | null;
  placedAt?: string | null;
  status: PlacementStatus;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    id: string;
    status: string;
  } | null;
  engagement?: {
    id: string;
    companyId: string;
    recruiterProfileId: string;
    jobOpeningId: string;
    status: string;
  };
}

export interface CreatePlacementPayload {
  engagementId: string;
  candidateName: string;
  candidateEmail?: string;
  candidateLinkedin?: string;
  offeredSalary?: number;
  guaranteeDays?: number;
}

export const placementsApi = {
  createPlacement(payload: CreatePlacementPayload) {
    return post<Placement>("/placements", payload);
  },

  fetchPlacementById(placementId: string) {
    return get<Placement>(`/placements/${placementId}`);
  },

  fetchPlacementsByEngagement(engagementId: string) {
    return get<Placement[]>(`/placements/engagement/${engagementId}`);
  },

  updatePlacementStatus(placementId: string, status: PlacementStatus) {
    return put<Placement>(`/placements/${placementId}/status/${status}`);
  },

  markPlacementGuaranteed(placementId: string) {
    return put<Placement>(`/placements/${placementId}/mark-guaranteed`);
  },

  selectPlacementCandidate(placementId: string) {
    return post<Placement>(`/placements/${placementId}/select`);
  },
};
