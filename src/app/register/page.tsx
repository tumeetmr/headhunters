import { Suspense } from "react";
import RegisterForm from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center bg-accent px-4 py-12">
      <Suspense fallback={<div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-sm" />}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
