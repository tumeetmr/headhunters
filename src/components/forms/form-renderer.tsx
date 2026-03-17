"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface FormField {
  id: string;
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: string;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface FormTemplate {
  id: string;
  name: string;
  isActive?: boolean;
  fields?: FormField[];
}

export interface FormAnswer {
  formFieldId: string;
  value: string;
}

interface FormRendererProps {
  template: FormTemplate;
  isLoading?: boolean;
  onSubmit: (answers: FormAnswer[]) => void | Promise<void>;
  submitButtonLabel?: string;
  showValidation?: boolean;
}

export function FormRenderer({
  template,
  isLoading = false,
  onSubmit,
  submitButtonLabel = "Submit",
  showValidation = true,
}: FormRendererProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    (template.fields || []).forEach((field) => {
      if (field.isRequired && !answers[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for this field when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showValidation && !validateForm()) {
      return;
    }

    const formAnswers: FormAnswer[] = (template.fields || []).map((field) => ({
      formFieldId: field.id,
      value: answers[field.id] || "",
    }));

    try {
      await onSubmit(formAnswers);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const renderField = (field: FormField) => {
    const key = field.id;
    const hasError = errors[key];

    switch (field.type) {
      case "TEXTAREA":
        return (
          <textarea
            key={key}
            value={answers[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            required={field.isRequired}
            className={`w-full rounded-lg border px-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary ${
              hasError ? "border-red-500 focus:ring-red-500" : "border-slate-200"
            }`}
          />
        );

      case "EMAIL":
        return (
          <Input
            key={key}
            type="email"
            value={answers[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            className={hasError ? "border-red-500 focus:ring-red-500" : ""}
          />
        );

      case "PHONE":
        return (
          <Input
            key={key}
            type="tel"
            value={answers[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            className={hasError ? "border-red-500 focus:ring-red-500" : ""}
          />
        );

      case "NUMBER":
        return (
          <Input
            key={key}
            type="number"
            value={answers[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            className={hasError ? "border-red-500 focus:ring-red-500" : ""}
          />
        );

      case "DATE":
        return (
          <Input
            key={key}
            type="date"
            value={answers[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.isRequired}
            className={hasError ? "border-red-500 focus:ring-red-500" : ""}
          />
        );

      case "SELECT":
        {
          const options = field.options ? JSON.parse(field.options) : [];
          return (
            <select
              key={key}
              value={answers[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.isRequired}
              className={`w-full rounded-lg border px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary ${
                hasError ? "border-red-500 focus:ring-red-500" : "border-slate-200"
              }`}
            >
              <option value="">Select {field.label}</option>
              {options.map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
        }

      case "CHECKBOX":
        return (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={answers[field.id] === "true"}
              onChange={(e) =>
                handleInputChange(field.id, e.target.checked ? "true" : "")
              }
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-700">
              {field.label}
            </span>
          </label>
        );

      case "MULTI_SELECT":
        {
          const options = field.options ? JSON.parse(field.options) : [];
          const selectedValues = answers[field.id]
            ? answers[field.id].split(",")
            : [];

          return (
            <div key={key} className="space-y-2">
              {options.map((opt: string) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(opt)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, opt]
                        : selectedValues.filter((v) => v !== opt);
                      handleInputChange(field.id, newValues.join(","));
                    }}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          );
        }

      case "TEXT":
      default:
        return (
          <Input
            key={key}
            type="text"
            value={answers[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            className={hasError ? "border-red-500 focus:ring-red-500" : ""}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(template.fields || [])
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">
              {field.label}
              {field.isRequired && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p className="text-xs text-red-500">{errors[field.id]}</p>
            )}
          </div>
        ))}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : submitButtonLabel}
      </Button>
    </form>
  );
}
