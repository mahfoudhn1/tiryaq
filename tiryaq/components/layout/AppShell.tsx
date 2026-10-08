import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Application chrome for signed-in screens. Session handling lives in
 * `components/auth/AuthGate`, which wraps every page in `app/providers.tsx`.
 */
export function AppShell({ children, title }: AppShellProps) {
  return (
    <div
      className="app-glow flex min-h-screen bg-[#F4F9FD] bg-fixed bg-[radial-gradient(640px_at_18%_-6%,rgba(56,189,248,0.08),transparent_60%),radial-gradient(720px_at_88%_8%,rgba(14,165,233,0.06),transparent_55%)]"
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
