import PreviewComposer from './PreviewComposer';
import { previewText, sendPause } from './PreviewTimeline';

import { useEffect, useRef, useState } from 'react';
import {
    Check,
    FileText,
    GitBranch,
    Network,
    Search,
    ShieldCheck,
    Users,
} from 'lucide-react';

const agents = [
    {
        name: 'Researcher',
        task: 'Collect source-backed findings',
        icon: Search,
        color: 'text-sky-300',
    },
    {
        name: 'Writer',
        task: 'Build the launch brief',
        icon: FileText,
        color: 'text-fuchsia-300',
    },
    {
        name: 'Reviewer',
        task: 'Check evidence and consistency',
        icon: ShieldCheck,
        color: 'text-amber-300',
    },
];
const steps = [
    {
        kind: 'request',
        label: 'YOU',
        text: 'Prepare a launch brief for our AI study app. Include the audience, key message, and a source-checked plan.',
    },
    {
        kind: 'delegate',
        label: 'SUPERVISOR / DELEGATE',
        text: 'Researcher: find audience needs. Writer: outline the brief. Reviewer: prepare an evidence checklist. Share your work in one workspace.',
    },
    {
        kind: 'research',
        label: 'RESEARCHER → SHARED STATE',
        text: 'Sample interviews highlight exam preparation and trustworthy explanations. Findings and source notes are ready for the Writer.',
    },
    {
        kind: 'draft',
        label: 'WRITER → REVIEWER',
        text: 'Draft v1 is ready: position the app as a study companion for exam preparation. The draft also claims it cuts study time by 50%.',
    },
    {
        kind: 'review',
        label: 'REVIEWER → SUPERVISOR',
        text: 'Revision needed. The 50% claim has no supporting source. Keep the audience findings, but remove the unverified promise.',
    },
    {
        kind: 'revise',
        label: 'SUPERVISOR → WRITER',
        text: 'Revise only the unsupported claim. Reuse the shared research and retain the rest of the brief.',
    },
    {
        kind: 'updated',
        label: 'WRITER → SHARED STATE',
        text: 'Draft v2 saved. New message: a source-grounded study companion for exam preparation. The unsupported metric is removed.',
    },
    {
        kind: 'approved',
        label: 'REVIEWER / VERIFIED',
        text: 'Draft v2 matches the sample source notes. Evidence checks passed; the brief is ready for the Supervisor.',
    },
    {
        kind: 'done',
        label: 'SUPERVISOR / FINAL DELIVERY',
        text: 'Launch brief complete: exam-focused students, source-grounded explanations, and a pilot with student feedback. Research, revisions, and review notes are included.',
    },
] as const;
const typingSpeed = 80;
let nextStart = 800;
const timeline = steps.map((step) => {
    const user = step.kind === 'request';
    const draftStart = nextStart;
    const start = user
        ? draftStart + step.text.length * typingSpeed + sendPause
        : draftStart;
    const end = start + (user ? 0 : step.text.length * typingSpeed);
    nextStart = end + (step.kind === 'delegate' ? 4000 : 2400);
    return { ...step, user, draftStart, start, end };
});
const completedAt = timeline[timeline.length - 1].end;
const cycleLength = completedAt + 9000;
const researchAt = timeline.find((step) => step.kind === 'research')!.end;
const draftAt = timeline.find((step) => step.kind === 'draft')!.end;
const reviewAt = timeline.find((step) => step.kind === 'review')!.end;
const revisedAt = timeline.find((step) => step.kind === 'updated')!.end;
const approvedAt = timeline.find((step) => step.kind === 'approved')!.end;

export default function MultiAgentPreview() {
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

    const currentStep = timeline.filter((step) => elapsed >= step.start).at(-1);
    const state = [
        {
            key: 'research',
            value: elapsed >= researchAt ? 'source notes ready' : 'PENDING',
        },
        {
            key: 'brief',
            value:
                elapsed >= revisedAt
                    ? 'v2 · claim corrected'
                    : elapsed >= draftAt
                      ? 'v1 · awaiting review'
                      : 'PENDING',
        },
        {
            key: 'review',
            value:
                elapsed >= approvedAt
                    ? 'passed'
                    : elapsed >= reviewAt
                      ? 'revision requested'
                      : 'PENDING',
        },
    ];

    return (
        <figure
            aria-label="Illustrative multi-agent workspace with supervisor delegation, shared research, reviewer feedback, revision, and final delivery"
            className="relative mt-3 overflow-hidden rounded-xl border border-fuchsia-300/10 bg-[#120d16]/45 text-left shadow-[0_0_2px_1px_#ffffff26,0_0_26px_3px_#ffffff14,0_0_36px_5px_#00000059,inset_0_0_10px_1px_#ffffff1a]!"
        >
            <figcaption className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-zinc-500">
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_8px_#f0abfc70]"
                    />
                    agents.workspace
                </span>
                <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
                    Preview
                </span>
            </figcaption>
            <div
                aria-hidden="true"
                className="flex items-center gap-2 border-b border-white/5 px-3 py-2 text-[10px] text-zinc-500"
            >
                <Network size={13} className="text-fuchsia-300/70" />
                <span>Supervisor + 3 specialists</span>
                <span className="ml-auto text-fuchsia-300/70">
                    {elapsed >= completedAt
                        ? 'Delivered'
                        : currentStep?.kind === 'review' ||
                            currentStep?.kind === 'revise'
                          ? 'Revising'
                          : 'Collaborating'}
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
                className="h-72 [scrollbar-width:thin] [scrollbar-color:#48304e_transparent] space-y-3 overflow-y-auto overscroll-contain p-3"
            >
                {elapsed < timeline[0].start && (
                    <p className="text-[10px] text-zinc-600">
                        Opening a shared workspace...
                    </p>
                )}
                {timeline
                    .filter((step) => elapsed >= step.start)
                    .map((step) => {
                        const typing = elapsed < step.end;
                        const reviewer =
                            step.kind === 'review' || step.kind === 'approved';
                        const researcher = step.kind === 'research';
                        const Icon = reviewer
                            ? ShieldCheck
                            : researcher
                              ? Search
                              : step.kind === 'draft' || step.kind === 'updated'
                                ? FileText
                                : GitBranch;
                        const color = reviewer
                            ? 'text-amber-200/80'
                            : researcher
                              ? 'text-sky-300/80'
                              : 'text-fuchsia-300/80';
                        return (
                            <div
                                key={step.kind}
                                className={`rounded-lg border p-2.5 ${step.kind === 'request' ? 'ml-6 border-white/6 bg-white/3' : reviewer ? 'border-amber-300/15 bg-amber-300/4' : researcher ? 'border-sky-300/10 bg-sky-300/3' : 'border-fuchsia-300/10 bg-fuchsia-300/3'}`}
                            >
                                <div
                                    className={`mb-1.5 flex items-center gap-1.5 text-[9px] font-medium tracking-wide ${step.kind === 'request' ? 'text-zinc-500' : color}`}
                                >
                                    <Icon size={12} className="shrink-0" />
                                    <span>{step.label}</span>
                                    {!typing && step.kind !== 'review' && (
                                        <Check
                                            size={11}
                                            className="ml-auto shrink-0"
                                        />
                                    )}
                                </div>
                                <p className="text-[11px] leading-5 text-zinc-300">
                                    {previewText(step, elapsed, typingSpeed)}
                                    {typing && (
                                        <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-fuchsia-200 align-middle motion-reduce:animate-none" />
                                    )}
                                </p>
                                {step.kind === 'delegate' && !typing && (
                                    <div className="mt-2 space-y-1.5">
                                        {agents.map(
                                            ({
                                                name,
                                                task,
                                                icon: AgentIcon,
                                                color: agentColor,
                                            }) => (
                                                <div
                                                    key={name}
                                                    className="flex items-start gap-2 rounded border border-white/6 bg-black/10 px-2 py-1.5"
                                                >
                                                    <AgentIcon
                                                        size={11}
                                                        className={`mt-0.5 shrink-0 ${agentColor}`}
                                                    />
                                                    <div>
                                                        <p
                                                            className={`text-[10px] ${agentColor}`}
                                                        >
                                                            {name}
                                                        </p>
                                                        <p className="mt-0.5 text-[9px] text-zinc-500">
                                                            {task}
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                                {step.kind === 'research' && !typing && (
                                    <p className="mt-2 rounded border border-sky-300/10 px-2 py-1.5 font-mono text-[9px] text-sky-200/60">
                                        shared/research-notes.md → Writer
                                    </p>
                                )}
                                {step.kind === 'review' && !typing && (
                                    <div className="mt-2 border-l-2 border-amber-300/30 pl-2 text-[10px] leading-5">
                                        <p className="text-rose-300/70 line-through">
                                            Cuts study time by 50%.
                                        </p>
                                        <p className="text-amber-200/70">
                                            Missing evidence → Return to Writer
                                        </p>
                                    </div>
                                )}
                                {step.kind === 'updated' && !typing && (
                                    <p className="mt-2 rounded border border-fuchsia-300/10 px-2 py-1.5 font-mono text-[9px] text-fuchsia-200/60">
                                        shared/launch-brief.md · v1 → v2
                                    </p>
                                )}
                                {step.kind === 'done' && !typing && (
                                    <div className="mt-2 space-y-1">
                                        {[
                                            'research-notes.md',
                                            'launch-brief.md · v2',
                                            'review-checklist.md',
                                        ].map((file) => (
                                            <p
                                                key={file}
                                                className="flex items-center gap-1.5 text-[9px] text-fuchsia-200/60"
                                            >
                                                <FileText size={10} />
                                                {file}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
            <div
                aria-hidden="true"
                className="space-y-1.5 border-t border-white/5 px-3 py-2"
            >
                <p className="flex items-center gap-1.5 text-[8px] tracking-wider text-zinc-600">
                    <Users size={10} />
                    SHARED STATE · SIMULATED
                </p>
                <div className="flex flex-wrap gap-1">
                    {state.map((field) => (
                        <span
                            key={field.key}
                            className="rounded border border-fuchsia-300/8 bg-fuchsia-300/3 px-1.5 py-1 font-mono text-[8px] text-zinc-500"
                        >
                            {field.key}:{' '}
                            <span
                                className={
                                    field.value === 'PENDING'
                                        ? 'text-zinc-600'
                                        : 'text-fuchsia-200/70'
                                }
                            >
                                {field.value}
                            </span>
                        </span>
                    ))}
                </div>
            </div>
            <PreviewComposer
                timeline={timeline}
                elapsed={elapsed}
                speed={typingSpeed}
            />
            <p className="sr-only">
                This is a simulated team using sample research and fictional
                artifacts.{' '}
                {steps.map((step) => `${step.label}: ${step.text}`).join(' ')}{' '}
                Research, draft versions, and review status are shared between
                agents.
            </p>
        </figure>
    );
}
