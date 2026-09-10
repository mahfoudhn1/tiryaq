"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClinicalCase } from '@/services/studyService';
import { ClinicalCase } from '@/types/medical';
import { AppShell } from "@/components/layout/AppShell";


export default function ClinicalCasePage({ params }: { params: { id: string } }) {
  const [caseData, setCaseData] = useState<ClinicalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'physical' | 'labs' | 'diagnosis'>('physical');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadCase() {
      try {
        const data = await getClinicalCase(params.id);
        if (!mounted) return;
        setCaseData(data);
        if (data?.differentialDiagnosis?.length) {
          setSelectedDiagnosis(data.differentialDiagnosis[0].id);
        }
      } catch (error) {
        console.error('Failed to load clinical case:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCase();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  const selectedDiagnosisObj = caseData?.differentialDiagnosis.find(dd => dd.id === selectedDiagnosis) || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] font-sans animate-pulse">
        <header className="bg-[#0B192C] h-16 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-700 rounded" />
            <div className="h-8 w-8 bg-gray-700 rounded-full" />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded-xl mb-6" />
              <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-xl" />
              <div className="h-48 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] font-sans flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0B192C]">Clinical Case Not Found</h1>
          <p className="text-[#64748B] mt-2">The requested clinical case could not be loaded.</p>
          <Link href="/dashboard" className="text-[#3B82F6] hover:underline mt-4 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <AppShell title="Clinical Case">
    <div className="min-h-screen bg-[#F4F7FB] text-[#334155] font-sans flex flex-col">
    

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">{caseData.title}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="text-[#64748B]">Case ID: {caseData.id}</span>
              <span className="text-[#64748B]">Subject: Clinical Reasoning</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#0B192C] transition-colors">
              <span>← Back to Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/60 mb-6 shadow-sm">
          <div className="flex flex-wrap border-b border-gray-200/60">
            {(['physical', 'labs', 'diagnosis'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold transition-colors ${activeTab === tab
                  ? 'text-[#3B82F6] border-b-2 border-[#3B82F6] bg-[#EAF2FF]/30'
                  : 'text-[#64748B] hover:text-[#0B192C] hover:bg-gray-50'}`}
              >
                {tab === 'physical' ? 'Physical Exam' : tab === 'labs' ? 'Laboratory Results' : 'Differential Diagnosis'}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="text-center py-4">Loading case details...</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'physical' && (
              <section className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#0B192C] mb-4">Presenting Complaint</h2>
                <p className="text-[#334155] leading-relaxed mb-6">{caseData.presentingComplaint}</p>

                <h2 className="text-xl font-bold text-[#0B192C] mb-4">History of Present Illness</h2>
                <p className="text-[#334155] leading-relaxed mb-6">{caseData.historyOfPresentIllness}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-2">Past Medical History</h3>
                    <p className="text-sm text-[#334155] leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{caseData.pastMedicalHistory}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-2">Physical Examination</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-[#64748B] font-medium">General:</span>
                        <span className="text-[#334155] font-semibold text-right max-w-xs">{caseData.physicalExam.general}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-[#64748B] font-medium">Vitals:</span>
                        <span className="text-[#334155] font-semibold text-right max-w-xs">{caseData.physicalExam.vitals}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-[#64748B] font-medium">Abdomen:</span>
                        <span className="text-[#334155] font-semibold text-right max-w-xs">{caseData.physicalExam.abdomen}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'labs' && (
              <section className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#0B192C] mb-4">Laboratory Investigations</h2>
                <div className="overflow-hidden rounded-xl border border-gray-200/60">
                  <div className="grid grid-cols-4 bg-gray-50 p-4 border-b border-gray-200/60 text-sm font-bold text-[#64748B] uppercase tracking-wider">
                    <div className="col-span-1">Test</div>
                    <div className="col-span-1">Result</div>
                    <div className="col-span-1">Reference Range</div>
                    <div className="col-span-1">Status</div>
                  </div>
                  {caseData.labs.map((lab, index) => (
                    <div key={`lab-${index}`} className={`grid grid-cols-4 p-4 border-b border-gray-100 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <div className="col-span-1 font-medium text-[#0B192C]">{lab.name}</div>
                      <div className="col-span-1 text-[#334155] font-semibold">{lab.value}</div>
                      <div className="col-span-1 text-sm text-[#64748B]">{lab.referenceRange}</div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${lab.status === 'Normal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {lab.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'diagnosis' && (
              <section className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#0B192C] mb-4">Differential Diagnosis</h2>
                <p className="text-sm text-[#64748B] mb-6 leading-relaxed">Review each potential diagnosis and select the most likely based on the presenting complaint, history, physical examination, and laboratory findings.</p>

                <div className="space-y-4">
                  {caseData.differentialDiagnosis.map((diagnosis) => (
                    <div key={diagnosis.id} onClick={() => setSelectedDiagnosis(diagnosis.id)} className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedDiagnosis === diagnosis.id ? (diagnosis.correct ? 'border-emerald-500 bg-emerald-50/50' : 'border-red-500 bg-red-50/50') : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'} ${diagnosis.correct ? 'ring-2 ring-emerald-200' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-bold text-[#0B192C]">{diagnosis.diagnosis}</h3>
                            {diagnosis.correct && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">✓ Correct</span>}
                          </div>
                          <p className="text-sm text-[#334155] leading-relaxed mt-2">{diagnosis.feedback}</p>
                        </div>
                        <div className="ml-4 mt-1">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedDiagnosis === diagnosis.id ? 'border-current bg-current' : 'border-gray-300'}`}>
                            {selectedDiagnosis === diagnosis.id && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-[#F4F7FB] rounded-xl border border-gray-200/60">
                  <h3 className="text-lg font-bold text-[#0B192C] mb-2">Case Discussion</h3>
                  <p className="text-sm text-[#334155] leading-relaxed">{caseData.discussion}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200/60">
                    <h4 className="text-sm font-bold text-[#0B192C] mb-2">Final Diagnosis:</h4>
                    <p className="text-base font-semibold text-emerald-700">✅ {caseData.finalDiagnosis}</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0B192C] mb-4">Case Performance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-[#64748B]">Your Diagnosis</span>
                  {selectedDiagnosisObj ? (
                    <span className={`font-bold ${selectedDiagnosisObj.correct ? 'text-emerald-600' : 'text-red-600'}`}>{selectedDiagnosisObj.correct ? '✓ Correct' : '✗ Incorrect'}</span>
                  ) : (
                    <span className="text-sm text-[#64748B] font-medium">Not Selected</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-[#64748B]">High-Yield Rating</span>
                  <span className="text-sm font-semibold text-[#0B192C]">{caseData.differentialDiagnosis.filter(dd => dd.diagnosis === caseData.finalDiagnosis).length > 0 ? 'High-Yield' : 'Standard'}</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-[#64748B]">Subject</span>
                  <span className="text-sm font-semibold text-[#0B192C]">Clinical Reasoning</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0B192C] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 rounded-lg font-medium transition-colors">Mark as Completed</button>
                <Link href="/dashboard" className="w-full bg-white border border-gray-300 text-[#334155] hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors text-center block">Return to Dashboard</Link>
                <button className="w-full bg-white border border-gray-300 text-[#334155] hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors">Share with Class</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
    </AppShell>
  );
}
