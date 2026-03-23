import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type RecruitRequest } from "@/lib/forms-api";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { RequestDetailDialog } from "@/components/requests/request-detail-dialog";

interface RequestListCardProps {
  request: RecruitRequest;
  role?: string;
  loading: boolean;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
  onSendCounter: (id: string, message: string) => Promise<void>;
  onAcceptCounter: (id: string) => Promise<void>;
  onDeclineCounter: (id: string) => Promise<void>;
}

function answerByKey(request: RecruitRequest, key: string) {
  return request.answers?.find((a) => a.formField?.key === key)?.value || "Untitled Request";
}

function prettyDate(input?: string | null) {
  if (!input) return "-";
  return new Date(input).toLocaleDateString();
}

export function RequestListCard({
  request,
  role,
  loading,
  onAccept,
  onDecline,
  onSendCounter,
  onAcceptCounter,
  onDeclineCounter,
}: RequestListCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const title = answerByKey(request, "position_title");
  const counterpart =
    role === "RECRUITER"
      ? request.company?.name || "Unknown Company"
      : request.recruiter?.user?.name || "Unknown Recruiter";
  const meta =
    role === "RECRUITER"
      ? `${request.company?.industry || "General"} • ${request.company?.location || "Remote"}`
      : `${request.recruiter?.title || "Recruiter"} • ${request.recruiter?.yearsExperience ?? "-"} yrs`;

  return (
    <>
      <Card
        className="cursor-pointer border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        role="button"
        tabIndex={0}
        onClick={() => setShowDetails(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setShowDetails(true);
          }
        }}
      >
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">Created {prettyDate(request.createdAt)}</p>
              <CardTitle className="mt-2 text-xl leading-tight text-slate-900">{title}</CardTitle>
              <p className="mt-2 text-sm font-semibold text-slate-700">{counterpart}</p>
            </div>
            <RequestStatusBadge status={request.status} />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">{meta}</p>
          <p className="mt-2 text-xs text-slate-500">Click card to view full request detail</p>
        </CardContent>
      </Card>

      <RequestDetailDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        request={request}
        role={role}
        loading={loading}
        onAccept={() => onAccept(request.id)}
        onDecline={() => onDecline(request.id)}
        onSendCounter={(message) => onSendCounter(request.id, message)}
        onAcceptCounter={() => onAcceptCounter(request.id)}
        onDeclineCounter={() => onDeclineCounter(request.id)}
      />
    </>
  );
}
