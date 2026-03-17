"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { post, del } from "@/lib/api";

interface Tag {
  id: string;
  type: string;
  value: string;
  meta?: string;
}

interface TagsManagerProps {
  tags: Tag[];
  recruiterId: string;
  isEditing: boolean;
  onTagsChange?: (tags: Tag[]) => void;
}

const TAG_TYPES = [
  "EXPERTISE",
  "INDUSTRY",
  "FOCUS_ROLE",
  "LANGUAGE",
  "CERTIFICATION",
  "TOOL",
];

export default function TagsManager({
  tags,
  recruiterId,
  isEditing,
  onTagsChange,
}: TagsManagerProps) {
  const [localTags, setLocalTags] = useState<Tag[]>(tags || []);
  const [showForm, setShowForm] = useState(false);
  const [newTag, setNewTag] = useState({ type: "EXPERTISE", value: "", meta: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = async () => {
    if (!newTag.value.trim() || !recruiterId) {
      setError("Please enter a tag value");
      return;
    }

    setLoading(true);
    try {
      const createdTag = await post<Tag>(`/recruiters/${recruiterId}/tags`, {
        type: newTag.type,
        value: newTag.value,
        meta: newTag.meta || undefined,
      });

      const updated = [...localTags, createdTag];
      setLocalTags(updated);
      onTagsChange?.(updated);
      setNewTag({ type: "EXPERTISE", value: "", meta: "" });
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error("Failed to add tag", err);
      setError("Failed to add tag");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true);
    try {
      await del(`/recruiters/tags/${tagId}`);
      const updated = localTags.filter((t) => t.id !== tagId);
      setLocalTags(updated);
      onTagsChange?.(updated);
    } catch (err) {
      console.error("Failed to remove tag", err);
      setError("Failed to remove tag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Display tags organized by type */}
      <div className="space-y-3">
        {TAG_TYPES.map((type) => {
          const tagsOfType = localTags.filter((t) => t.type === type);
          if (tagsOfType.length === 0 && (!isEditing || type !== "EXPERTISE")) {
            return null;
          }

          return (
            <div key={type} className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {type.replace("_", " ")}
              </label>
              <div className="flex flex-wrap gap-2">
                {tagsOfType.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200 text-sm"
                  >
                    <span>{tag.value}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        disabled={loading}
                        className="p-0.5 hover:bg-purple-100 rounded disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add tag form */}
      {isEditing && (
        <>
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              size="sm"
              className="gap-1 mt-4"
            >
              <Plus className="w-4 h-4" />
              Add Tag
            </Button>
          ) : (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Tag Type
                </label>
                <select
                  value={newTag.type}
                  onChange={(e) =>
                    setNewTag({ ...newTag, type: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                >
                  {TAG_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Value
                </label>
                <Input
                  value={newTag.value}
                  onChange={(e) =>
                    setNewTag({ ...newTag, value: e.target.value })
                  }
                  placeholder="e.g., React, Full-Stack, USA"
                  className="h-9"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddTag}
                  disabled={!newTag.value.trim() || loading}
                  size="sm"
                  className="flex-1"
                >
                  {loading ? "Adding..." : "Add"}
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

      {localTags.length === 0 && (
        <p className="text-sm text-slate-500">
          {isEditing ? "No tags yet. Add one to get started!" : "No tags added"}
        </p>
      )}
    </div>
  );
}
