import { Button } from "@/components/ui/button";
import { type Proposal } from "@/lib/proposals-api";
import { ChevronRight } from "lucide-react";

function formatProposalStatus(status: Proposal["status"]) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "ACCEPTED":
      return "Accepted";
    case "REJECTED":
      return "Rejected";
    case "WITHDRAWN":
      return "Withdrawn";
    default:
      return status;
  }
}

function proposalStatusClass(status: Proposal["status"]) {
  switch (status) {
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "ACCEPTED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "WITHDRAWN":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

interface ProposalCardProps {
  proposal: Proposal;
  onClick?: (p: Proposal) => void;
  onWithdraw?: () => void;
  onMessage?: () => void;
  loading?: boolean;
  variant?: "company" | "recruiter";
}

export function ProposalCard({
  proposal,
  onClick,
  onWithdraw,
  onMessage,
  loading = false,
  variant = "company",
}: ProposalCardProps) {
  const isClickable = variant === "company" && onClick;
  const showActions = variant === "recruiter" && (onWithdraw || onMessage);
  const canWithdraw = proposal.status === "PENDING";

  const profileName = variant === "company" 
    ? proposal.recruiterProfile?.user?.name 
    : proposal.jobOpening?.company?.name;

  return (
    <div
      onClick={() => isClickable && onClick?.(proposal)}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.(proposal);
        }
      }}
      className={`w-full text-left rounded-lg border border-slate-200 bg-white p-4 transition-all duration-200 ${
        isClickable 
          ? "cursor-pointer hover:border-slate-300 hover:shadow-md" 
          : "cursor-default"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Profile/Company Info */}
          <div className="mb-2">
            <p className="truncate text-xs font-medium text-slate-600">
              {profileName || (variant === "company" ? "Recruiter" : "Company")}
            </p>
          </div>

          {/* Job Title */}
          <p className="truncate text-sm font-semibold text-slate-900 mb-3">
            {proposal.jobOpening?.title || "Untitled Job"}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span
              className={`inline-flex rounded px-2 py-1 text-xs font-medium ${proposalStatusClass(
                proposal.status
              )}`}
            >
              {formatProposalStatus(proposal.status)}
            </span>
            
            {proposal.estimatedDays && (
              <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                {proposal.estimatedDays}d delivery
              </span>
            )}

            {variant === "company" && proposal.recruiterProfile?.rating && proposal.recruiterProfile.rating > 0 && (
              <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                ⭐ {proposal.recruiterProfile.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Pitch Preview */}
          {proposal.pitch && (
            <p className="line-clamp-2 text-xs text-slate-600">
              {proposal.pitch}
            </p>
          )}

          {/* Actions for Recruiter Variant */}
          {showActions && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {onMessage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    onMessage();
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Message
                </Button>
              )}
              {onWithdraw && canWithdraw && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    onWithdraw();
                  }}
                  disabled={loading}
                  className="h-6 px-2 text-xs"
                >
                  Withdraw
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Chevron for Company Variant */}
        {isClickable && <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />}
      </div>
    </div>
  );
}

export { formatProposalStatus, proposalStatusClass };


