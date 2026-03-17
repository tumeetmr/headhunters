"use client";

import { useState } from "react";
import { X, Plus, Linkedin, Mail, Globe, Phone, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileApi, type Link } from "@/lib/profile-api";

interface LinksManagerProps {
  links: Link[];
  recruiterId: string;
  isEditing: boolean;
  onLinksChange?: (links: Link[]) => void;
}

const LINK_TYPES = [
  "WEBSITE",
  "LINKEDIN",
  "EMAIL",
  "PHONE",
  "WHATSAPP",
  "TELEGRAM",
  "CALENDAR",
  "OTHER",
];

const LINK_ICONS: Record<string, React.ReactNode> = {
  WEBSITE: <Globe className="w-4 h-4" />,
  LINKEDIN: <Linkedin className="w-4 h-4" />,
  EMAIL: <Mail className="w-4 h-4" />,
  PHONE: <Phone className="w-4 h-4" />,
  WHATSAPP: <MessageCircle className="w-4 h-4" />,
  TELEGRAM: <MessageCircle className="w-4 h-4" />,
  CALENDAR: <Calendar className="w-4 h-4" />,
};

export default function LinksManager({
  links,
  recruiterId,
  isEditing,
  onLinksChange,
}: LinksManagerProps) {
  const [localLinks, setLocalLinks] = useState<Link[]>(links || []);
  const [showForm, setShowForm] = useState(false);
  const [newLink, setNewLink] = useState({ type: "WEBSITE", label: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddLink = async () => {
    if (!newLink.url.trim() || !recruiterId) {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const createdLink = await profileApi.addLink(recruiterId, {
        type: newLink.type,
        label: newLink.label || undefined,
        url: newLink.url,
      });

      const updated = [...localLinks, createdLink];
      setLocalLinks(updated);
      onLinksChange?.(updated);
      setNewLink({ type: "WEBSITE", label: "", url: "" });
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error("Failed to add link", err);
      setError("Failed to add link");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    setLoading(true);
    try {
      await profileApi.removeLink(linkId);
      const updated = localLinks.filter((l) => l.id !== linkId);
      setLocalLinks(updated);
      onLinksChange?.(updated);
    } catch (err) {
      console.error("Failed to remove link", err);
      setError("Failed to remove link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Display links - scrollable */}
      <div className="space-y-2 max-h-87.5 overflow-y-auto pr-2">
        {localLinks.length > 0 ? (
          localLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="shrink-0 text-slate-500 group-hover:text-slate-700">
                  {LINK_ICONS[link.type] || <Globe className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {link.label || link.type}
                  </p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline truncate block"
                  >
                    {link.url}
                  </a>
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={() => handleRemoveLink(link.id)}
                  disabled={loading}
                  className="ml-3 p-1.5 hover:bg-red-50 text-red-600 rounded opacity-0 group-hover:opacity-100 transition disabled:opacity-50 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 py-8 text-center">
            {isEditing ? "No links yet. Add one to connect!" : "No links added"}
          </p>
        )}
      </div>

      {/* Add link form */}
      {isEditing && (
        <>
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              size="sm"
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Link
            </Button>
          ) : (
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Link Type
                </label>
                <select
                  value={newLink.type}
                  onChange={(e) =>
                    setNewLink({ ...newLink, type: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {LINK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Label (Optional)
                </label>
                <Input
                  value={newLink.label}
                  onChange={(e) =>
                    setNewLink({ ...newLink, label: e.target.value })
                  }
                  placeholder="e.g., My Website"
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  URL *
                </label>
                <Input
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink({ ...newLink, url: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="h-9"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-200">
                <Button
                  onClick={handleAddLink}
                  disabled={!newLink.url.trim() || loading}
                  size="sm"
                  className="flex-1"
                >
                  {loading ? "Adding..." : "Add Link"}
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
