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

export async function createPlacement(payload: CreatePlacementPayload): Promise<Placement> {
  return post<Placement>("/placements", payload);
}

export async function fetchPlacementById(placementId: string): Promise<Placement> {
  return get<Placement>(`/placements/${placementId}`);
}

export async function fetchPlacementsByEngagement(engagementId: string): Promise<Placement[]> {
  return get<Placement[]>(`/placements/engagement/${engagementId}`);
}

export async function updatePlacementStatus(
  placementId: string,
  status: PlacementStatus
): Promise<Placement> {
  return put<Placement>(`/placements/${placementId}/status/${status}`);
}

export async function markPlacementGuaranteed(placementId: string): Promise<Placement> {
  return put<Placement>(`/placements/${placementId}/mark-guaranteed`);
}

export async function selectPlacementCandidate(placementId: string): Promise<Placement> {
  return post<Placement>(`/placements/${placementId}/select`);
}
