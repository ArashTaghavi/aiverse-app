import PreviewComposer from './PreviewComposer';
import { previewText, sendPause } from './PreviewTimeline';

import { useEffect, useRef, useState } from 'react';
import { Check, Headset, Sparkles, UserRound } from 'lucide-react';

const typingSpeed = 80;
const readingPause = 2200;
const conversation = [
    { role: 'customer', text: 'My order arrived damaged. Can you help?' },
    {
        role: 'ai',
        text: "I'm sorry about that. You can request a replacement through the returns page.",
    },
    {
        role: 'customer',
        text: "I already tried that. It didn't work, and I need this resolved today.",
    },
    {
        role: 'ai',
        text: 'I understand. Let me connect you with a human agent who can review your case directly.',
    },
    { role: 'handoff', text: 'Jamie joined. Conversation context shared.' },
    {
        role: 'human',
        text: "Hi, I'm Jamie. I've reviewed your case and approved an express replacement. Your confirmation is on its way.",
    },
    {
        role: 'customer',
        text: "That's exactly what I needed. Thank you, Jamie!",
    },
] as const;

let nextStart = 800;
const timeline = conversation.map((message) => {
    const user = message.role === 'customer';
    const draftStart = nextStart;
    const start = user
        ? draftStart + message.text.length * typingSpeed + sendPause
        : draftStart;
    const end =
        start +
        (user || message.role === 'handoff'
            ? 0
            : message.text.length * typingSpeed);
    nextStart = end + readingPause;
    return { ...message, user, draftStart, start, end };
});
const humanStart = timeline.find(
    (message) => message.role === 'handoff',
)!.start;
const resolvedAt = timeline[timeline.length - 1].end;
const cycleLength = resolvedAt + 7000;

export default function CustomerSupportPreview() {
    const [elapsed, setElapsed] = useState(0);
    const transcript = useRef<HTMLDivElement>(null);

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
                () => setElapsed(motion.matches ? 0 : resolvedAt),
                0,
            );
            if (motion.matches) {
                let startedAt = performance.now();
                timer = setInterval(() => {
                    const now = performance.now();
                    if (now - startedAt >= cycleLength) startedAt = now;
                    setElapsed(now - startedAt);
                }, 80);
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
        if (container)
            container.scrollTop =
                elapsed < timeline[0].start ? 0 : container.scrollHeight;
    }, [elapsed]);

    return (
        <figure
            aria-label="Example support conversation: AI assistance, customer escalation, human intervention, and resolution"
            className="relative mt-3 overflow-hidden rounded-xl border border-emerald-300/10 bg-[#0b110f]/45 text-left shadow-[0_0_2px_1px_#ffffff26,0_0_26px_3px_#ffffff14,0_0_36px_5px_#00000059,inset_0_0_10px_1px_#ffffff1a]!"
        >
            <figcaption className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-zinc-500">
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#6ee7b770]"
                    />
                    support.chat
                </span>
                <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
                    Preview
                </span>
            </figcaption>
            <div
                aria-hidden="true"
                className="flex items-center gap-2 border-b border-white/5 px-3 py-2 text-[10px] text-zinc-500"
            >
                <Headset size={13} className="text-emerald-300/70" />
                <span>Customer care</span>
                <span
                    className={`ml-auto ${elapsed >= humanStart ? 'text-amber-300/80' : 'text-emerald-300/70'}`}
                >
                    {elapsed >= resolvedAt
                        ? 'Resolved by human agent'
                        : elapsed >= humanStart
                          ? 'Human agent connected'
                          : 'AI assistant'}
                </span>
            </div>
            <div
                ref={transcript}
                aria-hidden="true"
                className="h-72 [scrollbar-width:thin] [scrollbar-color:#334139_transparent] space-y-3 overflow-y-auto overscroll-contain p-3"
            >
                {elapsed < timeline[0].start && (
                    <p className="text-[10px] text-zinc-600">
                        Starting conversation...
                    </p>
                )}
                {timeline
                    .filter((message) => elapsed >= message.start)
                    .map((message, index) => {
                        const typing = elapsed < message.end;
                        const text =
                            message.role === 'handoff'
                                ? message.text
                                : previewText(message, elapsed, typingSpeed);
                        if (message.role === 'handoff')
                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-center gap-1.5 border-y border-amber-300/10 py-2 text-[9px] text-amber-200/70"
                                >
                                    <Headset size={11} />
                                    {text}
                                </div>
                            );
                        const human = message.role === 'human';
                        const customer = message.role === 'customer';
                        return (
                            <div
                                key={index}
                                className={`flex items-start gap-2 ${customer ? 'ml-6 flex-row-reverse' : 'mr-3'}`}
                            >
                                <span
                                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border ${customer ? 'border-white/8 bg-white/4 text-zinc-400' : human ? 'border-amber-300/20 bg-amber-300/10 text-amber-200' : 'border-emerald-300/15 bg-emerald-300/5 text-emerald-300'}`}
                                >
                                    {customer ? (
                                        <UserRound size={12} />
                                    ) : human ? (
                                        <span className="text-[8px]">JD</span>
                                    ) : (
                                        <Sparkles size={12} />
                                    )}
                                </span>
                                <div
                                    className={`min-w-0 flex-1 rounded-lg border px-2.5 py-2 ${customer ? 'rounded-tr-sm border-white/6 bg-white/3' : human ? 'rounded-tl-sm border-amber-300/15 bg-amber-300/5' : 'rounded-tl-sm border-emerald-300/10 bg-emerald-300/3'}`}
                                >
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <span
                                            className={`text-[9px] font-medium tracking-wide ${human ? 'text-amber-200' : customer ? 'text-zinc-500' : 'text-emerald-300/80'}`}
                                        >
                                            {customer
                                                ? 'CUSTOMER'
                                                : human
                                                  ? 'JAMIE'
                                                  : 'AI ASSISTANT'}
                                        </span>
                                        {human && (
                                            <span className="rounded border border-amber-300/15 px-1 py-0.5 text-[8px] text-amber-300/80">
                                                HUMAN AGENT
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] leading-5 text-zinc-300">
                                        {text}
                                        {typing && (
                                            <span
                                                className={`ml-0.5 inline-block h-3 w-px animate-pulse align-middle motion-reduce:animate-none ${human ? 'bg-amber-200' : 'bg-emerald-200'}`}
                                            />
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                {elapsed >= resolvedAt && (
                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-emerald-300/80">
                        <Check size={12} />
                        Customer confirmed · Resolved with human assistance
                    </div>
                )}
            </div>
            <PreviewComposer
                timeline={timeline}
                elapsed={elapsed}
                speed={typingSpeed}
            />
            <p className="sr-only">
                Illustrative conversation.{' '}
                {conversation
                    .map(
                        (message) =>
                            `${message.role === 'human' ? 'Jamie, human agent' : message.role}: ${message.text}`,
                    )
                    .join(' ')}{' '}
                The customer confirms the issue is resolved.
            </p>
        </figure>
    );
}
