"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { put } from "@/lib/api";

type CompanyProfileData = {
  name?: string;
  slug?: string;
  industry?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  size?: string | null;
  location?: string | null;
};

type CompanyManagerProps = {
  profile: CompanyProfileData;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CompanyManager({ profile, onClose, onSuccess }: CompanyManagerProps) {
  const normalizeOptionalString = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  };

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    slug: profile?.slug || "",
    industry: profile?.industry || "",
    website: profile?.website || "",
    logoUrl: profile?.logoUrl || "",
    description: profile?.description || "",
    size: profile?.size || "",
    location: profile?.location || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await put("/companies", {
        name: normalizeOptionalString(formData.name),
        slug: normalizeOptionalString(formData.slug),
        industry: normalizeOptionalString(formData.industry),
        website: normalizeOptionalString(formData.website),
        logoUrl: normalizeOptionalString(formData.logoUrl),
        description: normalizeOptionalString(formData.description),
        size: normalizeOptionalString(formData.size),
        location: normalizeOptionalString(formData.location),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      if (typeof err === "object" && err !== null && "response" in err) {
         const axiosError = err as { response?: { data?: { message?: string | string[] } } };
         const message = axiosError?.response?.data?.message;
         setError(Array.isArray(message) ? message.join(", ") : (message || "Failed to update company"));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update company");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Company Name *</label>
          <Input 
            value={formData.name} 
            className="h-9"
            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))} 
            placeholder="e.g. Tech Innovations Inc" 
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Industry</label>
          <Input 
            value={formData.industry} 
            className="h-9"
            onChange={(e) => setFormData(prev => ({...prev, industry: e.target.value}))} 
            placeholder="e.g. Software Development" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Location</label>
          <Input 
            value={formData.location} 
            className="h-9"
            onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))} 
            placeholder="e.g. San Francisco, CA"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Company Size</label>
          <Input 
            value={formData.size} 
            className="h-9"
            onChange={(e) => setFormData(prev => ({...prev, size: e.target.value}))} 
            placeholder="e.g. 500-1000" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Description</label>
        <textarea 
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={formData.description} 
          onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} 
          placeholder="Tell us about the company..." 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Website</label>
          <Input 
            value={formData.website} 
            className="h-9"
            onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))} 
            placeholder="e.g. https://example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Logo URL</label>
          <Input 
            value={formData.logoUrl} 
            className="h-9"
            onChange={(e) => setFormData(prev => ({...prev, logoUrl: e.target.value}))} 
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
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