import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-20vh)] flex-col items-center justify-center bg-white px-6 dark:bg-black">
      <section className="flex max-w-4xl flex-col items-center text-center">
        <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight text-[#212B36] dark:text-zinc-50 md:text-6xl">
          Recruiting software that
          <br />
          helps you <span className="bg-linear-to-r from-[#36CCC7] via-[#36CCC7] to-[#34E89E] bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #36CCC7 45.93%, #34E89E 72.8%)" }}>hire faster</span> for free
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
          Attract great talent to your open roles to take your business to the
          next level. Build, promote and manage your jobs with our free to use
          recruitment software.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Button variant="gradient" size="lg" className="h-14 rounded-xl px-8 text-base font-semibold" asChild>
            <Link href="/get-started">Get Started Free</Link>
          </Button>
          <Button variant="outline" size="lg" className="h-14 rounded-xl px-8 text-base font-medium text-[#212B36]" asChild>
            <Link href="/learn-more">
              Learn more
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
