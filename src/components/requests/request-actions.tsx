import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RequestActionsProps {
  role?: string;
  status: string;
  loading: boolean;
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
  onSendCounter: (message: string) => Promise<void>;
  onAcceptCounter: () => Promise<void>;
  onDeclineCounter: () => Promise<void>;
}

export function RequestActions({
  role,
  status,
  loading,
  onAccept,
  onDecline,
  onSendCounter,
  onAcceptCounter,
  onDeclineCounter,
}: RequestActionsProps) {
  const [showCounterBox, setShowCounterBox] = useState(false);
  const [counterMessage, setCounterMessage] = useState("");

  if (role === "RECRUITER" && status === "PENDING") {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button size="lg" disabled={loading} onClick={() => void onAccept()}>
            Accept
          </Button>
          <Button size="lg" variant="destructive" disabled={loading} onClick={() => void onDecline()}>
            Decline
          </Button>
          <Button
            size="lg"
            variant="outline"
            disabled={loading}
            onClick={() => setShowCounterBox((prev) => !prev)}
          >
            Counter
          </Button>
        </div>

        {showCounterBox ? (
          <div className="space-y-2 rounded-md border border-slate-200 p-3">
            <textarea
              value={counterMessage}
              onChange={(e) => setCounterMessage(e.target.value)}
              className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Write your counter terms"
            />
            <div className="flex gap-2">
              <Button
                size="lg"
                disabled={loading || !counterMessage.trim()}
                onClick={() => void onSendCounter(counterMessage)}
              >
                Send Counter
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => {
                  setCounterMessage("");
                  setShowCounterBox(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (role === "COMPANY" && status === "COUNTER_PROPOSED") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="lg" disabled={loading} onClick={() => void onAcceptCounter()}>
          Accept Counter
        </Button>
        <Button size="lg" variant="destructive" disabled={loading} onClick={() => void onDeclineCounter()}>
          Decline Counter
        </Button>
      </div>
    );
  }

  return null;
}
