"use client";

import { useState } from "react";
import { X, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileApi, type ActiveSearch } from "@/lib/profile-api";

interface ActiveSearchesProps {
  searches: ActiveSearch[];
  recruiterId: string;
  isEditing: boolean;
  onSearchesChange?: (searches: ActiveSearch[]) => void;
}

const SEARCH_STATUSES = ["ACTIVE", "ON_HOLD", "CLOSED"];

export default function ActiveSearches({
  searches,
  recruiterId,
  isEditing,
  onSearchesChange,
}: ActiveSearchesProps) {
  const [localSearches, setLocalSearches] = useState<ActiveSearch[]>(
    searches || []
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSearch, setNewSearch] = useState({
    title: "",
    level: "",
    industry: "",
    location: "",
    summary: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSearch = async () => {
    if (!newSearch.title.trim() || !recruiterId) {
      setError("Please enter a job title");
      return;
    }

    setLoading(true);
    try {
      const createdSearch = await profileApi.addActiveSearch(recruiterId, {
        title: newSearch.title,
        level: newSearch.level || undefined,
        industry: newSearch.industry || undefined,
        location: newSearch.location || undefined,
        summary: newSearch.summary || undefined,
        status: newSearch.status,
      });

      const updated = [...localSearches, createdSearch];
      setLocalSearches(updated);
      onSearchesChange?.(updated);
      resetForm();
      setError(null);
    } catch (err) {
      console.error("Failed to add search", err);
      setError("Failed to add search");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSearch = async (searchId: string) => {
    if (!newSearch.title.trim()) {
      setError("Please enter a job title");
      return;
    }

    setLoading(true);
    try {
      const updatedSearch = await profileApi.updateActiveSearch(searchId, {
        title: newSearch.title,
        level: newSearch.level || undefined,
        industry: newSearch.industry || undefined,
        location: newSearch.location || undefined,
        summary: newSearch.summary || undefined,
        status: newSearch.status,
      });

      const updated = localSearches.map((s) =>
        s.id === searchId ? updatedSearch : s
      );
      setLocalSearches(updated);
      onSearchesChange?.(updated);
      resetForm();
      setError(null);
    } catch (err) {
      console.error("Failed to update search", err);
      setError("Failed to update search");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSearch = async (searchId: string) => {
    setLoading(true);
    try {
      await profileApi.removeActiveSearch(searchId);
      const updated = localSearches.filter((s) => s.id !== searchId);
      setLocalSearches(updated);
      onSearchesChange?.(updated);
    } catch (err) {
      console.error("Failed to remove search", err);
      setError("Failed to remove search");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (search: ActiveSearch) => {
    setEditingId(search.id);
    setNewSearch({
      title: search.title,
      level: search.level || "",
      industry: search.industry || "",
      location: search.location || "",
      summary: search.summary || "",
      status: search.status,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setNewSearch({
      title: "",
      level: "",
      industry: "",
      location: "",
      summary: "",
      status: "ACTIVE",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-50 text-green-700 border-green-200";
      case "ON_HOLD":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "CLOSED":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Display searches */}
      <div className="space-y-2">
        {localSearches.map((search) => (
          <div
            key={search.id}
            className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{search.title}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(
                      search.status
                    )}`}
                  >
                    {search.status}
                  </span>
                </div>
                {search.summary && (
                  <p className="text-sm text-slate-600 mb-2">{search.summary}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  {search.level && <span>• Level: {search.level}</span>}
                  {search.industry && <span>• Industry: {search.industry}</span>}
                  {search.location && <span>• Location: {search.location}</span>}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(search)}
                    disabled={loading}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded disabled:opacity-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveSearch(search.id)}
                    disabled={loading}
                    className="p-2 hover:bg-red-50 text-red-600 rounded disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit search form */}
      {isEditing && (
        <>
          {!showForm ? (
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              size="sm"
              className="gap-1 mt-4"
            >
              <Plus className="w-4 h-4" />
              Add Search
            </Button>
          ) : (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Job Title *
                </label>
                <Input
                  value={newSearch.title}
                  onChange={(e) =>
                    setNewSearch({ ...newSearch, title: e.target.value })
                  }
                  placeholder="e.g., Senior Software Engineer"
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    Level
                  </label>
                  <Input
                    value={newSearch.level}
                    onChange={(e) =>
                      setNewSearch({ ...newSearch, level: e.target.value })
                    }
                    placeholder="e.g., Mid-level, Senior"
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    Status
                  </label>
                  <select
                    value={newSearch.status}
                    onChange={(e) =>
                      setNewSearch({ ...newSearch, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm h-9"
                  >
                    {SEARCH_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    Industry
                  </label>
                  <Input
                    value={newSearch.industry}
                    onChange={(e) =>
                      setNewSearch({ ...newSearch, industry: e.target.value })
                    }
                    placeholder="e.g., Technology, Finance"
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    Location
                  </label>
                  <Input
                    value={newSearch.location}
                    onChange={(e) =>
                      setNewSearch({ ...newSearch, location: e.target.value })
                    }
                    placeholder="e.g., Remote, New York"
                    className="h-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Summary
                </label>
                <textarea
                  value={newSearch.summary}
                  onChange={(e) =>
                    setNewSearch({ ...newSearch, summary: e.target.value })
                  }
                  placeholder="Describe what you're looking for..."
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm min-h-20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    editingId
                      ? handleUpdateSearch(editingId)
                      : handleAddSearch()
                  }
                  disabled={!newSearch.title.trim() || loading}
                  size="sm"
                  className="flex-1"
                >
                  {loading ? "Saving..." : editingId ? "Update" : "Add"}
                </Button>
                <Button
                  onClick={resetForm}
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

      {localSearches.length === 0 && (
        <p className="text-sm text-slate-500">
          {isEditing
            ? "No active searches. Create one to showcase what you're looking for!"
            : "No active searches"}
        </p>
      )}
    </div>
  );
}
