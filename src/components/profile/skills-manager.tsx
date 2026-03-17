"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { get, post, put } from "@/lib/api";
import { type Skill } from "@/lib/profile-api";

interface SkillsManagerProps {
  recruiterId?: string;
  companyId?: string;
  currentSkills?: Skill[];
  isEditing: boolean;
  onSave?: (skillIds: string[]) => void;
}

const SKILL_CATEGORIES = [
  "SKILL",
  "INDUSTRY",
  "EXPERTISE",
  "LANGUAGE",
  "CERTIFICATION",
];

const SKILL_LABELS: Record<string, string> = {
  SKILL: "Skills",
  INDUSTRY: "Industry",
  EXPERTISE: "Expertise",
  LANGUAGE: "Languages",
  CERTIFICATION: "Certifications",
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function SkillsManager({ 
  recruiterId, 
  companyId,
  currentSkills = [],
  isEditing, 
  onSave 
}: SkillsManagerProps) {
  const [skills, setSkills] = useState<Skill[]>(currentSkills);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSkills(currentSkills);
  }, [currentSkills]);

  useEffect(() => {
    fetchAvailableSkills();
  }, []);

  const fetchAvailableSkills = async () => {
    try {
      const data = await get<Skill[]>("/skills");
      setAvailableSkills(data);
    } catch (err) {
      console.error("Failed to fetch skills", err);
    }
  };

  const getSkillsByCategory = (category: string) => {
    return skills.filter((s) => s.type === category);
  };

  const addSkill = async (category: string, skillName: string) => {
    const normalized = skillName.trim().toLowerCase();
    if (!normalized) return;

    let matchedSkill = availableSkills.find(
      (skill) => skill.type === category && skill.value.toLowerCase() === normalized
    );

    if (!matchedSkill) {
      try {
        const createdSkill = await post<Skill>("/skills", {
          type: category,
          value: skillName.trim(),
        });

        matchedSkill = createdSkill;
        setAvailableSkills((prev) => {
          if (prev.some((skill) => skill.id === createdSkill.id)) return prev;
          return [...prev, createdSkill];
        });
      } catch (err) {
        console.error("Failed to create skill", err);
        if (typeof err === "object" && err !== null && "response" in err) {
          const axiosError = err as { response?: { data?: { message?: string | string[] } } };
          const message = axiosError?.response?.data?.message;
          setError(Array.isArray(message) ? message.join(", ") : (message || "Failed to create skill"));
        } else {
          setError("Failed to create skill");
        }
        return;
      }
    }

    if (skills.some((skill) => skill.id === matchedSkill.id)) {
      setInputValues({ ...inputValues, [category]: "" });
      return;
    }

    const newSkill: Skill = {
      id: matchedSkill.id,
      type: matchedSkill.type,
      value: matchedSkill.value,
    };

    setError(null);
    setSkills([...skills, newSkill]);
    setInputValues({ ...inputValues, [category]: "" });
  };

  const removeSkill = (skillId: string) => {
    setSkills(skills.filter((s) => s.id !== skillId));
  };

  const handleSave = async () => {
    if (!recruiterId && !companyId) return;

    setLoading(true);
    setError(null);
    try {
      const skillIds = Array.from(new Set(skills.map((s) => s.id).filter((id) => UUID_REGEX.test(id))));
      const endpoint = recruiterId ? "/recruiters" : "/companies";
      
      await put(endpoint, { skillIds });
      onSave?.(skillIds);
    } catch (err) {
      console.error("Failed to save skills", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string | string[] } } };
        const message = axiosError?.response?.data?.message;
        setError(Array.isArray(message) ? message.join(", ") : (message || "Failed to save skills"));
      } else {
        setError("Failed to save skills");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing && skills.length === 0) {
    return <p className="text-sm text-slate-500">No skills added yet</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Render each category section */}
      {SKILL_CATEGORIES.map((category) => {
        const categorySkills = getSkillsByCategory(category);
        const hasSkills = categorySkills.length > 0;

        return (isEditing || hasSkills) ? (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">{SKILL_LABELS[category] || category}</h3>

            {/* Display skills as tags */}
            {hasSkills && (
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200"
                  >
                    <span className="text-sm font-medium">{skill.value}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="p-0.5 hover:bg-slate-200 rounded transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add skill form */}
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add ${SKILL_LABELS[category]?.toLowerCase() || category.toLowerCase()}...`}
                  value={inputValues[category] || ""}
                  list={`skills-${category}`}
                  onChange={(e) => setInputValues({ ...inputValues, [category]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void addSkill(category, inputValues[category]);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <datalist id={`skills-${category}`}>
                  {availableSkills
                    .filter(
                      (skill) =>
                        skill.type === category &&
                        !skills.some((selectedSkill) => selectedSkill.id === skill.id)
                    )
                    .map((skill) => (
                      <option key={`${category}-${skill.id}`} value={skill.value} />
                    ))}
                </datalist>
                <button
                  onClick={() => void addSkill(category, inputValues[category])}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        ) : null;
      })}

      {isEditing && (
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => setSkills(currentSkills)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
