"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchFormTemplates, FormTemplate } from "@/lib/forms-api";
import { put } from "@/lib/api";

interface FormManagerProps {
  companyId: string;
  currentFormTemplateId?: string;
  onSave?: () => void | Promise<void>;
  isEditing?: boolean;
}

export function FormManager({
  companyId,
  currentFormTemplateId,
  onSave,
  isEditing = false,
}: FormManagerProps) {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    currentFormTemplateId || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const data = await fetchFormTemplates();
        setTemplates(data.filter((t) => t.isActive !== false));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load form templates"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleSave = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      setIsLoading(true);

      await put(`/companies/${companyId}`, {
        formTemplateId: selectedTemplateId || null,
      });

      setSuccessMessage("Form template updated successfully!");
      onSave?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save form template"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-900">
          Select Request Form Template
        </label>
        {isLoading && templates.length === 0 ? (
          <p className="text-sm text-slate-500">Loading templates...</p>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  selectedTemplateId === template.id
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {template.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {template.fields?.length || 0} fields
                    </p>
                  </div>
                  <div
                    className={`h-5 w-5 rounded border-2 transition-all ${
                      selectedTemplateId === template.id
                        ? "border-primary bg-primary"
                        : "border-slate-300"
                    }`}
                  />
                </div>
              </button>
            ))}

            {/* Option to remove form template */}
            <button
              onClick={() => setSelectedTemplateId("")}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                selectedTemplateId === ""
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">No Form Template</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Recruiters won't use a form for requests
                  </p>
                </div>
                <div
                  className={`h-5 w-5 rounded border-2 transition-all ${
                    selectedTemplateId === ""
                      ? "border-slate-400 bg-slate-400"
                      : "border-slate-300"
                  }`}
                />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Template Preview */}
      {selectedTemplate && (
        <div className="rounded-lg bg-slate-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900">Form Preview</p>
          <div className="space-y-2">
            {(selectedTemplate.fields || []).map((field) => (
              <div
                key={field.id}
                className="rounded bg-white p-3 border border-slate-200"
              >
                <p className="text-xs font-semibold text-slate-700">
                  {field.label}
                  {field.isRequired && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Type: {field.type || "TEXT"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Saving..." : "Save Template"}
          </Button>
        </div>
      )}
    </div>
  );
}
