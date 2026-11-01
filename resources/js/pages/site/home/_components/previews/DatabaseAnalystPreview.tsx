import PreviewComposer from './PreviewComposer';
import { sendPause } from './preview-timeline';

import { useEffect, useState } from 'react';
import { Check, Database, Sparkles } from 'lucide-react';

const prompt = 'Show revenue by month for Q1 2026.';
const query =
    "SELECT DATE_TRUNC('month', paid_at) AS month,\n       SUM(amount) AS revenue\nFROM payments\nWHERE paid_at >= '2026-01-01'\n  AND paid_at < '2026-04-01'\nGROUP BY 1 ORDER BY 1;";
const typingSpeed = 80;
const draftStart = 800;
const sentAt = draftStart + prompt.length * typingSpeed + sendPause;
const timeline = [
    { text: prompt, user: true, draftStart, start: sentAt, end: sentAt },
];
const queryStart = Math.ceil((sentAt + 2200) / typingSpeed);
const queryEnd = queryStart + query.length;
const cycleLength = queryEnd + Math.ceil(7000 / typingSpeed);
const rows = [
    { month: 'Jan 2026', revenue: '$12,480', width: '62%' },
    { month: 'Feb 2026', revenue: '$16,250', width: '81%' },
    { month: 'Mar 2026', revenue: '$20,100', width: '100%' },
];

export default function DatabaseAnalystPreview() {
    const [position, setPosition] = useState(0);

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
                () => setPosition(motion.matches ? 0 : cycleLength - 1),
                0,
            );
            if (motion.matches) {
                timer = setInterval(
                    () => setPosition((current) => (current + 1) % cycleLength),
                    typingSpeed,
                );
            }
        }
        updateMotion();
        motion.addEventListener('change', updateMotion);
        return () => {
            clearTimeout(reset);
            clearInterval(timer);
            motion.removeEventListener('change', updateMotion);
        };
    }, []);

    const complete = position >= queryEnd;

    return (
        <figure
            aria-label="Illustrative database analysis: a question becomes a validated SQL query and monthly revenue results"
            className="relative mt-3 overflow-hidden rounded-xl border border-cyan-300/10 bg-[#0b0e13]/45 text-left shadow-[0_0_2px_1px_#ffffff26,0_0_26px_3px_#ffffff14,0_0_36px_5px_#00000059,inset_0_0_10px_1px_#ffffff1a]!"
        >
            <figcaption className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-zinc-500">
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f970]"
                    />
                    analyst.sql
                </span>
                <span className="text-[9px] tracking-widest text-zinc-600 uppercase">
                    Preview
                </span>
            </figcaption>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-12 -right-12 size-36 rounded-full bg-cyan-500/5 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="relative min-h-0! flex-1! space-y-2 overflow-y-auto p-3"
            >
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <Database size={13} className="text-cyan-300/70" />
                    <span>analytics / payments</span>
                    <span className="ml-auto rounded border border-white/6 px-1.5 py-0.5 text-[8px] text-zinc-500">
                        READ ONLY
                    </span>
                </div>
                <div
                    className={`ml-5 min-h-9 rounded-xl rounded-tr-sm border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[11px] leading-5 text-zinc-300 ${position * typingSpeed >= sentAt ? 'visible' : 'invisible'}`}
                >
                    {position * typingSpeed >= sentAt ? prompt : ''}
                </div>
                <div className="overflow-hidden rounded-lg border border-white/6 bg-black/15">
                    <div className="flex items-center justify-between border-b border-white/5 px-3 py-1 text-[8px] tracking-wider">
                        <span className="flex items-center gap-1.5 text-cyan-300/80">
                            <Sparkles size={10} />
                            GENERATED SQL
                        </span>
                        <span
                            className={`flex items-center gap-1 text-emerald-300/80 ${complete ? 'visible' : 'invisible'}`}
                        >
                            <Check size={10} />
                            VALIDATED
                        </span>
                    </div>
                    <pre className="h-28 overflow-x-auto px-3 py-2 font-mono text-[9px] leading-4 text-cyan-100/70">
                        <code>
                            {query.slice(0, Math.max(0, position - queryStart))}
                        </code>
                        {position >= queryStart && !complete && (
                            <span className="inline-block h-2.5 w-px animate-pulse bg-cyan-200 align-middle motion-reduce:animate-none" />
                        )}
                    </pre>
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[8px] tracking-wider text-zinc-500">
                        <span>QUERY RESULTS</span>
                        <span
                            className={
                                complete
                                    ? 'visible text-cyan-300/60'
                                    : 'invisible'
                            }
                        >
                            3 ROWS
                        </span>
                    </div>
                    {rows.map(({ month, revenue, width }, index) => (
                        <div
                            key={month}
                            className={`flex items-center gap-3 text-[9px] transition-opacity duration-500 motion-reduce:transition-none ${position >= queryEnd + index * 8 ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <span className="w-14 shrink-0 text-zinc-500">
                                {month}
                            </span>
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/4">
                                <div
                                    style={{ width }}
                                    className="h-full rounded-full bg-linear-to-r from-cyan-500/30 to-cyan-300/70"
                                />
                            </div>
                            <span className="w-14 text-right font-mono text-zinc-300">
                                {revenue}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <PreviewComposer
                timeline={timeline}
                elapsed={position * typingSpeed}
                speed={typingSpeed}
            />
            <p className="sr-only">
                Example question: {prompt} A read-only SQL query groups payments
                by month. Sample results: January $12,480; February $16,250;
                March $20,100. This preview uses illustrative data.
            </p>
        </figure>
    );
}
