"use client";

import { profileApi } from "@/lib/api/modules/profile";
import { useApiOperation } from "@/hooks/api/useApiOperation";

export function useProfileApi() {
  const getUserProfile = useApiOperation(profileApi.getUserProfile);
  const updateRecruiterProfile = useApiOperation(profileApi.updateRecruiterProfile);
  const updateCompanyProfile = useApiOperation(profileApi.updateCompanyProfile);
  const addSkill = useApiOperation(profileApi.addSkill);
  const removeSkill = useApiOperation(profileApi.removeSkill);
  const addLink = useApiOperation(profileApi.addLink);
  const updateLink = useApiOperation(profileApi.updateLink);
  const removeLink = useApiOperation(profileApi.removeLink);
  const addActiveSearch = useApiOperation(profileApi.addActiveSearch);
  const updateActiveSearch = useApiOperation(profileApi.updateActiveSearch);
  const removeActiveSearch = useApiOperation(profileApi.removeActiveSearch);
  const addInsight = useApiOperation(profileApi.addInsight);
  const updateInsight = useApiOperation(profileApi.updateInsight);
  const removeInsight = useApiOperation(profileApi.removeInsight);
  const addRecruiterToShortlist = useApiOperation(profileApi.addRecruiterToShortlist);
  const getCompanyShortlist = useApiOperation(profileApi.getCompanyShortlist);
  const removeCompanyShortlistItem = useApiOperation(profileApi.removeCompanyShortlistItem);
  const rateRecruiter = useApiOperation(profileApi.rateRecruiter);
  const getMyRecruiterRating = useApiOperation(profileApi.getMyRecruiterRating);

  return {
    getUserProfile,
    updateRecruiterProfile,
    updateCompanyProfile,
    addSkill,
    removeSkill,
    addLink,
    updateLink,
    removeLink,
    addActiveSearch,
    updateActiveSearch,
    removeActiveSearch,
    addInsight,
    updateInsight,
    removeInsight,
    addRecruiterToShortlist,
    getCompanyShortlist,
    removeCompanyShortlistItem,
    rateRecruiter,
    getMyRecruiterRating,
  };
}
