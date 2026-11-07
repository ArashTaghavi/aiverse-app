import PreviewComposer from './PreviewComposer';
import { previewText, sendPause } from './PreviewTimeline';

import { useEffect, useRef, useState } from 'react';
import {
    Braces,
    Check,
    FileCode2,
    GitBranch,
    Search,
    Sparkles,
} from 'lucide-react';

const files = [
    { path: 'src/auth/login.ts', lines: '12–28', symbol: 'login()' },
    { path: 'src/auth/session.ts', lines: '8–19', symbol: 'createSession()' },
    { path: 'src/middleware.ts', lines: '5–16', symbol: 'requireAuth()' },
];
const steps = [
    {
        kind: 'question',
        label: 'YOU',
        text: 'Where does login happen, and how are protected routes checked?',
    },
    {
        kind: 'index',
        label: 'REPOSITORY INDEX',
        text: 'Parse TypeScript files, extract function definitions, and build a semantic index of the repository.',
    },
    {
        kind: 'search',
        label: 'SEMANTIC SEARCH',
        text: 'Find authentication handlers, session creation, and route guards — even when their names differ from the question.',
    },
    {
        kind: 'trace',
        label: 'AST / CALL REFERENCES',
        text: 'Trace login() to createSession(), then find where requireAuth() reads the session cookie.',
    },
    {
        kind: 'answer',
        label: 'CODEBASE ASSISTANT',
        text: 'login() validates credentials [1] and calls createSession() to set the cookie [2]. requireAuth() checks that session before allowing protected requests [3].',
    },
    {
        kind: 'followup',
        label: 'YOU',
        text: 'Where should I change the session expiration?',
    },
    {
        kind: 'detail',
        label: 'CODEBASE ASSISTANT',
        text: 'Update SESSION_TTL in session.ts [2]. createSession() uses it for both the stored session expiry and cookie maxAge, keeping them consistent.',
    },
] as const;
const code = [
    { number: 8, text: 'const SESSION_TTL = 60 * 60 * 24;', highlight: true },
    { number: 9, text: '', highlight: false },
    {
        number: 10,
        text: 'async function createSession(userId) {',
        highlight: false,
    },
    {
        number: 11,
        text: '  const session = await saveSession({',
        highlight: false,
    },
    { number: 12, text: '    userId, expiresIn: SESSION_TTL', highlight: true },
    { number: 13, text: '  });', highlight: false },
    { number: 14, text: '  setCookie(session.id, {', highlight: false },
    {
        number: 15,
        text: '    maxAge: SESSION_TTL, httpOnly: true',
        highlight: true,
    },
    { number: 16, text: '  });', highlight: false },
    { number: 17, text: '}', highlight: false },
];
const typingSpeed = 80;
let nextStart = 800;
const timeline = steps.map((step) => {
    const user = step.kind === 'question' || step.kind === 'followup';
    const draftStart = nextStart;
    const start = user
        ? draftStart + step.text.length * typingSpeed + sendPause
        : draftStart;
    const end = start + (user ? 0 : step.text.length * typingSpeed);
    nextStart = end + 2400;
    return { ...step, user, draftStart, start, end };
});
const completedAt = timeline[timeline.length - 1].end;
const cycleLength = completedAt + 9000;

export default function CodebaseAssistantPreview() {
    const [elapsed, setElapsed] = useState(0);
    const transcript = useRef<HTMLDivElement>(null);
    const followLatest = useRef(true);

    useEffect(() => {
        const motion = window.matchMedia(
            '(prefers-reduced-motion: no-preference)',
        );
        let timer: ReturnType<typeof setInterval> | undefined;
        let reset: ReturnType<typeof setTimeout> | undefined;
        function updateMotion() {
            clearInterval(timer);
            clearTimeout(reset);
            reset = setTimeout(
                () => setElapsed(motion.matches ? 0 : completedAt),
                0,
            );
            if (motion.matches) {
                let startedAt = performance.now();
                timer = setInterval(() => {
                    const now = performance.now();
                    if (now - startedAt >= cycleLength) startedAt = now;
                    setElapsed(now - startedAt);
                }, typingSpeed);
            }
        }
        updateMotion();
        motion.addEventListener('change', updateMotion);
        return () => {
            clearInterval(timer);
            clearTimeout(reset);
            motion.removeEventListener('change', updateMotion);
        };
    }, []);

    useEffect(() => {
        const container = transcript.current;
        if (!container) return;
        if (elapsed < timeline[0].start) {
            container.scrollTop = 0;
            followLatest.current = true;
        } else if (followLatest.current)
            container.scrollTop = container.scrollHeight;
    }, [elapsed]);

    return (
        <figure
            aria-label="Illustrative codebase assistant exploring authentication in a sample repository, with file and line references"
            className="relative mt-3 overflow-hidden rounded-xl border border-orange-300/10 bg-[#120e0c]/45 text-left shadow-[0_0_2px_1px_#ffffff26,0_0_26px_3px_#ffffff14,0_0_36px_5px_#00000059,inset_0_0_10px_1px_#ffffff1a]!"
        >
            <figcaption className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-zinc-500">
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-orange-300 shadow-[0_0_8px_#fdba7470]"
                    />
                    codebase.assistant
                </span>
                <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
                    Preview
                </span>
            </figcaption>
            <div
                aria-hidden="true"
                className="flex items-center gap-2 border-b border-white/5 px-3 py-2 text-[10px] text-zinc-500"
            >
                <GitBranch size={13} className="text-orange-300/70" />
                <span>sample-app / main</span>
                <span className="ml-auto text-orange-300/70">
                    {elapsed >= completedAt
                        ? 'Answer ready'
                        : 'Exploring repository'}
                </span>
            </div>
            <div
                ref={transcript}
                onScroll={(event) => {
                    const container = event.currentTarget;
                    followLatest.current =
                        container.scrollHeight -
                            container.scrollTop -
                            container.clientHeight <
                        32;
                }}
                aria-hidden="true"
                className="h-72 [scrollbar-width:thin] [scrollbar-color:#4a362d_transparent] space-y-3 overflow-y-auto overscroll-contain p-3"
            >
                {elapsed < timeline[0].start && (
                    <p className="text-[10px] text-zinc-600">
                        Opening repository context...
                    </p>
                )}
                {timeline
                    .filter((step) => elapsed >= step.start)
                    .map((step) => {
                        const typing = elapsed < step.end;
                        const user =
                            step.kind === 'question' ||
                            step.kind === 'followup';
                        const Icon =
                            step.kind === 'search'
                                ? Search
                                : step.kind === 'trace'
                                  ? GitBranch
                                  : step.kind === 'index'
                                    ? Braces
                                    : Sparkles;
                        return (
                            <div
                                key={step.kind}
                                className={`rounded-lg border p-2.5 ${user ? 'ml-6 border-white/6 bg-white/3' : 'border-orange-300/10 bg-orange-300/3'}`}
                            >
                                <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-medium tracking-wide text-orange-300/80">
                                    {!user && <Icon size={12} />}
                                    <span
                                        className={user ? 'text-zinc-500' : ''}
                                    >
                                        {step.label}
                                    </span>
                                    {!user && !typing && (
                                        <Check
                                            size={11}
                                            className="ml-auto text-orange-300/60"
                                        />
                                    )}
                                </div>
                                <p className="text-[11px] leading-5 text-zinc-300">
                                    {previewText(step, elapsed, typingSpeed)}
                                    {typing && (
                                        <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-orange-200 align-middle motion-reduce:animate-none" />
                                    )}
                                </p>
                                {step.kind === 'search' && !typing && (
                                    <div className="mt-2 space-y-1.5">
                                        {files.map((file, index) => (
                                            <div
                                                key={file.path}
                                                className="flex items-start gap-2 rounded border border-white/6 bg-black/10 px-2 py-1.5"
                                            >
                                                <FileCode2
                                                    size={11}
                                                    className="mt-0.5 shrink-0 text-orange-300/60"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-mono text-[9px] break-all text-zinc-400">
                                                        [{index + 1}]{' '}
                                                        {file.path}:{file.lines}
                                                    </p>
                                                    <p className="mt-0.5 text-[9px] text-zinc-600">
                                                        {file.symbol}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {step.kind === 'trace' && !typing && (
                                    <div className="mt-2 space-y-1 border-l border-orange-300/20 pl-2 font-mono text-[9px] leading-5 text-orange-200/70">
                                        <p>
                                            login() → createSession() → cookie
                                        </p>
                                        <p>
                                            request → requireAuth() → session
                                            lookup
                                        </p>
                                    </div>
                                )}
                                {step.kind === 'answer' && !typing && (
                                    <div className="mt-2 space-y-1">
                                        {files.map((file, index) => (
                                            <p
                                                key={file.path}
                                                className="font-mono text-[9px] break-all text-orange-200/60"
                                            >
                                                [{index + 1}] {file.path}:
                                                {file.lines}
                                            </p>
                                        ))}
                                    </div>
                                )}
                                {step.kind === 'detail' && !typing && (
                                    <div className="mt-2 overflow-hidden rounded border border-orange-300/10 bg-black/20">
                                        <p className="border-b border-white/5 px-2 py-1.5 font-mono text-[9px] text-orange-200/70">
                                            [2] src/auth/session.ts:8–17 ·
                                            Excerpt
                                        </p>
                                        <pre className="overflow-x-auto py-2 font-mono text-[9px] leading-4">
                                            <code>
                                                {code.map((line) => (
                                                    <span
                                                        key={line.number}
                                                        className={`block px-2 ${line.highlight ? 'bg-orange-300/8 text-orange-200' : 'text-zinc-500'}`}
                                                    >
                                                        <span className="mr-3 inline-block w-3 text-right text-zinc-600">
                                                            {line.number}
                                                        </span>
                                                        {line.text}
                                                        {'\n'}
                                                    </span>
                                                ))}
                                            </code>
                                        </pre>
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-white/5 px-3 py-2 text-[9px] text-zinc-600">
                <span>Illustrative repository · Sample code</span>
                <span className="text-orange-300/60">
                    {elapsed >= completedAt
                        ? 'Grounded in code'
                        : 'Index → Search → Trace'}
                </span>
            </div>
            <PreviewComposer
                timeline={timeline}
                elapsed={elapsed}
                speed={typingSpeed}
            />
            <p className="sr-only">
                This animated preview uses a fictional repository and
                illustrative code.{' '}
                {steps.map((step) => `${step.label}: ${step.text}`).join(' ')}{' '}
                References:{' '}
                {files
                    .map(
                        (file, index) =>
                            `[${index + 1}] ${file.path}, lines ${file.lines}`,
                    )
                    .join('; ')}
                . Sample excerpt: {code.map((line) => line.text).join(' ')}
            </p>
        </figure>
    );
}
