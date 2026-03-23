import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type RecruitRequest } from "@/lib/forms-api";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { MessageSquare, User, MapPin, Briefcase, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RecruitRequest;
  role?: string;
  loading: boolean;
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
  onSendCounter: (message: string) => Promise<void>;
  onAcceptCounter: () => Promise<void>;
  onDeclineCounter: () => Promise<void>;
}

function answerByKey(request: RecruitRequest, key: string) {
  return request.answers?.find((a) => a.formField?.key === key)?.value || "-";
}

function answerChipList(request: RecruitRequest, key: string) {
  const value = answerByKey(request, key);
  if (!value || value === "-") return [];
  return value
    .split(/,|\n|\//)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeAnswerValue(value?: string | null) {
  if (!value?.trim()) return "-";
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  return value;
}

function prettyDate(input?: string | null) {
  if (!input) return "-";
  return new Date(input).toLocaleString();
}

function initials(label: string) {
  const parts = label.split(" ").filter(Boolean);
  if (parts.length === 0) return "R";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function RequestDetailDialog({
  open,
  onOpenChange,
  request,
  role,
  loading,
  onAccept,
  onDecline,
  onSendCounter,
  onAcceptCounter,
  onDeclineCounter,
}: RequestDetailDialogProps) {
  const router = useRouter();
  const [counterMessage, setCounterMessage] = useState("");
  const isRecruiter = role === "RECRUITER";
  const primaryName = isRecruiter
    ? request.company?.name || "Unknown Company"
    : request.recruiter?.user?.name || "Unknown Recruiter";

  const positionTitle = answerByKey(request, "position_title");
  const coverLetter = answerByKey(request, "main_responsibilities");
  const requiredSkills = answerChipList(request, "required_skills");
  const formQuestionAnswers = [...(request.answers || [])].sort((a, b) => {
    const aOrder = a.formField?.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.formField?.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.formField?.label || "").localeCompare(b.formField?.label || "");
  });

  const handleMessageRecruiter = () => {
    if (request.recruiter?.id) {
      router.push(`/messages?recruiterId=${request.recruiter.id}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto bg-slate-50 p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Request Detail</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <Card className="border-slate-200 bg-white">
            <CardContent className="flex flex-col gap-6 p-5 md:p-6">
              {/* Position and Status */}
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">{positionTitle}</p>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-600 md:grid-cols-4">
                  <p>
                    <span className="block text-xs text-slate-500">Created</span>
                    {prettyDate(request.createdAt)}
                  </p>
                  <p>
                    <span className="block text-xs text-slate-500">Updated</span>
                    {prettyDate(request.updatedAt)}
                  </p>
                  <p>
                    <span className="block text-xs text-slate-500">Responded</span>
                    {prettyDate(request.respondedAt)}
                  </p>
                  <div>
                    <span className="mb-1 block text-xs text-slate-500">Status</span>
                    <RequestStatusBadge status={request.status} />
                  </div>
                </div>
              </div>

              {/* Recruiter Profile Section (Company Side) */}
              {!isRecruiter && request.recruiter ? (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Recruiter Profile</h3>
                  <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Recruiter Info */}
                    <div className="flex flex-1 items-start gap-4">
                      {/* Photo */}
                      <div className="shrink-0">
                        {request.recruiter.photoUrl ? (
                          <Image
                            src={request.recruiter.photoUrl}
                            alt={primaryName}
                            width={80}
                            height={80}
                            className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-2xl font-semibold text-slate-700">
                            {initials(primaryName)}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <p className="text-base font-semibold text-slate-900">{primaryName}</p>
                          {request.recruiter.isVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        {request.recruiter.title && (
                          <p className="mt-1 font-medium text-slate-600">{request.recruiter.title}</p>
                        )}

                        {request.recruiter.tagline && (
                          <p className="mt-1 text-sm text-slate-500">{request.recruiter.tagline}</p>
                        )}

                        {/* Meta Badges */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {request.recruiter.yearsExperience && (
                            <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                              <Briefcase className="h-3 w-3 text-slate-500" />
                              <span>{request.recruiter.yearsExperience}+ years</span>
                            </div>
                          )}

                          {request.recruiter.location && (
                            <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                              <MapPin className="h-3 w-3 text-slate-500" />
                              <span>{request.recruiter.location}</span>
                            </div>
                          )}

                          {request.recruiter.rating && request.recruiter.rating > 0 && (
                            <div className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{request.recruiter.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {request.recruiter.slug && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-xs"
                          >
                            <Link href={`/recruiters/${request.recruiter.slug}`}>
                              <User className="mr-1.5 h-3.5 w-3.5" />
                              Profile
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleMessageRecruiter}
                          className="text-xs"
                        >
                          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Fallback for Recruiter Side */
                <div className="border-t border-slate-100 pt-6">
                  <div>
                    <p className="text-lg font-semibold text-slate-600">{primaryName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {isRecruiter ? request.company?.industry : request.recruiter?.title} • {isRecruiter ? request.company?.location : "Recruiter"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {request.counterProposalMessage ? (
            <Card className="border-amber-200 bg-white">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-900">Counter Proposal</h3>
                  {request.status === "COUNTER_PROPOSED" && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Awaiting Response
                    </span>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {request.counterProposalMessage}
                </p>

                {!isRecruiter && request.status === "COUNTER_PROPOSED" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => void onAcceptCounter()}
                      disabled={loading}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => void onDeclineCounter()}
                      disabled={loading}
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {request.status !== "COUNTER_PROPOSED" && (
                  <p className="text-xs text-slate-500">
                    Counter proposal {request.status === "ACCEPTED" ? "accepted" : "declined"}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-5">
              <h3 className="text-xl font-semibold text-slate-900">Cover Letter</h3>
              <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-700">{coverLetter}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="grid gap-5 p-5 text-sm text-slate-700 md:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Salary</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{answerByKey(request, "salary")}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Culture Fit</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{answerByKey(request, "culture_fit")}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Benefits</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{answerByKey(request, "benefits")}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Other Requirements</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{answerByKey(request, "other_requirements")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-5">
              <h3 className="text-xl font-semibold text-slate-900">Company Information</h3>
              <div className="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Company Name</p>
                  <p className="mt-1 font-semibold text-slate-900">{request.company?.name || "-"}</p>
                  <p className="mt-1 text-sm">{request.company?.industry || "-"}</p>
                  <p className="text-sm">{request.company?.location || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Contact</p>
                  <p className="mt-1 font-semibold text-slate-900">{request.company?.user?.name || "-"}</p>
                  <p className="mt-1 text-sm">{request.company?.user?.email || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-5">
              <h3 className="text-xl font-semibold text-slate-900">Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {requiredSkills.length > 0 ? (
                  requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No skills provided</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="p-5">
              <h3 className="text-xl font-semibold text-slate-900">Hiring Form Q&amp;A</h3>
              {formQuestionAnswers.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No form responses provided</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {formQuestionAnswers.map((answer, idx) => (
                    <div
                      key={answer.id || `${answer.formFieldId}-${idx}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {answer.formField?.label || `Question ${idx + 1}`}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-800">
                        {normalizeAnswerValue(answer.value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {isRecruiter && request.status === "PENDING" && (
            <Card className="border-slate-200 bg-white">
              <CardContent className="space-y-4 p-5">
                <h3 className="text-lg font-semibold text-slate-900">Respond To Request</h3>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={() => void onAccept()} disabled={loading}>
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void onDecline()}
                    disabled={loading}
                  >
                    Decline
                  </Button>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-500">
                    Optional: send a counter proposal message instead of accepting/declining.
                  </p>
                  <textarea
                    className="min-h-22.5 w-full rounded-md border border-slate-200 p-2 text-sm"
                    placeholder="Counter proposal message..."
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => void onSendCounter(counterMessage)}
                    disabled={loading || !counterMessage.trim()}
                  >
                    Send Counter Proposal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
