#!/usr/bin/env node
/**
 * End-to-end smoke test.
 *
 * Drives the running Next.js app in headless Chrome (via the DevTools
 * Protocol) and checks that it renders real API data on every major route.
 * Fails on uncaught page exceptions, console errors and failed /api/ calls.
 *
 * Usage:
 *   npm run dev                 # in one terminal (with the Django API running)
 *   npm run e2e:smoke           # in another
 *
 * Env:
 *   E2E_BASE_URL         default http://localhost:3000
 *   NEXT_PUBLIC_API_URL  default http://localhost:8000
 *   CHROME_PATH          default /usr/bin/google-chrome
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.env.E2E_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';
const DEBUG_PORT = Number(process.env.E2E_DEBUG_PORT ?? 9222);
const PAGE_TIMEOUT = Number(process.env.E2E_TIMEOUT ?? 30000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = [];
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== undefined) {
        const entry = this.pending.get(message.id);
        if (!entry) return;
        this.pending.delete(message.id);
        if (message.error) entry.reject(new Error(message.error.message));
        else entry.resolve(message.result);
        return;
      }
      for (const listener of this.listeners) listener(message);
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.socket.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  on(listener) {
    this.listeners.push(listener);
  }
}

async function waitForHttp(url, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {
      /* keep polling */
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function launchChrome() {
  const profile = mkdtempSync(join(tmpdir(), 'tiryaq-e2e-'));
  const child = spawn(
    CHROME,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--hide-scrollbars',
      '--mute-audio',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  return { child, profile };
}

function createRecorder(sessionId) {
  const failures = [];
  return {
    failures,
    handle(message) {
      if (message.sessionId && message.sessionId !== sessionId) return;
      const { method, params } = message;

      if (method === 'Runtime.exceptionThrown') {
        const details = params.exceptionDetails;
        failures.push(
          `uncaught exception: ${details.exception?.description ?? details.text ?? 'unknown'}`,
        );
      }

      if (method === 'Runtime.consoleAPICalled' && params.type === 'error') {
        const text = params.args
          .map((arg) => arg.value ?? arg.description ?? arg.type)
          .join(' ');
        if (text) failures.push(`console error: ${text}`);
      }

      if (method === 'Log.entryAdded' && params.entry.level === 'error') {
        failures.push(`log error: ${params.entry.text}`);
      }

      if (method === 'Network.responseReceived') {
        const { url, status } = params.response;
        if (url.includes('/api/') && status >= 400) {
          failures.push(`HTTP ${status} ${url}`);
        }
      }
    },
  };
}

async function main() {
  const results = [];
  const { child, profile } = launchChrome();
  let cdp;

  const stop = async () => {
    try {
      await cdp?.send('Browser.close');
    } catch {
      /* ignore */
    }
    child.kill('SIGKILL');
    rmSync(profile, { recursive: true, force: true });
  };

  try {
    const version = await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    const socket = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });

    cdp = new Cdp(socket);
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

    for (const domain of ['Page', 'Runtime', 'Log', 'Network']) {
      await cdp.send(`${domain}.enable`, {}, sessionId);
    }

    const recorder = createRecorder(sessionId);
    cdp.on((message) => recorder.handle(message));

    const evaluate = async (expression, { awaitPromise = false } = {}) => {
      const result = await cdp.send(
        'Runtime.evaluate',
        { expression, returnByValue: true, awaitPromise },
        sessionId,
      );
      if (result.exceptionDetails) {
        throw new Error(
          result.exceptionDetails.exception?.description ?? result.exceptionDetails.text,
        );
      }
      return result.result.value;
    };

    const waitFor = async (expression, label, timeout = PAGE_TIMEOUT) => {
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
        try {
          if (await evaluate(expression)) return;
        } catch {
          /* page still navigating */
        }
        await sleep(200);
      }
      throw new Error(`Timed out waiting for ${label}`);
    };

    const bodyText = () => evaluate('document.body.innerText');
    const currentPath = () => evaluate('location.pathname');

    const goto = async (path) => {
      await cdp.send('Page.navigate', { url: `${BASE}${path}` }, sessionId);
      await waitFor('document.readyState === "complete"', `load ${path}`);
    };

    // Navigate, then wait for the snippet. innerText reflects CSS
    // text-transform, so the comparison is case-insensitive.
    const expectText = async (path, snippet) => {
      await goto(path);
      await waitFor(
        `document.body.innerText.toLowerCase().includes(${JSON.stringify(snippet.toLowerCase())})`,
        `${path} to render ${JSON.stringify(snippet)}`,
      );
      results.push(`ok   ${path} — shows “${snippet}”`);
    };

    const login = async (label) => {
      await evaluate('window.localStorage.clear()');
      await goto('/login');
      await waitFor(`Boolean(document.querySelector('form button[type="submit"]'))`, 'login form');
      if (label) {
        await evaluate(`(() => {
          const button = [...document.querySelectorAll('form button[type="button"]')]
            .find((element) => element.innerText.includes(${JSON.stringify(label)}));
          if (!button) throw new Error('demo option not found: ' + ${JSON.stringify(label)});
          button.click();
        })()`);
      }
      await evaluate(`document.querySelector('form button[type="submit"]').click()`);
      await waitFor('location.pathname !== "/login"', `redirect after ${label ?? 'student'} login`);
      // The shell restores the session before rendering children.
      await waitFor('Boolean(document.querySelector("aside"))', 'app shell to render');
    };

    // Everything below runs against a live app; on failure report where we were.
    const run = async () => {
    // ── 1. Signed-out behaviour ────────────────────────────────────────────
    await goto('/');
    results.push('ok   / — marketing page loads');

    await goto('/dashboard');
    await waitFor('location.pathname === "/login"', 'redirect to /login when signed out');
    await waitFor(
      'document.body.innerText.includes("Welcome back")',
      'login screen to render',
    );
    results.push('ok   /dashboard — redirects to /login when signed out');

    // ── 2. Student session ─────────────────────────────────────────────────
    await login();
    await expectText('/dashboard', 'Study streak');
    await expectText('/dashboard', 'Reviewed Aortic Dissection Card');
    await expectText('/courses', 'The Cardio Sprint');
    await expectText('/courses', 'ECG Masterclass');
    await expectText('/dashboard', 'Good morning');
    await expectText('/flashcards', 'Cardiology');
    await expectText('/cases', 'Acute Right Lower Quadrant Pain');
    await expectText('/cases', 'in progress');
    await expectText('/analytics', 'Subject mastery');
    await expectText('/qbank/session', 'Question 1');
    await expectText('/live', 'ECG Interpretation');
    await expectText('/settings', 'Profile');

    // Course detail + lesson player
    await goto('/courses/cardiology-sprint');
    await waitFor(
      'document.body.innerText.includes("Course curriculum")',
      'course detail to render',
    );
    results.push('ok   /courses/{slug} — course detail renders');
    // Pick a lesson that is still outstanding so the completion flow runs.
    const pendingLessonId = await evaluate(
      `(async () => {
         const token = localStorage.getItem('tiryaq.accessToken');
         const course = await fetch('${API_BASE}/api/courses/cardiology-sprint/', {
           headers: { Authorization: 'Bearer ' + token },
         }).then((response) => response.json());
         const pending = course.modules.flatMap((module) => module.lessons).find((lesson) => !lesson.completed);
         return pending ? pending.id : null;
       })()`,
      { awaitPromise: true },
    );
    if (!pendingLessonId) throw new Error('no outstanding lesson in the seeded course');

    await goto(`/learn/${pendingLessonId}`);
    await waitFor(
      `document.body.innerText.includes('Mark complete')`,
      'lesson player with an outstanding lesson',
    );
    results.push('ok   /learn/{id} — lesson player renders');

    await evaluate(
      `[...document.querySelectorAll('button')].find((b) => b.innerText.includes('Mark complete')).click()`,
    );
    await waitFor(
      `document.body.innerText.includes('Completed')`,
      'lesson to be marked complete',
    );
    results.push('ok   /learn/{id} — “Mark complete” persists through the API');

    // Review a flashcard through the UI (a real spaced-repetition write).
    await goto('/flashcards/review');
    await waitFor(
      `document.body.innerText.includes('ACTIVE REVIEW SESSION') || document.body.innerText.includes('Clinical Review Complete')`,
      'the flashcard review screen to settle',
    );
    const hasDueCard = await evaluate(
      `document.body.innerText.includes('ACTIVE REVIEW SESSION')`,
    );
    if (!hasDueCard) {
      results.push('skip /flashcards/review — no cards due in this database');
    } else {
      // Flip the card first, then grade it.
      await evaluate(`(() => {
        const reveal = [...document.querySelectorAll('button')].find((element) =>
          element.innerText.includes('Reveal Diagnosis'),
        );
        if (reveal) reveal.click();
      })()`);
      // Labels are uppercased by CSS, so match case-insensitively.
      await waitFor(
        `[...document.querySelectorAll('button')].some((element) => element.innerText.trim().toLowerCase().startsWith('good'))`,
        'the rating buttons',
      );
      await evaluate(`(() => {
        const button = [...document.querySelectorAll('button')].find((element) =>
          element.innerText.trim().toLowerCase().startsWith('good'),
        );
        button.click();
      })()`);
      await waitFor(
        `document.body.innerText.includes('Clinical Review Complete') || document.body.innerText.includes('Card 2 of')`,
        'the next card or the session summary',
      );
      results.push('ok   /flashcards/review — rating a card advances the queue');
    }

    // ── 3. Instructor session ──────────────────────────────────────────────
    await login('Instructor');
    await waitFor('location.pathname === "/instructor"', 'instructor dashboard');
    await expectText('/instructor', 'Welcome back');
    await expectText('/instructor/courses', 'The Cardio Sprint');
    await expectText('/instructor/revenue', 'Total revenue');

    // ── 4. Admin session ───────────────────────────────────────────────────
    await login('Administrator');
    await waitFor('location.pathname === "/admin"', 'admin console');
    await expectText('/admin', 'Admin Console');
    await expectText('/admin/instructors', 'Instructor applications');
    await expectText('/admin/courses', 'Course moderation');

    };

    // ── 5. Verdict ─────────────────────────────────────────────────────────
    let runError;
    try {
      await run();
    } catch (error) {
      runError = error;
      try {
        const [path, text] = [await currentPath(), await bodyText()];
        console.error(`\nWhile failing, the page was at ${path}:`);
        console.error(`  ${text.slice(0, 700).replace(/\s+/g, ' ')}`);
      } catch {
        console.error('\n(no page to inspect — the app may be unreachable)');
      }
    }

    const failures = recorder.failures.filter(
      (failure) => !failure.includes('favicon'),
    );

    console.log(results.map((line) => `  ${line}`).join('\n'));
    if (failures.length) {
      console.error('\nConsole/API errors seen during the run:');
      for (const failure of [...new Set(failures)]) console.error(`  ✗ ${failure}`);
    }

    if (runError) throw runError;
    if (failures.length) throw new Error(`${failures.length} runtime error(s)`);

    console.log('\nAll routes rendered with live API data and no console errors.');
  } finally {
    await stop();
  }
}

main().catch((error) => {
  console.error(`\nE2E smoke test failed: ${error.message}`);
  process.exit(1);
});
