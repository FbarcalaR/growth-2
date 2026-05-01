import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-surface-frame text-brand-100 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="bg-surface-app text-brand-700 rounded-xl px-8 py-10 shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Growth</h1>
        <p className="text-brand-muted mt-2 max-w-sm text-sm">
          Plant your goals. Water them with daily action. Watch them bloom.
        </p>
        <Link
          href="/styleguide"
          className="rounded-pill bg-brand-700 hover:bg-brand-500 mt-6 inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white transition-colors"
        >
          Open style guide
        </Link>
      </div>
    </main>
  );
}
