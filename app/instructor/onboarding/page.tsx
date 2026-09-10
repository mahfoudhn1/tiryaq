'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/utils/zodResolver';
import { z } from 'zod';
import { Check, ChevronLeft, ChevronRight, Clock, ShieldCheck, Upload } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

const STEPS = ['Personal', 'Professional', 'Profile', 'Verification', 'Approval'] as const;

const personalSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  country: z.string().min(2, 'Please select your country'),
});

const professionalSchema = z.object({
  specialty: z.string().min(2, 'Please enter your specialty'),
  qualification: z.string().min(2, 'Please enter your highest qualification'),
  institution: z.string().min(2, 'Please enter your institution'),
  yearsExperience: z.string().min(1, 'Please enter years of experience'),
});

const profileSchema = z.object({
  headline: z.string().min(10, 'Headline should be at least 10 characters'),
  bio: z.string().min(50, 'Bio should be at least 50 characters'),
});

type PersonalForm = z.infer<typeof personalSchema>;
type ProfessionalForm = z.infer<typeof professionalSchema>;
type ProfileForm = z.infer<typeof profileSchema>;

export default function InstructorOnboardingPage() {
  const [step, setStep] = useState(0);

  return (
    <AppShell title="Instructor Onboarding">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Become an instructor</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Instructor onboarding</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">Complete these steps to start publishing courses on Tiryaq.</p>
        </div>

        {/* Stepper */}
        <ol className="mb-8 flex items-center gap-1" aria-label="Onboarding progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-1">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-colors',
                    i < step ? 'bg-emerald-500 text-white'
                      : i === step ? 'bg-[#0e7490] text-white'
                      : 'bg-[#e2eaee] text-[#94a3b8]',
                  )}
                  aria-current={i === step ? 'step' : undefined}
                >
                  {i < step ? <Check size={15} /> : i + 1}
                </span>
                <span className={cn('hidden text-[10px] font-semibold sm:block', i === step ? 'text-[#0e7490]' : 'text-[#94a3b8]')}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={cn('h-0.5 flex-1 rounded', i < step ? 'bg-emerald-500' : 'bg-[#e2eaee]')} />
              )}
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-[#dce7eb] bg-white p-6 sm:p-8">
          {step === 0 && <PersonalStep onNext={() => setStep(1)} />}
          {step === 1 && <ProfessionalStep onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <ProfileStep onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <VerificationStep onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {step === 4 && <ApprovalStep />}
        </div>
      </div>
    </AppShell>
  );
}

const inputClass = 'w-full rounded-xl border border-[#dce7eb] bg-[#f8fafc] px-3.5 py-2.5 text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0e7490] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0e7490]/15';
const labelClass = 'mb-1.5 block text-[12px] font-bold text-[#0f172a]';
const errorClass = 'mt-1 text-[11px] font-medium text-red-500';

function PersonalStep({ onNext }: { onNext: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    defaultValues: { fullName: 'Dr. Amine Haddad', email: 'amine.haddad@tiryaq.com', phone: '', country: '' },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <h2 className="mb-1 text-[17px] font-bold text-[#0f172a]">Personal information</h2>
      <p className="mb-6 text-[13px] text-[#64748b]">Tell us who you are. This stays private unless you publish it.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className={labelClass}>Full name</label>
          <input id="fullName" {...register('fullName')} className={inputClass} aria-invalid={!!errors.fullName} />
          {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email address</label>
          <input id="email" type="email" {...register('email')} className={inputClass} aria-invalid={!!errors.email} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone number</label>
          <input id="phone" type="tel" {...register('phone')} placeholder="+213 …" className={inputClass} aria-invalid={!!errors.phone} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="country" className={labelClass}>Country</label>
          <input id="country" {...register('country')} placeholder="Algeria" className={inputClass} aria-invalid={!!errors.country} />
          {errors.country && <p className={errorClass}>{errors.country.message}</p>}
        </div>
      </div>

      <div className="mt-7 flex justify-end">
        <Button type="submit">Continue <ChevronRight size={15} /></Button>
      </div>
    </form>
  );
}

function ProfessionalStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfessionalForm>({
    resolver: zodResolver(professionalSchema),
    defaultValues: { specialty: 'Cardiology', qualification: '', institution: '', yearsExperience: '' },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <h2 className="mb-1 text-[17px] font-bold text-[#0f172a]">Professional background</h2>
      <p className="mb-6 text-[13px] text-[#64748b]">Your clinical credentials help students trust your teaching.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="specialty" className={labelClass}>Specialty</label>
          <input id="specialty" {...register('specialty')} className={inputClass} aria-invalid={!!errors.specialty} />
          {errors.specialty && <p className={errorClass}>{errors.specialty.message}</p>}
        </div>
        <div>
          <label htmlFor="qualification" className={labelClass}>Highest qualification</label>
          <input id="qualification" {...register('qualification')} placeholder="MD, PhD, FRCP…" className={inputClass} aria-invalid={!!errors.qualification} />
          {errors.qualification && <p className={errorClass}>{errors.qualification.message}</p>}
        </div>
        <div>
          <label htmlFor="institution" className={labelClass}>Institution</label>
          <input id="institution" {...register('institution')} placeholder="CHU Mustapha Pacha" className={inputClass} aria-invalid={!!errors.institution} />
          {errors.institution && <p className={errorClass}>{errors.institution.message}</p>}
        </div>
        <div>
          <label htmlFor="yearsExperience" className={labelClass}>Years of experience</label>
          <input id="yearsExperience" type="number" min="0" {...register('yearsExperience')} className={inputClass} aria-invalid={!!errors.yearsExperience} />
          {errors.yearsExperience && <p className={errorClass}>{errors.yearsExperience.message}</p>}
        </div>
      </div>

      <div className="mt-7 flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack}><ChevronLeft size={15} /> Back</Button>
        <Button type="submit">Continue <ChevronRight size={15} /></Button>
      </div>
    </form>
  );
}

function ProfileStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { headline: '', bio: '' },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <h2 className="mb-1 text-[17px] font-bold text-[#0f172a]">Public profile</h2>
      <p className="mb-6 text-[13px] text-[#64748b]">This is what students see on your course pages.</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="headline" className={labelClass}>Headline</label>
          <input id="headline" {...register('headline')} placeholder="Interventional cardiologist & medical educator" className={inputClass} aria-invalid={!!errors.headline} />
          {errors.headline && <p className={errorClass}>{errors.headline.message}</p>}
        </div>
        <div>
          <label htmlFor="bio" className={labelClass}>Biography</label>
          <textarea id="bio" rows={5} {...register('bio')} placeholder="Tell students about your clinical background and teaching style…" className={cn(inputClass, 'resize-none leading-6')} aria-invalid={!!errors.bio} />
          {errors.bio && <p className={errorClass}>{errors.bio.message}</p>}
        </div>
      </div>

      <div className="mt-7 flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack}><ChevronLeft size={15} /> Back</Button>
        <Button type="submit">Continue <ChevronRight size={15} /></Button>
      </div>
    </form>
  );
}

function VerificationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="mb-1 text-[17px] font-bold text-[#0f172a]">Credential verification</h2>
      <p className="mb-6 text-[13px] text-[#64748b]">Upload your medical licence or board certification. Documents are reviewed by our team and never shared publicly.</p>

      <div className="space-y-3">
        {['Medical licence', 'Board certification', 'Government ID'].map((doc) => (
          <div key={doc} className="flex items-center gap-4 rounded-xl border border-dashed border-[#dce7eb] bg-[#f8fafc] p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0e7490]">
              <Upload size={18} />
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#0f172a]">{doc}</p>
              <p className="text-[11px] text-[#64748b]">PDF or JPG, max 10 MB</p>
            </div>
            <button type="button" className="rounded-full border border-[#dce7eb] bg-white px-4 py-2 text-[12px] font-bold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]">
              Choose file
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#a9e2e2] bg-[#e0f7f7] p-4">
        <ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#0e7490]" />
        <p className="text-[12px] leading-5 text-[#164e63]">
          Uploads are encrypted at rest. Verification is a placeholder in this build — no documents are transmitted or stored.
        </p>
      </div>

      <div className="mt-7 flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack}><ChevronLeft size={15} /> Back</Button>
        <Button type="button" onClick={onNext}>Submit application <ChevronRight size={15} /></Button>
      </div>
    </div>
  );
}

function ApprovalStep() {
  return (
    <div className="py-6 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Clock size={28} />
      </span>
      <h2 className="mt-5 text-xl font-bold text-[#0f172a]">Application under review</h2>
      <Badge variant="amber" className="mt-3">Pending approval</Badge>
      <p className="mx-auto mt-4 max-w-sm text-[13px] leading-6 text-[#64748b]">
        Thanks for applying. Our team reviews credentials within 3–5 business days. You&apos;ll receive an email as soon as a decision is made.
      </p>

      <div className="mx-auto mt-7 max-w-sm space-y-2.5 text-left">
        {[
          { label: 'Personal information', done: true },
          { label: 'Professional background', done: true },
          { label: 'Public profile', done: true },
          { label: 'Documents submitted', done: true },
          { label: 'Admin review', done: false },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl bg-[#f8fafc] px-4 py-3">
            <span className={cn('flex h-6 w-6 items-center justify-center rounded-full', s.done ? 'bg-emerald-500 text-white' : 'bg-[#e2eaee] text-[#94a3b8]')}>
              {s.done ? <Check size={13} /> : <Clock size={12} />}
            </span>
            <span className={cn('text-[13px] font-medium', s.done ? 'text-[#0f172a]' : 'text-[#94a3b8]')}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
