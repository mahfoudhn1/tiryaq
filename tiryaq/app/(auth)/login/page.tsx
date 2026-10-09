'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { setUser } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { demoLogin, login } from '@/lib/api/auth';
import type { UserRole } from '@/types/medical';

const DEMO_ACCOUNTS: { role: UserRole; label: string; description: string; email: string }[] = [
  { role: 'STUDENT', label: 'Student', description: 'Aya Zmt · MS-V', email: 'Aya.Zmt@tiryaq.com' },
  { role: 'INSTRUCTOR', label: 'Instructor', description: 'Dr. Amine Haddad · Cardiology', email: 'amine.haddad@tiryaq.com' },
  { role: 'ADMIN', label: 'Administrator', description: 'Platform operations', email: 'admin@tiryaq.com' },
];

const destinations: Record<UserRole, string> = {
  STUDENT: '/dashboard',
  INSTRUCTOR: '/instructor',
  ADMIN: '/admin',
};

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState('password');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectAccount = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setRole(account.role);
    setEmail(account.email);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const auth = email ? await login(email, password) : await demoLogin(role);
      dispatch(setUser(auth.user));
      router.push(destinations[auth.user.role]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#FFFFFF] lg:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-bold text-[#5B7184] transition-colors hover:text-[#075985]">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="mt-10 flex items-center gap-3">
            <Image src="/tiryaqlogonobg.png" alt="Tiryaq" width={512} height={260} className="h-[72px] w-[160px] object-contain dark:brightness-0 dark:invert dark:sepia-[.18] dark:saturate-[2] dark:hue-rotate-[160deg]" />
          </div>
          <h1 className="mt-10 text-3xl font-bold tracking-[-0.06em] text-[#0F2A3D]">Welcome back</h1>
          <p className="mt-2 text-[14px] leading-6 text-[#5B7184]">Choose a demo role to explore the Tiryaq learning platform.</p>

          <form onSubmit={submit} className="mt-7 space-y-5 rounded-3xl border border-[#0369A1]/15 bg-white p-6 shadow-[0_10px_30px_rgba(6,45,70,0.07)] sm:p-7">
            <fieldset>
              <legend className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#5B7184]">Demo account</legend>
              <div className="mt-3 grid gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button key={account.role} type="button" onClick={() => selectAccount(account)} className={`flex items-center justify-between rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] ${role === account.role ? 'border-[#0369A1] bg-[#0369A1]/10' : 'border-[#0369A1]/15 hover:border-[#38BDF8]'}`} aria-pressed={role === account.role}>
                    <span><span className="block text-[13px] font-bold text-[#0F2A3D]">{account.label}</span><span className="mt-0.5 block text-[11px] text-[#5B7184]">{account.description}</span></span>
                    <span className={`h-4 w-4 rounded-full border-4 ${role === account.role ? 'border-[#0369A1] bg-white' : 'border-[#0369A1]/30'}`} aria-hidden />
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block"><span className="text-[12px] font-bold text-[#5B7184]">Email address</span><span className="relative mt-2 block"><Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5B7184]" /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="w-full rounded-xl border border-[#0369A1]/15 py-3 pl-10 pr-3 text-[13px] text-[#0F2A3D] outline-none transition-shadow placeholder:text-[#5B7184] focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/15" /></span></label>
            <label className="block"><span className="text-[12px] font-bold text-[#5B7184]">Password</span><span className="relative mt-2 block"><LockKeyhole size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5B7184]" /><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="w-full rounded-xl border border-[#0369A1]/15 py-3 pl-10 pr-3 text-[13px] text-[#0F2A3D] outline-none transition-shadow focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/15" /></span></label>
            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-600">
                {error}
              </p>
            )}
            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0369A1] px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(14,116,144,0.2)] transition-colors hover:bg-[#075985] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] focus-visible:ring-offset-2">{submitting ? 'Signing in…' : 'Continue to Tiryaq'} <ArrowRight size={16} /></button>
          </form>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#0369A1] to-[#075985] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-36 -top-24 h-[420px] w-[420px] rounded-full bg-[#38BDF8]/30 blur-3xl" />
        <div className="relative max-w-md"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7DD3FC]">Built for clinical momentum</p><h2 className="mt-5 text-5xl font-bold leading-[0.96] tracking-[-0.07em]">Make every study session count.</h2><p className="mt-6 text-[16px] leading-7 text-[#DCEEFC]">Practice cases, review your weak topics, and keep a calm, evidence-based view of your progress.</p></div>
        <div className="relative grid grid-cols-3 gap-3 text-center">{[{ value: '82%', label: 'Cardiology mastery' }, { value: '12', label: 'Day streak' }, { value: '4.8', label: 'Learner rating' }].map((stat) => <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xl font-bold text-[#7DD3FC]">{stat.value}</p><p className="mt-1 text-[10px] leading-4 text-[#DCEEFC]">{stat.label}</p></div>)}</div>
      </aside>
    </main>
  );
}
