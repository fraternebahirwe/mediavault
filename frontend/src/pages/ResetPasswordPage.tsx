import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthLayout } from "../components/layout/AuthLayout";
import { resetPasswordRequest } from "../api/auth.api";
import { getApiErrorMessage } from "../api/client";
import { Spinner } from "../components/ui/Spinner";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPasswordRequest(token, password);
      toast.success("Password reset. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Reset failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This reset link is missing its token">
        <Link to="/forgot-password" className="text-brand-600 font-medium hover:underline text-sm">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">New password</label>
          <input
            type="password"
            required
            minLength={8}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting && <Spinner className="text-white" size={16} />}
          Reset password
        </button>
      </form>
    </AuthLayout>
  );
}
