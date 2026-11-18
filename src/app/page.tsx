import { ShieldCheck, Database, Layers, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          ACME Employee Salary Management
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Core application scaffolding and database connectivity configuration established (Milestone 2).
        </p>
      </div>

      {/* System Status Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-blue-50 p-2 text-blue-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Framework</p>
              <p className="text-sm font-semibold text-slate-900">Next.js App Router</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Strict TypeScript, Tailwind CSS, shadcn/ui foundation.
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Database Layer</p>
              <p className="text-sm font-semibold text-slate-900">Drizzle ORM</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            node-postgres driver with PostgreSQL connection pool.
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-purple-50 p-2 text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">API Health</p>
              <p className="text-sm font-semibold text-slate-900">GET /api/health</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Automated database ping and error boundary.
          </p>
        </div>
      </div>

      {/* Setup confirmation */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Milestone 2 Foundations</h2>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Next.js App Router with TypeScript (strict mode) and path aliases</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Tailwind CSS, Lucide icons, and shadcn/ui design tokens configured</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Drizzle ORM configuration and database connection pooling in <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">src/lib/db</code></span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Health check endpoint available at <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/api/health</code></span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Ready for Milestone 3 (Employee schema definition and 10k deterministic seed)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
