import PreviewComposer from './PreviewComposer';
import { previewText, sendPause } from './preview-timeline';

import { useEffect, useRef, useState } from 'react';
import {
    Check,
    CheckCheck,
    CirclePause,
    Database,
    FileText,
    Mail,
    Plug,
    RotateCw,
    ShieldCheck,
    Workflow,
} from 'lucide-react';

const steps = [
    {
        kind: 'request',
        label: 'YOU',
        text: 'Process invoice INV-2048. Check the purchase order and get approval before posting it.',
    },
    {
        kind: 'tools',
        label: 'MCP / CONNECTED TOOLS',
        text: 'Read the invoice from the inbox and match it against the purchase order in accounting.',
    },
    {
        kind: 'validate',
        label: 'VALIDATION',
        text: 'Harbor Labs invoice: $4,800. Vendor and line items match PO-882. No duplicate invoice found.',
    },
    {
        kind: 'approval',
        label: 'WAITING FOR HUMAN APPROVAL',
        text: 'This amount exceeds the $2,000 auto-posting limit. Save a checkpoint and pause for Maya in Finance.',
    },
    {
        kind: 'approved',
        label: 'MAYA / FINANCE APPROVER',
        text: "I've reviewed the invoice and purchase order. Approved to post $4,800. Do not initiate a payment.",
    },
    {
        kind: 'resume',
        label: 'DURABLE EXECUTION / RESUME',
        text: 'Restore run WF-2048 from the approval checkpoint. Keep completed checks and continue with posting.',
    },
    {
        kind: 'retry',
        label: 'RECOVERABLE TOOL FAILURE',
        text: 'Accounting request timed out. Retry with the same idempotency key to avoid creating a duplicate bill.',
    },
    {
        kind: 'done',
        label: 'WORKFLOW COMPLETED',
        text: 'Bill BILL-631 posted once. Confirmation sent to Finance. Approval and tool results saved in the audit log. No payment initiated.',
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
    nextStart = end + (step.kind === 'approval' ? 5000 : 2400);
    return { ...step, user, draftStart, start, end };
});
const completedAt = timeline[timeline.length - 1].end;
const cycleLength = completedAt + 9000;
const approvalAt = timeline.find((step) => step.kind === 'approval')!.start;
const approvedAt = timeline.find((step) => step.kind === 'approved')!.end;
const resumeAt = timeline.find((step) => step.kind === 'resume')!.start;
const retryAt = timeline.find((step) => step.kind === 'retry')!.start;

export default function WorkflowAutomationPreview() {
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

    const status =
        elapsed >= completedAt
            ? 'Completed'
            : elapsed >= retryAt
              ? 'Retrying safely'
              : elapsed >= resumeAt
                ? 'Resuming'
                : elapsed >= approvedAt
                  ? 'Approved'
                  : elapsed >= approvalAt
                    ? 'Awaiting approval'
                    : 'Running';

    return (
        <figure
            aria-label="Illustrative invoice workflow with connected tools, human approval, checkpoint recovery, and an idempotent retry"
            className="relative mt-3 overflow-hidden rounded-xl border border-teal-300/10 bg-[#0b1212]/45 text-left shadow-[0_0_2px_1px_#ffffff26,0_0_26px_3px_#ffffff14,0_0_36px_5px_#00000059,inset_0_0_10px_1px_#ffffff1a]!"
        >
            <figcaption className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-zinc-500">
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_#5eead470]"
                    />
                    workflow.run
                </span>
                <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
                    Preview
                </span>
            </figcaption>
            <div
                aria-hidden="true"
                className="flex items-center gap-2 border-b border-white/5 px-3 py-2 text-[10px] text-zinc-500"
            >
                <Workflow size={13} className="text-teal-300/70" />
                <span>Invoice processing / WF-2048</span>
                <span
                    className={`ml-auto ${status === 'Awaiting approval' || status === 'Retrying safely' ? 'text-amber-300/80' : 'text-teal-300/70'}`}
                >
                    {status}
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
                className="h-72 [scrollbar-width:thin] [scrollbar-color:#2d4744_transparent] space-y-3 overflow-y-auto overscroll-contain p-3"
            >
                {elapsed < timeline[0].start && (
                    <p className="text-[10px] text-zinc-600">
                        Preparing a new workflow run...
                    </p>
                )}
                {timeline
                    .filter((step) => elapsed >= step.start)
                    .map((step) => {
                        const typing = elapsed < step.end;
                        const human = step.kind === 'approved';
                        const waiting =
                            step.kind === 'approval' || step.kind === 'retry';
                        const Icon =
                            step.kind === 'tools'
                                ? Plug
                                : step.kind === 'validate'
                                  ? ShieldCheck
                                  : step.kind === 'approval'
                                    ? CirclePause
                                    : human
                                      ? CheckCheck
                                      : step.kind === 'retry' ||
                                          step.kind === 'resume'
                                        ? RotateCw
                                        : Workflow;
                        return (
                            <div
                                key={step.kind}
                                className={`rounded-lg border p-2.5 ${step.kind === 'request' ? 'ml-6 border-white/6 bg-white/3' : waiting || human ? 'border-amber-300/15 bg-amber-300/4' : 'border-teal-300/10 bg-teal-300/3'}`}
                            >
                                <div
                                    className={`mb-1.5 flex flex-wrap items-center gap-1.5 text-[9px] font-medium tracking-wide ${waiting || human ? 'text-amber-200/80' : step.kind === 'request' ? 'text-zinc-500' : 'text-teal-300/80'}`}
                                >
                                    <Icon size={12} />
                                    <span>{step.label}</span>
                                    {human && (
                                        <span className="rounded border border-amber-300/15 px-1 py-0.5 text-[8px]">
                                            HUMAN
                                        </span>
                                    )}
                                    {!typing && !waiting && (
                                        <Check size={11} className="ml-auto" />
                                    )}
                                </div>
                                <p className="text-[11px] leading-5 text-zinc-300">
                                    {previewText(step, elapsed, typingSpeed)}
                                    {typing && (
                                        <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-teal-200 align-middle motion-reduce:animate-none" />
                                    )}
                                </p>
                                {step.kind === 'tools' && !typing && (
                                    <div className="mt-2 space-y-1.5">
                                        {[
                                            {
                                                icon: Mail,
                                                tool: 'inbox.read_invoice',
                                                detail: 'INV-2048 / Harbor Labs',
                                            },
                                            {
                                                icon: Database,
                                                tool: 'accounting.lookup_po',
                                                detail: 'PO-882 / $4,800',
                                            },
                                        ].map(
                                            ({
                                                icon: ToolIcon,
                                                tool,
                                                detail,
                                            }) => (
                                                <div
                                                    key={tool}
                                                    className="flex items-start gap-2 rounded border border-white/6 bg-black/10 px-2 py-1.5"
                                                >
                                                    <ToolIcon
                                                        size={11}
                                                        className="mt-0.5 text-teal-300/60"
                                                    />
                                                    <div>
                                                        <p className="font-mono text-[9px] text-zinc-400">
                                                            {tool}
                                                        </p>
                                                        <p className="mt-0.5 text-[9px] text-zinc-600">
                                                            {detail}
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                                {step.kind === 'approval' && !typing && (
                                    <div className="mt-2 rounded border border-amber-300/15 p-2">
                                        <p className="flex items-center gap-1.5 text-[9px] text-amber-200/80">
                                            <CirclePause size={11} />
                                            Checkpoint saved · No posting yet
                                        </p>
                                        <dl className="mt-2 grid grid-cols-2 gap-2 text-[9px]">
                                            <div>
                                                <dt className="text-zinc-600">
                                                    Requested action
                                                </dt>
                                                <dd className="mt-0.5 text-zinc-400">
                                                    Post bill · $4,800
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-zinc-600">
                                                    Assigned approver
                                                </dt>
                                                <dd className="mt-0.5 text-zinc-400">
                                                    Maya / Finance
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                )}
                                {step.kind === 'resume' && !typing && (
                                    <div className="mt-2 space-y-1 border-l border-teal-300/20 pl-2 font-mono text-[9px] leading-5 text-teal-200/70">
                                        <p>✓ invoice_verified: true</p>
                                        <p>✓ approval: Maya / approved</p>
                                        <p>→ next_step: accounting.post_bill</p>
                                    </div>
                                )}
                                {step.kind === 'retry' && !typing && (
                                    <p className="mt-2 rounded border border-white/6 bg-black/10 px-2 py-1.5 font-mono text-[9px] break-all text-amber-200/70">
                                        idempotency_key: WF-2048:post-bill
                                    </p>
                                )}
                                {step.kind === 'done' && !typing && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {[
                                            'Human approved',
                                            'Posted once',
                                            'Audit saved',
                                        ].map((label) => (
                                            <span
                                                key={label}
                                                className="inline-flex items-center gap-1 rounded border border-teal-300/10 bg-teal-300/5 px-1.5 py-1 text-[8px] text-teal-200/70"
                                            >
                                                <Check size={9} />
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-white/5 px-3 py-2 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1">
                    <FileText size={10} />
                    Simulated workflow · Sample data
                </span>
                <span className="text-teal-300/60">
                    Check → Approve → Resume
                </span>
            </div>
            <PreviewComposer
                timeline={timeline}
                elapsed={elapsed}
                speed={typingSpeed}
            />
            <p className="sr-only">
                This preview simulates a workflow; no tools are called, messages
                sent, bills posted, or payments made.{' '}
                {steps.map((step) => `${step.label}: ${step.text}`).join(' ')}{' '}
                The simulated human approval precedes posting, and a saved
                checkpoint and idempotency key preserve progress without
                duplicate bills.
            </p>
        </figure>
    );
}
