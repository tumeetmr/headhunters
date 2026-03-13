import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] bg-accent w-full items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-sm" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
