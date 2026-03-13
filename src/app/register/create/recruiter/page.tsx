import Link from "next/link";

export default function CreateRecruiterProfilePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col items-center justify-center px-6 py-12">
      <section className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-primary-text">Create Recruiter Profile</h1>
        <p className="mt-3 text-sm text-zinc-600">
          This is a placeholder onboarding page for recruiter users.
        </p>
        <div className="mt-6">
          <Link href="/" className="text-sm font-semibold text-primary-text hover:underline">
            Go to home
          </Link>
        </div>
      </section>
    </main>
  );
}
