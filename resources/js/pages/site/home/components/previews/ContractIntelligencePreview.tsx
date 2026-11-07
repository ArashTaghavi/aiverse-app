import PreviewComposer from './PreviewComposer';
import { previewText, sendPause } from './preview-timeline';

import { useEffect, useRef, useState } from 'react';
import {
    Check,
    FileText,
    ScanText,
    Sparkles,
    TriangleAlert,
} from 'lucide-react';

const fields = [
    {
        label: 'Parties',
        value: 'Northstar / Harbor Labs',
        source: 'p. 1 · Parties',
    },
    { label: 'Initial term', value: '12 months', source: 'p. 2 · §2.1' },
    { label: 'Renewal', value: 'Automatic · 12 months', source: 'p. 4 · §8.1' },
    {
        label: 'Notice period',
        value: '30 days before term ends',
        source: 'p. 4 · §8.2',
    },
];
const steps = [
    {
        kind: 'question',
        label: 'YOU',
        text: 'Review this scanned agreement. How do we stop it from renewing?',
    },
    {
        kind: 'scan',
        label: 'OCR / VISUAL PARSING',
        text: 'Read the scanned pages and preserve clause numbers, tables, and handwritten annotations.',
    },
    {
        kind: 'extract',
        label: 'STRUCTURED EXTRACTION',
        text: 'Extract the parties, contract term, renewal rules, and required notice period.',
    },
    {
        kind: 'answer',
        label: 'CONTRACT ASSISTANT',
        text: 'The typed renewal clause requires written notice at least 30 days before the term ends. Otherwise, it renews for another 12 months.',
        citation: 'p. 4 · §8.1–8.2',
    },
    {
        kind: 'followup',
        label: 'YOU',
        text: 'There is a handwritten note beside that clause. Does it change the deadline?',
    },
    {
        kind: 'review',
        label: 'VISUAL CROSS-CHECK',
        text: "The margin appears to say '60 days', conflicting with the typed 30-day notice. The note is unclear and its approval is not established.",
        citation: 'p. 4 · Margin beside §8.2',
    },
    {
        kind: 'summary',
        label: 'CONTRACT ASSISTANT',
        text: 'Flag this for human review. Confirm the handwritten change against the signed version before relying on either notice period.',
        citation: 'p. 4 · §8.2 + handwritten note',
    },
] as const;
const typingSpeed = 80;
let nextStart = 800;
const timeline = steps.map((step) => {
    const user = step.kind === 'question' || step.kind === 'followup';
    const draftStart = nextStart;
    const start = user
        ? draftStart + step.text.length * typingSpeed + sendPause
        : draftStart;
    const end = start + (user ? 0 : step.text.length * typingSpeed);
    nextStart = end + (step.kind === 'extract' ? 4000 : 2400);
    return { ...step, user, draftStart, start, end };
});
const completedAt = timeline[timeline.length - 1].end;
const cycleLength = completedAt + 9000;

export default function ContractIntelligencePreview() {
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
            aria-label="Illustrative scanned contract analysis with OCR, extracted terms, page citations, and a handwritten conflict flagged for review"
            className="relative mt-3 overflow-hidden rounded-xl border border-rose-300/10 bg-[#140d11]/45 text-left shadow-[0_0_2px_1px_#ffffff26,0_0_26px_3px_#ffffff14,0_0_36px_5px_#00000059,inset_0_0_10px_1px_#ffffff1a]!"
        >
            <figcaption className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-zinc-500">
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-rose-300 shadow-[0_0_8px_#fda4af70]"
                    />
                    contract.intelligence
                </span>
                <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
                    Preview
                </span>
            </figcaption>
            <div
                aria-hidden="true"
                className="flex items-center gap-2 border-b border-white/5 px-3 py-2 text-[10px] text-zinc-500"
            >
                <FileText size={13} className="shrink-0 text-rose-300/70" />
                <span className="min-w-0 truncate">service-agreement.pdf</span>
                <span className="ml-auto shrink-0 text-rose-300/70">
                    {elapsed >= completedAt
                        ? 'Review required'
                        : 'Scanned PDF · 6 pages'}
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
                className="h-72 [scrollbar-width:thin] [scrollbar-color:#4a303d_transparent] space-y-3 overflow-y-auto overscroll-contain p-3"
            >
                {elapsed < timeline[0].start && (
                    <p className="text-[10px] text-zinc-600">
                        Preparing document analysis...
                    </p>
                )}
                {timeline
                    .filter((step) => elapsed >= step.start)
                    .map((step) => {
                        const typing = elapsed < step.end;
                        const user =
                            step.kind === 'question' ||
                            step.kind === 'followup';
                        const warning =
                            step.kind === 'review' || step.kind === 'summary';
                        const Icon = warning
                            ? TriangleAlert
                            : step.kind === 'scan'
                              ? ScanText
                              : Sparkles;
                        return (
                            <div
                                key={step.kind}
                                className={`rounded-lg border p-2.5 ${user ? 'ml-6 border-white/6 bg-white/3' : warning ? 'border-amber-300/15 bg-amber-300/4' : 'border-rose-300/10 bg-rose-300/3'}`}
                            >
                                <div
                                    className={`mb-1.5 flex items-center gap-1.5 text-[9px] font-medium tracking-wide ${user ? 'text-zinc-500' : warning ? 'text-amber-200/80' : 'text-rose-300/80'}`}
                                >
                                    {!user && <Icon size={12} />}
                                    <span>{step.label}</span>
                                    {!user && !typing && !warning && (
                                        <Check
                                            size={11}
                                            className="ml-auto text-rose-300/60"
                                        />
                                    )}
                                </div>
                                <p className="text-[11px] leading-5 text-zinc-300">
                                    {previewText(step, elapsed, typingSpeed)}
                                    {typing && (
                                        <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-rose-200 align-middle motion-reduce:animate-none" />
                                    )}
                                </p>
                                {step.kind === 'scan' && !typing && (
                                    <div className="mt-2 rounded border border-rose-300/10 bg-black/15 p-2">
                                        <div className="mb-2 flex items-center justify-between font-mono text-[8px] text-zinc-600">
                                            <span>PAGE 4 / EXCERPT</span>
                                            <span>OCR + VISION</span>
                                        </div>
                                        <p className="border-l-2 border-rose-300/40 pl-2 font-mono text-[10px] leading-5 text-zinc-400">
                                            §8.2 — Written notice at least{' '}
                                            <span className="bg-rose-300/10 text-rose-200">
                                                30 days
                                            </span>{' '}
                                            before the current term ends.
                                        </p>
                                        <p className="mt-2 text-right font-serif text-xs text-amber-200/70 italic">
                                            60 days? ↖
                                        </p>
                                        <p className="mt-1 text-right text-[8px] text-zinc-600">
                                            Handwritten margin note
                                        </p>
                                    </div>
                                )}
                                {step.kind === 'extract' && !typing && (
                                    <dl className="mt-2 divide-y divide-white/5 rounded border border-white/6 bg-black/10 px-2">
                                        {fields.map((field) => (
                                            <div
                                                key={field.label}
                                                className="py-1.5"
                                            >
                                                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[10px]">
                                                    <dt className="text-zinc-500">
                                                        {field.label}
                                                    </dt>
                                                    <dd className="text-zinc-300">
                                                        {field.value}
                                                    </dd>
                                                </div>
                                                <p className="mt-0.5 text-[8px] text-rose-200/50">
                                                    {field.source}
                                                    {field.label ===
                                                    'Notice period'
                                                        ? ' · Typed text only'
                                                        : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </dl>
                                )}
                                {'citation' in step && !typing && (
                                    <span className="mt-2 inline-flex items-start gap-1.5 rounded border border-rose-300/10 bg-rose-300/5 px-2 py-1 text-[9px] leading-4 text-rose-200/70">
                                        <FileText
                                            size={10}
                                            className="mt-0.5 shrink-0"
                                        />
                                        <span>{step.citation}</span>
                                    </span>
                                )}
                                {step.kind === 'summary' && !typing && (
                                    <div className="mt-2 flex items-center gap-1.5 border-t border-amber-300/10 pt-2 text-[9px] text-amber-200/80">
                                        <TriangleAlert size={11} />
                                        Ambiguous amendment · Human review
                                        needed
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-white/5 px-3 py-2 text-[9px] text-zinc-600">
                <span>Illustrative contract · Sample terms</span>
                <span className="text-rose-300/60">OCR → Extract → Verify</span>
            </div>
            <PreviewComposer
                timeline={timeline}
                elapsed={elapsed}
                speed={typingSpeed}
            />
            <p className="sr-only">
                This animated preview uses a fictional contract and sample
                terms.{' '}
                {steps
                    .map(
                        (step) =>
                            `${step.label}: ${step.text}${'citation' in step ? ` Source: ${step.citation}.` : ''}`,
                    )
                    .join(' ')}{' '}
                Extracted fields:{' '}
                {fields
                    .map(
                        (field) =>
                            `${field.label}: ${field.value} (${field.source})`,
                    )
                    .join('; ')}
                . The handwritten note conflicts with the typed notice period
                and requires human review.
            </p>
        </figure>
    );
}
