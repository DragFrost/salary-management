import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Building2, Users, BarChart3 } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ACME Employee Salary Management System",
  description: "Global employee directory and multi-currency payroll insights.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col antialiased`}>
        {/* Top Navigation Shell */}
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">ACME Corp</span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 border-l pl-2">
                  Salary Management
                </span>
              </div>
            </div>

            {/* Navigation links placeholder */}
            <nav className="flex items-center gap-1 sm:gap-4 text-sm font-medium">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Directory</span>
              </Link>
              <Link
                href="/analytics"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Payroll Insights</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 container mx-auto px-4 sm:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white py-4 text-center text-xs text-slate-500">
          <div className="container mx-auto px-4">
            ACME Employee Salary Management System &bull; Technical Assessment Prototype
          </div>
        </footer>
      </body>
    </html>
  );
}
