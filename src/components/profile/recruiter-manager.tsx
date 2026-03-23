"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { put } from "@/lib/api";

type RecruiterProfileData = {
  title?: string | null;
  tagline?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  heroImageUrl?: string | null;
  yearsExperience?: number;
  publicEmail?: string | null;
  publicPhone?: string | null;
  location?: string | null;
  timezone?: string | null;
  visibility?: string;
  isLeadPartner?: boolean;
  partnerBadge?: string | null;
  rating?: number;
};

type RecruiterManagerProps = {
  profile: RecruiterProfileData;
  onClose: () => void;
  onSuccess: () => void;
};

export default function RecruiterManager({ profile, onClose, onSuccess }: RecruiterManagerProps) {
  const normalizeOptionalString = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  };

  const [formData, setFormData] = useState({
    title: profile?.title || "",
    tagline: profile?.tagline || "",
    bio: profile?.bio || "",
    photoUrl: profile?.photoUrl || "",
    heroImageUrl: profile?.heroImageUrl || "",
    yearsExperience: profile?.yearsExperience != null ? String(profile.yearsExperience) : "",
    publicEmail: profile?.publicEmail || "",
    publicPhone: profile?.publicPhone || "",
    location: profile?.location || "",
    timezone: profile?.timezone || "",
    visibility: profile?.visibility || "PUBLISHED"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const yearsExperience = formData.yearsExperience.trim();

      await put("/recruiters", {
        title: normalizeOptionalString(formData.title),
        tagline: normalizeOptionalString(formData.tagline),
        bio: normalizeOptionalString(formData.bio),
        photoUrl: normalizeOptionalString(formData.photoUrl),
        heroImageUrl: normalizeOptionalString(formData.heroImageUrl),
        yearsExperience: yearsExperience.length ? Number(yearsExperience) : undefined,
        publicEmail: normalizeOptionalString(formData.publicEmail),
        publicPhone: normalizeOptionalString(formData.publicPhone),
        location: normalizeOptionalString(formData.location),
        timezone: normalizeOptionalString(formData.timezone),
        visibility: formData.visibility,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      if (typeof err === "object" && err !== null && "response" in err) {
         const axiosError = err as { response?: { data?: { message?: string | string[] } } };
         const message = axiosError?.response?.data?.message;
         setError(Array.isArray(message) ? message.join(", ") : (message || "Failed to update profile"));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-white">
        <h3 className="text-sm font-semibold text-slate-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Title</label>
            <Input
              value={formData.title}
              className="h-9"
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Senior Technical Recruiter"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tagline</label>
            <Input
              value={formData.tagline}
              className="h-9"
              onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="e.g. I connect top engineers with high-growth teams"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Years of Experience</label>
            <Input
              type="number"
              className="h-9"
              value={formData.yearsExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Location</label>
            <Input
              value={formData.location}
              className="h-9"
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. Ulaanbaatar, Mongolia"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-white">
        <h3 className="text-sm font-semibold text-slate-900">About</h3>
        <label className="text-sm font-semibold text-slate-700">Bio</label>
        <textarea
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm min-h-28 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell candidates and companies about your expertise and recruiting focus..."
        />
      </div>

      <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-white">
        <h3 className="text-sm font-semibold text-slate-900">Contact & Availability</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Public Email</label>
            <Input
              type="email"
              className="h-9"
              value={formData.publicEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, publicEmail: e.target.value }))}
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Public Phone</label>
            <Input
              value={formData.publicPhone}
              className="h-9"
              onChange={(e) => setFormData(prev => ({ ...prev, publicPhone: e.target.value }))}
              placeholder="e.g. +976 9911 2233"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Timezone</label>
            <Input
              value={formData.timezone}
              className="h-9"
              onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
              placeholder="e.g. Asia/Ulaanbaatar"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-white">
        <h3 className="text-sm font-semibold text-slate-900">Media</h3>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Profile Photo URL</label>
          <Input
            value={formData.photoUrl}
            className="h-9"
            onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Hero Image URL</label>
          <Input
            value={formData.heroImageUrl}
            className="h-9"
            onChange={(e) => setFormData(prev => ({ ...prev, heroImageUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="px-6">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="px-6 bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}