import { get } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string | null;
  username?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterSkill {
  id: string;
  type: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterTag {
  id: string;
  recruiterProfileId: string | null;
  companyId: string | null;
  skillId: string;
  skill: RecruiterSkill;
  meta: unknown | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterLink {
  id: string;
  recruiterProfileId: string;
  type: "LINKEDIN" | "PHONE" | string;
  label: string;
  url: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterInsight {
  id: string;
  recruiterProfileId: string;
  title: string;
  description: string | null;
  mediaUrl: string;
  thumbnailUrl: string | null;
  status: string;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Recruiter {
  id: string;
  userId: string;
  slug: string;
  title: string;
  tagline: string | null;
  bio: string;
  photoUrl: string | null;
  heroImageUrl: string | null;
  yearsExperience: number | null;
  isLeadPartner: boolean;
  partnerBadge: string | null;
  publicEmail: string | null;
  publicPhone: string | null;
  location: string | null;
  timezone: string | null;
  rating: number;
  visibility: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: RecruiterTag[];
  links: RecruiterLink[];
  activeSearches: unknown[];
  insights: RecruiterInsight[];
  user: User;
}

export const recruitersApi = {
  fetchRecruiters() {
    return get<Recruiter[]>("/recruiters", {
      params: { visibility: "PUBLISHED" },
    });
  },

  fetchRecruiterBySlug(slug: string) {
    return get<Recruiter>(`/recruiters/slug/${slug}`);
  },
};
