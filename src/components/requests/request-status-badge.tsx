import { Badge } from "@/components/ui/badge";

interface RequestStatusBadgeProps {
  status: string;
}

function statusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "COUNTER_PROPOSED":
      return "Counter Proposed";
    case "ACCEPTED":
      return "Accepted";
    case "DECLINED":
      return "Declined";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

function statusClass(status: string) {
  if (status === "ACCEPTED") return "bg-emerald-100 text-emerald-700";
  if (status === "DECLINED") return "bg-rose-100 text-rose-700";
  if (status === "COUNTER_PROPOSED") return "bg-amber-100 text-amber-700";
  if (status === "COMPLETED") return "bg-sky-100 text-sky-700";
  return "bg-zinc-100 text-zinc-700";
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  return <Badge className={statusClass(status)}>{statusLabel(status)}</Badge>;
}
