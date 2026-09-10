'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, Clock, MessageSquare, Mic, MicOff, PhoneOff,
  Radio, SmileIcon, Users, Video as VideoIcon, VideoOff,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getLiveSessions } from '@/lib/api/live';
import { LiveSession } from '@/types/medical';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type TabFilter = 'all' | 'live' | 'upcoming' | 'ended';

const CHAT_MESSAGES = [
  { id: 1, author: 'Sara B.', initials: 'SB', body: 'Can you go back to the STEMI criteria for inferior leads?', time: '10:22' },
  { id: 2, author: 'Omar K.', initials: 'OK', body: 'What about LBBB — does that always mandate cath?', time: '10:23' },
  { id: 3, author: 'Dr. Haddad', initials: 'AH', body: 'Great question Omar — yes by Sgarbossa criteria, check slide 14.', time: '10:24', instructor: true },
  { id: 4, author: 'Fatima A.', initials: 'FA', body: 'Thanks! Very clear explanation on the reciprocal changes.', time: '10:25' },
];

export default function LiveSessionsPage() {
  const [tab, setTab] = useState<TabFilter>('all');
  const [classroomOpen, setClassroomOpen] = useState(false);
  const [activeLiveSession, setActiveLiveSession] = useState<LiveSession | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [chatMsg, setChatMsg] = useState('');

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['live-sessions'],
    queryFn: getLiveSessions,
  });

  const filtered = tab === 'all' ? sessions : sessions.filter((s) => s.status === tab);
  const liveNow = sessions.filter((s) => s.status === 'live').length;

  const handleJoin = (session: LiveSession) => {
    setActiveLiveSession(session);
    setClassroomOpen(true);
  };

  if (classroomOpen && activeLiveSession) {
    return <ClassroomUI session={activeLiveSession} micOn={micOn} videoOn={videoOn} chatMsg={chatMsg} onMic={() => setMicOn(v => !v)} onVideo={() => setVideoOn(v => !v)} onChatMsg={setChatMsg} onLeave={() => setClassroomOpen(false)} />;
  }

  return (
    <AppShell title="Live Classes">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Live learning</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Live Classes</h1>
            <p className="mt-1 text-[14px] text-[#64748b]">Join live sessions or revisit recordings at your own pace.</p>
          </div>
          {liveNow > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[12px] font-bold text-red-600">{liveNow} live now</span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter sessions">
          {(['all', 'live', 'upcoming', 'ended'] as TabFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTab(f)}
              className={cn(
                'rounded-full px-4 py-2 text-[12px] font-semibold capitalize transition-colors',
                tab === f ? 'bg-[#0e7490] text-white' : 'bg-white border border-[#dce7eb] text-[#64748b] hover:border-[#8ecfd3] hover:text-[#0e7490]',
              )}
              aria-pressed={tab === f}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((session) => (
              <div key={session.id} className={cn('rounded-2xl border bg-white p-5 transition-all', session.status === 'live' ? 'border-red-200 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]' : 'border-[#dce7eb]')}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {session.status === 'live' && (
                        <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />LIVE
                        </span>
                      )}
                      {session.status === 'upcoming' && <Badge variant="teal">Upcoming</Badge>}
                      {session.status === 'ended' && (
                        <Badge variant={session.recordingAvailable ? 'blue' : 'slate'}>
                          {session.recordingAvailable ? 'Recording available' : 'Ended'}
                        </Badge>
                      )}
                      <Badge variant="slate">{session.instructor.specialty}</Badge>
                    </div>

                    <h3 className="mt-2 text-[15px] font-bold text-[#0f172a]">{session.title}</h3>
                    <p className="mt-0.5 text-[12px] text-[#64748b]">{session.topic}</p>

                    <div className="mt-3 flex items-center gap-3">
                      <Avatar initials={session.instructor.initials} size="sm" />
                      <span className="text-[12px] font-semibold text-[#0f172a]">{session.instructor.name}</span>
                      <span className="text-[11px] text-[#94a3b8]">{session.course}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-[#64748b]">
                      <span className="flex items-center gap-1"><Calendar size={12} />{formatDateTime(session.scheduledAt)}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{session.duration}</span>
                      <span className="flex items-center gap-1"><Users size={12} />{session.participantCount}{session.status !== 'ended' ? `/${session.maxParticipants}` : ''} participants</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    {session.status === 'live' && (
                      <button
                        onClick={() => handleJoin(session)}
                        className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-red-600"
                      >
                        <Radio size={14} /> Join live
                      </button>
                    )}
                    {session.status === 'upcoming' && (
                      <button className="flex items-center gap-2 rounded-full bg-[#0e7490] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#155e75]">
                        Register
                      </button>
                    )}
                    {session.status === 'ended' && session.recordingAvailable && (
                      <button
                        onClick={() => handleJoin(session)}
                        className="flex items-center gap-2 rounded-full border border-[#dce7eb] bg-white px-4 py-2 text-[13px] font-bold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]"
                      >
                        <VideoIcon size={14} /> Watch recording
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce7eb] bg-white py-16 text-center">
                <VideoIcon size={28} className="text-[#94a3b8]" />
                <p className="mt-3 text-[14px] font-bold text-[#0f172a]">No sessions here</p>
                <p className="mt-1 text-[12px] text-[#64748b]">Check back when an instructor schedules one.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ClassroomUI({ session, micOn, videoOn, chatMsg, onMic, onVideo, onChatMsg, onLeave }: {
  session: LiveSession; micOn: boolean; videoOn: boolean; chatMsg: string;
  onMic: () => void; onVideo: () => void; onChatMsg: (v: string) => void; onLeave: () => void;
}) {
  return (
    <div className="flex h-screen flex-col bg-[#0f172a] text-white">
      {/* Top bar */}
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[14px] font-bold">{session.title}</span>
          <Badge variant="red" className="border-red-500/20 bg-red-500/20 text-red-300">LIVE</Badge>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-slate-400">
          <span className="flex items-center gap-1"><Users size={14} />{session.participantCount} watching</span>
          <span className="flex items-center gap-1"><Clock size={14} />42:17</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center bg-[#1e293b]">
            <div className="flex flex-col items-center gap-4 text-white/30">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-bold">
                {session.instructor.initials}
              </div>
              <p className="text-[13px]">{session.instructor.name}</p>
              <p className="text-[11px] text-white/20">Video stream placeholder — connect Jitsi/WebRTC/Agora via <code className="rounded bg-white/10 px-1 text-[10px]">sessionId</code> prop</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex h-16 items-center justify-center gap-3 border-t border-white/10 bg-[#0f172a]">
            <button onClick={onMic} className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-colors', micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400')} aria-label={micOn ? 'Mute' : 'Unmute'}>
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button onClick={onVideo} className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-colors', videoOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400')} aria-label={videoOn ? 'Stop video' : 'Start video'}>
              {videoOn ? <VideoIcon size={18} /> : <VideoOff size={18} />}
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="React">
              <SmileIcon size={18} />
            </button>
            <button onClick={onLeave} className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-red-700">
              <PhoneOff size={16} /> Leave
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="hidden w-72 flex-col border-l border-white/10 lg:flex">
          {/* Session info */}
          <div className="border-b border-white/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Session info</p>
            <p className="mt-1 text-[13px] font-bold">{session.topic}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{session.instructor.name} · {session.course}</p>
          </div>

          {/* Chat */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-white/10 px-4 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Chat</p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 p-4">
              {CHAT_MESSAGES.map((m) => (
                <div key={m.id} className="flex gap-2">
                  <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold', m.instructor ? 'bg-[#0e7490] text-white' : 'bg-white/10 text-white')}>
                    {m.initials}
                  </span>
                  <div>
                    <p className={cn('text-[10px] font-bold', m.instructor ? 'text-[#67e8f9]' : 'text-slate-300')}>
                      {m.author} <span className="font-normal text-slate-500">{m.time}</span>
                    </p>
                    <p className="text-[11px] leading-4 text-slate-300">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 p-3">
              <form onSubmit={(e) => { e.preventDefault(); onChatMsg(''); }} className="flex gap-2">
                <input
                  type="text"
                  value={chatMsg}
                  onChange={(e) => onChatMsg(e.target.value)}
                  placeholder="Ask a question…"
                  className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-[12px] text-white placeholder:text-slate-500 focus:bg-white/15 focus:outline-none"
                  aria-label="Chat message"
                />
                <button type="submit" className="rounded-lg bg-[#0e7490] p-2 text-white hover:bg-[#155e75]" aria-label="Send">
                  <MessageSquare size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
