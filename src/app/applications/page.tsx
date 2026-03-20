"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Building2, MapPin } from "lucide-react";
import { fetchRequests, updateRequestStatus } from "@/lib/forms-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RequestWithDetails {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  formTemplateId: string;
  recruiterId: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
    location?: string;
    industry?: string;
  };
  formTemplate?: {
    id: string;
    name: string;
    fields?: Array<{
      id: string;
      key: string;
      label: string;
      type?: string;
    }>;
  };
  answers?: Array<{
    id: string;
    formFieldId: string;
    value: string;
    formField?: {
      id: string;
      key: string;
      label: string;
    };
  }>;
}

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isRecruiter = session?.user?.role === "RECRUITER";

  useEffect(() => {
    if (!session) return;

    const loadRequests = async () => {
      try {
        setLoading(true);
        const data = await fetchRequests();
        setRequests(data as RequestWithDetails[]);
      } catch (err) {
        console.error("Failed to load requests:", err);
        setError(err instanceof Error ? err.message : "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [session]);

  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-lg text-zinc-500">Please log in to view your applications</p>
        <Link
          href="/login"
          className="mt-4 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const pageTitle = isRecruiter ? "Миний өргөдлүүд" : "My Applications";
  const pageSubtitle = isRecruiter
    ? "Компаниудаас хүлээн авсан хүсэлтүүд"
    : "Job applications you have submitted";
  const emptyMessage = isRecruiter ? "Хүсэлт байхгүй байна" : "No applications yet";
  const emptyDescription = isRecruiter
    ? "Компаниудаас хүлээн авсан хүсэлтүүд энд харагдах болно"
    : "Your job applications will appear here";

  async function handleStatusUpdate(nextStatus: "ACCEPTED" | "REJECTED") {
    if (!selectedRequest) return;

    setIsUpdatingStatus(true);
    setError(null);

    try {
      const updated = await updateRequestStatus(selectedRequest.id, nextStatus);

      setRequests((prev) =>
        prev.map((request) =>
          request.id === updated.id
            ? {
                ...request,
                status: updated.status,
                updatedAt: updated.updatedAt,
              }
            : request
        )
      );

      setSelectedRequest((prev) =>
        prev
          ? {
              ...prev,
              status: updated.status,
              updatedAt: updated.updatedAt,
            }
          : prev
      );

      setIsDialogOpen(false);
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Failed to update request status"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary-text dark:text-zinc-50">
          {pageTitle}
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          {pageSubtitle}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-80 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-400 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
          <Briefcase className="mx-auto h-12 w-12 text-zinc-400" />
          <p className="mt-4 text-lg font-medium text-zinc-600 dark:text-zinc-400">
            {emptyMessage}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {emptyDescription}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <div
              key={request.id}
              onClick={() => {
                setSelectedRequest(request);
                setIsDialogOpen(true);
              }}
              className="group cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-emerald-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-600"
            >
              {/* Company Logo Area */}
              <div className="relative h-24 bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700">
                {request.company?.logoUrl ? (
                  <img
                    src={request.company.logoUrl}
                    alt={request.company.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900/30 dark:to-cyan-900/30">
                    <Building2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-3 p-4">
                {/* Company Name */}
                <div>
                  <h3 className="font-semibold text-primary-text group-hover:text-emerald-600 dark:text-zinc-50 dark:group-hover:text-emerald-400">
                    {request.company?.name || "Unknown Company"}
                  </h3>
                  {request.company?.industry && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {request.company.industry}
                    </p>
                  )}
                </div>

                {/* Position & Location */}
                <div className="space-y-2">
                  {request.answers && request.answers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {request.answers[0]?.value || "Position Title"}
                      </p>
                    </div>
                  )}
                  {request.company?.location && (
                    <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                      <MapPin className="h-3 w-3" />
                      {request.company.location}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      request.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : request.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {request.status === "PENDING"
                      ? "Хүлээгдэж байна"
                      : request.status === "ACCEPTED"
                        ? "Зөвшөөрсөн"
                        : request.status}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(request.createdAt).toLocaleDateString("mn-MN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isRecruiter ? "Хүсэлтийн дэлгэрэнгүй" : "Application Details"}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="border-b border-zinc-200 pb-4 dark:border-zinc-700">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {isRecruiter ? "Компанийн мэдээлэл" : "Company Information"}
                </h3>
                <div className="mt-3 space-y-2">
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    {selectedRequest.company?.name}
                  </p>
                  {selectedRequest.company?.industry && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {isRecruiter ? "Салбар" : "Industry"}: {selectedRequest.company.industry}
                    </p>
                  )}
                  {selectedRequest.company?.location && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {isRecruiter ? "Байршил" : "Location"}: {selectedRequest.company.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Answers */}
              {selectedRequest.answers && selectedRequest.answers.length > 0 && (
                <div className="border-b border-zinc-200 pb-4 dark:border-zinc-700">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {isRecruiter ? "Хүсэлтийн дэлгэрэнгүй" : "Details"}
                  </h3>
                  <div className="mt-4 space-y-4">
                    {selectedRequest.answers.map((answer, idx) => (
                      <div key={answer.id}>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {answer.formField?.label || `Field ${idx + 1}`}
                        </p>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                          {answer.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="border-b border-zinc-200 pb-4 dark:border-zinc-700">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {isRecruiter ? "Төлөв" : "Status"}
                </h3>
                <div className="mt-2 space-y-2">
                  <p
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                      selectedRequest.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : selectedRequest.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {selectedRequest.status === "PENDING"
                      ? "Хүлээгдэж байна"
                      : selectedRequest.status === "ACCEPTED"
                        ? "Зөвшөөрсөн"
                        : selectedRequest.status}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isRecruiter ? "Хүлээн авсан" : "Received"}: {new Date(selectedRequest.createdAt).toLocaleString("mn-MN")}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {isRecruiter ? "Хаах" : "Close"}
                </button>
                {isRecruiter && selectedRequest.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate("REJECTED")}
                      disabled={isUpdatingStatus}
                      className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      {isUpdatingStatus ? "Updating..." : "Татгалзах"}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("ACCEPTED")}
                      disabled={isUpdatingStatus}
                      className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingStatus ? "Updating..." : "Зөвшөөрөх"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
