import { Check, FileText, Network, Search, Sparkles } from 'lucide-react';

export default function ProjectVisual({
    type,
}: {
    type: 'documents' | 'analytics' | 'agents';
}) {
    return (
        <div
            aria-hidden="true"
            className="relative flex h-60 items-center justify-center overflow-hidden border-b border-white/8 bg-[radial-gradient(ellipse_at_top,#8b5cf615,transparent_70%)] px-6"
        >
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [mask-image:linear-gradient(black,transparent)] bg-size-[18px_18px]" />
            {type === 'documents' && (
                <div className="relative w-full max-w-72 -rotate-3 rounded-xl border border-white/15 bg-[#15141e] p-4 shadow-xl transition-transform duration-500 group-hover:rotate-0 motion-reduce:transition-none">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-[11px] text-zinc-300">
                        <FileText size={14} className="text-violet-300" />{' '}
                        project-notes.pdf{' '}
                        <Check size={12} className="ml-auto text-emerald-300" />
                    </div>
                    <div className="mt-4 ml-7 rounded-lg rounded-tr-none bg-white/7 p-2.5 text-[11px] text-zinc-200">
                        What are the key takeaways?
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Sparkles
                            size={14}
                            className="mt-1 shrink-0 text-violet-300"
                        />
                        <div className="space-y-2 pt-1">
                            <div className="h-1.5 w-40 rounded-full bg-zinc-400/40" />
                            <div className="h-1.5 w-32 rounded-full bg-zinc-400/25" />
                            <span className="inline-block rounded border border-violet-300/20 px-2 py-1 text-[9px] text-violet-200">
                                Source · page 04
                            </span>
                        </div>
                    </div>
                </div>
            )}
            {type === 'analytics' && (
                <div className="relative w-full max-w-72 rounded-xl border border-white/15 bg-[#15141e] p-4 shadow-xl">
                    <p className="flex items-center gap-2 text-[11px] text-zinc-300">
                        <Search size={13} /> How is revenue trending?
                    </p>
                    <div className="mt-5 flex h-24 items-end justify-between gap-3 border-b border-white/10 px-2 pb-1">
                        {[32, 44, 38, 66, 58, 80, 94].map((height, index) => (
                            <div
                                key={index}
                                style={{ height: `${height}%` }}
                                className="flex-1 rounded-t-sm bg-linear-to-t from-violet-500/20 to-violet-300/80 transition-colors group-hover:to-violet-200"
                            />
                        ))}
                    </div>
                    <p className="mt-3 flex items-center justify-between font-mono text-[9px] text-zinc-400">
                        <span>JAN — JUL</span>
                        <span className="flex items-center gap-1 text-emerald-300">
                            <Check size={11} /> Query validated
                        </span>
                    </p>
                </div>
            )}
            {type === 'agents' && (
                <div className="relative flex w-full max-w-72 flex-col items-center">
                    <div className="z-10 flex items-center gap-2 rounded-xl border border-violet-300/30 bg-[#1e192d] px-5 py-3 text-xs text-violet-200">
                        <Network size={16} /> Supervisor
                    </div>
                    <div className="h-6 w-px bg-violet-300/30" />
                    <div className="h-5 w-[70%] rounded-t-lg border-x border-t border-violet-300/30" />
                    <div className="grid w-full grid-cols-3 gap-2">
                        {['Research', 'Build', 'Review'].map((label) => (
                            <div
                                key={label}
                                className="rounded-lg border border-white/15 bg-[#15141e] px-2 py-4 text-center text-[11px] text-zinc-200"
                            >
                                <span className="mx-auto mb-3 block size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#6ee7b74d]" />
                                {label}
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 font-mono text-[9px] tracking-wider text-zinc-400">
                        SHARED CONTEXT · ONE DIRECTION
                    </p>
                </div>
            )}
        </div>
    );
}
