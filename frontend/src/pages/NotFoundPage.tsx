import { Link } from "react-router-dom";
import { Vault } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Vault size={40} className="text-brand-600" />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}
