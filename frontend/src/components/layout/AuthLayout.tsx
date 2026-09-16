import { ReactNode } from "react";
import { Vault } from "lucide-react";

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl2 bg-brand-600 flex items-center justify-center mb-3">
            <Vault size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">{subtitle}</p>
        </div>
        <div className="card p-6">{children}</div>
      </div>
    </div>
  );
}
