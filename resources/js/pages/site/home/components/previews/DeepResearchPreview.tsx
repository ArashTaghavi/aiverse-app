import PreviewComposer from './PreviewComposer';
import { previewText, sendPause } from './PreviewTimeline';

import { useEffect, useRef, useState } from 'react';
import {
    Check,
    FileText,
    Globe,
    ListChecks,
    Search,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

const sources = [
    {
        id: 1,
        title: 'City energy demand study',
        topic: 'Hourly demand & generation',
    },
    {
        id: 2,
        title: 'Renewable grid scenarios',
        topic: 'Storage & grid reliability',
    },
    {
        id: 3,
        title: 'Battery cost comparison',
        topic: 'Installed cost assumptions',
    },
];

const steps = [
    {
        kind: 'question',
        label: 'RESEARCH QUESTION',
        icon: Search,
        text: 'Could a city run entirely on renewable energy?',
    },
    {
        kind: 'plan',
        label: '01 / PLANNING',
        icon: ListChecks,
        text: 'Break this into three questions: energy supply, storage needs, and total cost.',
    },
    {
        kind: 'search',
        label: '02 / SEARCHING',
        icon: Globe,
        text: 'Compare city demand with renewable generation and storage scenarios.',
    },
    {
        kind: 'verify',
        label: '03 / CROSS-CHECKING',
        icon: ShieldCheck,
        text: 'Cost estimates differ. Checking assumptions: does each estimate include installation and grid upgrades?',
    },
    {
        kind: 'deeper',
        label: '04 / GOING DEEPER',
        icon: Search,
        text: 'Search again: installed battery costs, storage duration, and backup during low-wind periods.',
    },
    {
        kind: 'report',
        label: '05 / RESEARCH BRIEF',
        icon: FileText,
        text: 'Potentially, with the right generation mix [1] and sufficient storage [2]. Feasibility depends on local demand and weather. Cost comparisons need matching assumptions [3].',
    },
] as const;

const typingSpeed = 80;
let nextStart = 800;
const timeline = steps.map((step) => {
    const user = step.kind === 'question';
    const draftStart = nextStart;
    const start = user
        ? draftStart + step.text.length * typingSpeed + sendPause
        : draftStart;
    const end = start + (user ? 0 : step.text.length * typingSpeed);
    nextStart = end + (step.kind === 'search' ? 4000 : 2200);
    return { ...step, user, draftStart, start, end };
});
const completedAt = timeline[timeline.length - 1].end;
const cycleLength = completedAt + 9000;

export default function DeepResearchPreview() {
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
        } else if (followLatest.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, [elapsed]);

    const activeStep = timeline.filter((step) => elapsed >= step.start).at(-1);
    const complete = elapsed >= completedAt;

    return (
        <figure
            aria-label="Illustrative research agent: planning, searching sample sources, comparing evidence, refining the search, and writing a cited brief"
            className="relative mt-3 overflow-hidden rounded-xl border border-blue-300/10 bg-[#0b0e16]/45 text-left shadow-[0_0_2px_1px_#ffffff26,0_0_26px_3px_#ffffff14,0_0_36px_5px_#00000059,inset_0_0_10px_1px_#ffffff1a]!"
        >
            <figcaption className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-zinc-500">
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_#93c5fd70]"
                    />
                    research.agent
                </span>
                <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
                    Preview
                </span>
            </figcaption>
            <div
                aria-hidden="true"
                className="flex items-center gap-2 border-b border-white/5 px-3 py-2 text-[10px] text-zinc-500"
            >
                <Sparkles size={13} className="text-blue-300/70" />
                <span>Deep research</span>
                <span className="ml-auto text-blue-300/70">
                    {complete
                        ? 'Brief ready'
                        : activeStep && activeStep.kind !== 'question'
                          ? activeStep.label.slice(5)
                          : 'Preparing'}
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
                className="h-72 [scrollbar-width:thin] [scrollbar-color:#303c55_transparent] space-y-3 overflow-y-auto overscroll-contain p-3"
            >
                {elapsed < timeline[0].start && (
                    <p className="text-[10px] text-zinc-600">
                        Starting a new investigation...
                    </p>
                )}
                {timeline
                    .filter((step) => elapsed >= step.start)
                    .map((step) => {
                        const typing = elapsed < step.end;
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.kind}
                                className={`rounded-lg border p-2.5 ${step.kind === 'question' ? 'ml-6 border-white/6 bg-white/3' : step.kind === 'verify' ? 'border-amber-300/15 bg-amber-300/4' : 'border-blue-300/10 bg-blue-300/3'}`}
                            >
                                <div
                                    className={`mb-1.5 flex items-center gap-1.5 text-[9px] font-medium tracking-wide ${step.kind === 'verify' ? 'text-amber-200/80' : 'text-blue-300/80'}`}
                                >
                                    <Icon size={12} />
                                    <span>{step.label}</span>
                                    {!typing && (
                                        <Check
                                            size={11}
                                            className="ml-auto text-blue-300/60"
                                        />
                                    )}
                                </div>
                                <p className="text-[11px] leading-5 text-zinc-300">
                                    {previewText(step, elapsed, typingSpeed)}
                                    {typing && (
                                        <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-blue-200 align-middle motion-reduce:animate-none" />
                                    )}
                                </p>
                                {step.kind === 'search' && !typing && (
                                    <div className="mt-2 space-y-1.5">
                                        {sources.slice(0, 2).map((source) => (
                                            <div
                                                key={source.id}
                                                className="flex items-start gap-2 rounded border border-white/6 bg-black/10 px-2 py-1.5"
                                            >
                                                <Globe
                                                    size={11}
                                                    className="mt-0.5 shrink-0 text-blue-300/60"
                                                />
                                                <div>
                                                    <p className="text-[10px] text-zinc-400">
                                                        [{source.id}]{' '}
                                                        {source.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[9px] text-zinc-600">
                                                        {source.topic} · Sample
                                                        source
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {step.kind === 'deeper' && !typing && (
                                    <div className="mt-2 flex items-start gap-2 rounded border border-blue-300/10 px-2 py-1.5">
                                        <Globe
                                            size={11}
                                            className="mt-0.5 shrink-0 text-blue-300/60"
                                        />
                                        <div>
                                            <p className="text-[10px] text-zinc-400">
                                                [3] {sources[2].title}
                                            </p>
                                            <p className="mt-0.5 text-[9px] text-blue-300/60">
                                                Follow-up search · Sample source
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {step.kind === 'report' && !typing && (
                                    <>
                                        <p className="mt-2 border-t border-white/6 pt-2 text-[10px] leading-5 text-amber-200/70">
                                            Open question: local grid and
                                            long-duration storage costs still
                                            need verification.
                                        </p>
                                        <div className="mt-2 space-y-1">
                                            {sources.map((source) => (
                                                <p
                                                    key={source.id}
                                                    className="text-[9px] text-blue-200/60"
                                                >
                                                    [{source.id}] {source.title}
                                                </p>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-white/5 px-3 py-2 text-[9px] text-zinc-600">
                <span>Illustrative research · Sample sources</span>
                <span className="text-blue-300/60">
                    {complete ? '5 / 5 steps' : 'Plan → Search → Verify'}
                </span>
            </div>
            <PreviewComposer
                timeline={timeline}
                elapsed={elapsed}
                speed={typingSpeed}
            />
            <p className="sr-only">
                This is an animated demonstration using sample sources, not live
                research.{' '}
                {steps.map((step) => `${step.label}: ${step.text}`).join(' ')}{' '}
                Sample citations:{' '}
                {sources
                    .map((source) => `[${source.id}] ${source.title}`)
                    .join('; ')}
                . Local grid and long-duration storage costs remain unverified.
            </p>
        </figure>
    );
}
