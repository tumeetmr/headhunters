"use client";

import { useState } from "react";
import { X, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileApi, type Insight } from "@/lib/profile-api";

interface InsightsManagerProps {
  insights: Insight[];
  recruiterId: string;
  isEditing: boolean;
  onInsightsChange?: (insights: Insight[]) => void;
}

const INSIGHT_STATUSES = ["DRAFT", "PUBLISHED", "COMING_SOON", "ARCHIVED"];

export default function InsightsManager({
  insights,
  recruiterId,
  isEditing,
  onInsightsChange,
}: InsightsManagerProps) {
  const [localInsights, setLocalInsights] = useState<Insight[]>(insights || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    mediaUrl: "",
    description: "",
    status: "DRAFT",
    sortOrder: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.mediaUrl.trim()) {
      setError("Title and media URL are required");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const updated = await profileApi.updateInsight(editingId, formData);
        setLocalInsights(localInsights.map(i => i.id === editingId ? updated : i));
      } else {
        const created = await profileApi.addInsight(recruiterId, formData);
        setLocalInsights([...localInsights, created]);
      }
      onInsightsChange?.(localInsights);
      resetForm();
      setError(null);
    } catch (err) {
      console.error("Failed to save insight", err);
      setError(editingId ? "Failed to update insight" : "Failed to create insight");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this insight?")) return;

    setLoading(true);
    try {
      await profileApi.removeInsight(id);
      const updated = localInsights.filter(i => i.id !== id);
      setLocalInsights(updated);
      onInsightsChange?.(updated);
    } catch (err) {
      console.error("Failed to delete insight", err);
      setError("Failed to delete insight");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (insight: Insight) => {
    setEditingId(insight.id);
    setFormData({
      title: insight.title,
      mediaUrl: insight.mediaUrl || "",
      description: insight.description || "",
      status: insight.status,
      sortOrder: insight.sortOrder || 0,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      mediaUrl: "",
      description: "",
      status: "DRAFT",
      sortOrder: 0,
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PUBLISHED: "bg-green-100 text-green-700",
      DRAFT: "bg-yellow-100 text-yellow-700",
      COMING_SOON: "bg-blue-100 text-blue-700",
      ARCHIVED: "bg-slate-100 text-slate-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-2">
        {localInsights.map((insight) => (
          <div key={insight.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{insight.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(insight.status)}`}>
                  {insight.status}
                </span>
                {insight.mediaUrl && (
                  <span className="text-xs text-slate-500">Has media</span>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => startEdit(insight)}
                  disabled={loading}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(insight.id)}
                  disabled={loading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {isEditing && (
        <>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} size="sm" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Insight
            </Button>
          ) : (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <h3 className="font-semibold text-slate-900">
                {editingId ? "Edit Insight" : "New Insight"}
              </h3>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., How to Hire Engineers"
                  className="h-8"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Media URL</label>
                <Input
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or TikTok/Instagram link"
                  className="h-8"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                  className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm min-h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm h-8"
                  >
                    {INSIGHT_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Order</label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                    className="h-8"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={loading || !formData.title.trim() || !formData.mediaUrl.trim()}
                  className="flex-1"
                  size="sm"
                >
                  {loading ? "Saving..." : editingId ? "Update" : "Create"}
                </Button>
                <Button onClick={resetForm} variant="outline" size="sm" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {localInsights.length === 0 && !showForm && (
        <p className="text-sm text-slate-500 text-center py-4">
          {isEditing ? "No insights yet" : "No insights available"}
        </p>
      )}
    </div>
  );
}
