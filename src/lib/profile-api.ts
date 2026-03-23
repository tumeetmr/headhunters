import { get, post, put, del } from "@/lib/api";

// Types
export interface Skill {
  id: string;
  value: string;
  type: string;
}

export interface ProfileTag {
  id: string;
  skill: Skill;
  meta?: string;
  sortOrder?: number;
}

export interface Link {
  id: string;
  type: string;
  label?: string;
  url: string;
}

export interface ActiveSearch {
  id: string;
  title: string;
  level?: string;
  industry?: string;
  location?: string;
  summary?: string;
  status: string;
}

export interface Insight {
  id: string;
  title: string;
  description?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  sortOrder?: number;
  status: string;
}

export interface RecruiterProfile {
  id: string;
  title: string | null;
  tagline?: string | null;
  bio: string | null;
  photoUrl: string | null;
  yearsExperience: number;
  location: string | null;
  rating: number;
  tags?: ProfileTag[];
  links?: Link[];
  activeSearches?: ActiveSearch[];
  insights?: Insight[];
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  size: string | null;
  location: string | null;
  formTemplate?: {
    id: string;
    name: string;
    fields?: Array<{
      id: string;
      key: string;
      label: string;
      type?: string;
      placeholder?: string;
      options?: string;
      isRequired?: boolean;
      sortOrder?: number;
    }>;
  } | null;
  tags?: ProfileTag[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "RECRUITER" | "COMPANY";
  createdAt: string;
  recruiterProfile: RecruiterProfile | null;
  company: Company | null;
}

export interface ShortlistItem {
  id: string;
  companyId: string;
  recruiterProfileId: string;
  note?: string | null;
  createdAt: string;
}

export interface CompanyShortlistItem {
  id: string;
  companyId: string;
  recruiterProfileId: string;
  note?: string | null;
  createdAt: string;
  recruiterProfile: {
    id: string;
    title?: string | null;
    yearsExperience?: number | null;
    rating?: number;
    slug: string;
    location?: string | null;
    photoUrl?: string | null;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  };
}

export interface MyRecruiterRating {
  canRate: boolean;
  hasRated: boolean;
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}

// Profile API calls
export const profileApi = {
  async getUserProfile() {
    return get<UserProfile>("/auth");
  },

  async updateRecruiterProfile(recruiterId: string, data: Partial<RecruiterProfile>) {
    return put<RecruiterProfile>(`/recruiters/${recruiterId}`, data);
  },

  async updateCompanyProfile(companyId: string, data: Partial<Company>) {
    return put<Company>(`/companies/${companyId}`, data);
  },

  // Skills
  async addSkill(recruiterId: string, skillData: Record<string, unknown>) {
    return post(`/recruiters/${recruiterId}/skills`, skillData);
  },

  async removeSkill(skillId: string) {
    return del(`/recruiters/skills/${skillId}`);
  },

  // Links
  async addLink(recruiterId: string, linkData: Partial<Link>) {
    return post<Link>(`/recruiters/${recruiterId}/links`, linkData);
  },

  async updateLink(linkId: string, linkData: Partial<Link>) {
    return put<Link>(`/recruiters/links/${linkId}`, linkData);
  },

  async removeLink(linkId: string) {
    return del(`/recruiters/links/${linkId}`);
  },

  // Active Searches
  async addActiveSearch(recruiterId: string, searchData: Partial<ActiveSearch>) {
    return post<ActiveSearch>(`/recruiters/${recruiterId}/active-searches`, searchData);
  },

  async updateActiveSearch(searchId: string, searchData: Partial<ActiveSearch>) {
    return put<ActiveSearch>(`/recruiters/active-searches/${searchId}`, searchData);
  },

  async removeActiveSearch(searchId: string) {
    return del(`/recruiters/active-searches/${searchId}`);
  },

  // Insights
  async addInsight(recruiterId: string, insightData: Partial<Insight>) {
    return post<Insight>(`/recruiters/${recruiterId}/insights`, insightData);
  },

  async updateInsight(insightId: string, insightData: Partial<Insight>) {
    return put<Insight>(`/recruiters/insights/${insightId}`, insightData);
  },

  async removeInsight(insightId: string) {
    return del(`/recruiters/insights/${insightId}`);
  },

  async addRecruiterToShortlist(recruiterProfileId: string, note?: string) {
    return post<ShortlistItem>(`/companies/shortlist`, {
      recruiterProfileId,
      note,
    });
  },

  async getCompanyShortlist() {
    return get<CompanyShortlistItem[]>(`/companies/shortlist`);
  },

  async removeCompanyShortlistItem(shortlistId: string) {
    return del<{ id: string }>(`/companies/shortlist/${shortlistId}`);
  },

  async rateRecruiter(recruiterProfileId: string, rating: number, review?: string) {
    return post(`/recruiters/${recruiterProfileId}/ratings`, {
      rating,
      review,
    });
  },

  async getMyRecruiterRating(recruiterProfileId: string) {
    return get<MyRecruiterRating>(`/recruiters/${recruiterProfileId}/ratings/me`);
  },
};
