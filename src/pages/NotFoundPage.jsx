import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-lg font-bold">Page not found</p>
      <p className="text-ink-700">
        The link you followed doesn't match anything here.
      </p>
      <Link
        to="/"
        className="rounded-xl2 bg-ink-950 px-5 py-2.5 font-semibold text-paper"
      >
        Go home
      </Link>
    </div>
  );
}
