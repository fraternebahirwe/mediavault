import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthLayout } from "../components/layout/AuthLayout";
import { forgotPasswordRequest } from "../api/auth.api";
import { getApiErrorMessage } from "../api/client";
import { Spinner } from "../components/ui/Spinner";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await forgotPasswordRequest(email);
      setSent(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Something went wrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to reset it">
      {sent ? (
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          If an account exists for <strong>{email}</strong>, a reset link has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
            {isSubmitting && <Spinner className="text-white" size={16} />}
            Send reset link
          </button>
        </form>
      )}
      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-5">
        <Link to="/login" className="text-brand-600 font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
