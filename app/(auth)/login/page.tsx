'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, HeartPulse, LockKeyhole, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { setUser, MOCK_USERS } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import type { UserRole } from '@/types/medical';

const DEMO_ACCOUNTS: { role: UserRole; label: string; description: string; email: string }[] = [
  { role: 'STUDENT', label: 'Student', description: 'Sara Benali · MS-V', email: 'sara.benali@tiryaq.com' },
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

  const selectAccount = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setRole(account.role);
    setEmail(account.email);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const account = DEMO_ACCOUNTS.find((item) => item.role === role)!;
    dispatch(setUser(MOCK_USERS[role.toLowerCase() as 'student' | 'instructor' | 'admin']));
    router.push(destinations[account.role]);
  };

  return (
    <main className="grid min-h-screen bg-[#f5f9fa] lg:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-bold text-[#64748b] transition-colors hover:text-[#0e7490]">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="mt-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#0f172a] text-white"><HeartPulse size={22} /></span>
            <div><p className="text-[22px] font-bold tracking-[-0.05em] text-[#0f172a]">tiryaq</p><p className="text-[9px] font-bold tracking-[0.15em] text-[#0e7490]">CLINICAL LEARNING</p></div>
          </div>
          <h1 className="mt-10 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Welcome back</h1>
          <p className="mt-2 text-[14px] leading-6 text-[#64748b]">Choose a demo role to explore the Tiryaq learning platform.</p>

          <form onSubmit={submit} className="mt-7 space-y-5 rounded-3xl border border-[#dce7eb] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-7">
            <fieldset>
              <legend className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#64748b]">Demo account</legend>
              <div className="mt-3 grid gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button key={account.role} type="button" onClick={() => selectAccount(account)} className={`flex items-center justify-between rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] ${role === account.role ? 'border-[#0e7490] bg-[#f0fdfd]' : 'border-[#dce7eb] hover:border-[#8ecfd3]'}`} aria-pressed={role === account.role}>
                    <span><span className="block text-[13px] font-bold text-[#0f172a]">{account.label}</span><span className="mt-0.5 block text-[11px] text-[#64748b]">{account.description}</span></span>
                    <span className={`h-4 w-4 rounded-full border-4 ${role === account.role ? 'border-[#0e7490] bg-white' : 'border-[#cbd5e1]'}`} aria-hidden />
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block"><span className="text-[12px] font-bold text-[#334155]">Email address</span><span className="relative mt-2 block"><Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="w-full rounded-xl border border-[#dce7eb] py-3 pl-10 pr-3 text-[13px] text-[#0f172a] outline-none transition-shadow placeholder:text-[#94a3b8] focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15" /></span></label>
            <label className="block"><span className="text-[12px] font-bold text-[#334155]">Password</span><span className="relative mt-2 block"><LockKeyhole size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" /><input type="password" defaultValue="password" required className="w-full rounded-xl border border-[#dce7eb] py-3 pl-10 pr-3 text-[13px] text-[#0f172a] outline-none transition-shadow focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15" /></span></label>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0e7490] px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(14,116,144,0.2)] transition-colors hover:bg-[#155e75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] focus-visible:ring-offset-2">Continue to Tiryaq <ArrowRight size={16} /></button>
          </form>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-[#0f172a] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-36 -top-24 h-[420px] w-[420px] rounded-full bg-[#0e7490]/30 blur-3xl" />
        <div className="relative max-w-md"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8ed7d7]">Built for clinical momentum</p><h2 className="mt-5 text-5xl font-bold leading-[0.96] tracking-[-0.07em]">Make every study session count.</h2><p className="mt-6 text-[16px] leading-7 text-[#b9c7d7]">Practice cases, review your weak topics, and keep a calm, evidence-based view of your progress.</p></div>
        <div className="relative grid grid-cols-3 gap-3 text-center">{[{ value: '82%', label: 'Cardiology mastery' }, { value: '12', label: 'Day streak' }, { value: '4.8', label: 'Learner rating' }].map((stat) => <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xl font-bold text-[#8ed7d7]">{stat.value}</p><p className="mt-1 text-[10px] leading-4 text-[#b9c7d7]">{stat.label}</p></div>)}</div>
      </aside>
    </main>
  );
}
