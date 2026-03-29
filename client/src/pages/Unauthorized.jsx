import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,_#020617,_#0f172a_45%,_#1e293b)] px-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/95 p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
        <p className="text-sm uppercase tracking-[0.28em] text-rose-600">Access restricted</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">You do not have permission for this workspace.</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          The current route is protected by role-based access. If this looks wrong, an administrator may need to update your account permissions.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Return Home
          </Link>
          <Link
            to="/login"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
