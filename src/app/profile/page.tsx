"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { profileApi, type UserProfile } from "@/lib/profile-api";
import RecruiterProfile from "./recruiter-profile";
import CompanyProfile from "./company-profile";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await profileApi.getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchUser();
    } else if (session === null) {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-semibold">Please log in to view your profile</h2>
        <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
      </div>
    );
  }

  const isRecruiter = user.role === "RECRUITER" && user.recruiterProfile;
  const isCompany = user.role === "COMPANY" && user.company;

  return (
    <>
      {isRecruiter && <RecruiterProfile user={user} onProfileUpdated={fetchUser} />}
      {isCompany && <CompanyProfile user={user} onProfileUpdated={fetchUser} />}
    </>
  );
}
