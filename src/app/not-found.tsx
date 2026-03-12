import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-light text-gray-300">404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-primary-text sm:text-5xl md:text-6xl">
        Oops! You&apos;ve Ventured
        <br />
        Off the Map
      </h1>
      <Button asChild variant="gradient" size="lg" className="mt-8 px-8">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
