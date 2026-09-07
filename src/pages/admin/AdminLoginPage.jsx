import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../../components/LoadingSkeleton";

export default function AdminLoginPage() {
  const { login, user, initializing } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!initializing && user) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError("Incorrect email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl2 bg-paper p-7 shadow-soft"
      >
        <h1 className="mb-1 text-xl font-extrabold">Owner login</h1>
        <p className="mb-6 text-sm text-ink-700">
          Sign in to manage orders and products.
        </p>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-ink-800">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-sand px-4 py-3 outline-none"
          />
        </label>

        <label className="mb-2 block">
          <span className="mb-1.5 block text-sm font-medium text-ink-800">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-sand px-4 py-3 outline-none"
          />
        </label>

        {error && (
          <p className="mb-2 text-sm font-medium text-clay-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl2 bg-marigold-500 py-3.5 font-bold text-ink-950 disabled:opacity-60"
        >
          {submitting && <Spinner />}
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
