import { ArrowUp, Paperclip } from 'lucide-react';
import { previewDraft, type PreviewMessage } from './PreviewTimeline';

export default function PreviewComposer({
    timeline,
    elapsed,
    speed,
}: {
    timeline: readonly PreviewMessage[];
    elapsed: number;
    speed: number;
}) {
    const { text, sending } = previewDraft(timeline, elapsed, speed);
    return (
        <div
            aria-hidden="true"
            className="shrink-0 border-t border-white/10 p-3"
        >
            <div
                className={`flex items-end gap-3 rounded-xl border bg-white/5 px-3 py-2 transition-colors duration-200 ${text ? 'border-violet-300/50' : 'border-white/15'}`}
            >
                <Paperclip size={16} className="mb-2 shrink-0 text-zinc-300" />
                <textarea
                    readOnly
                    tabIndex={-1}
                    aria-label="Illustrative message input"
                    value={text}
                    placeholder="Ask a question..."
                    rows={2}
                    className="min-w-0 flex-1 resize-none border-0 bg-transparent py-1 text-[14px] leading-6 text-zinc-100 outline-none placeholder:text-zinc-300"
                />
                <span
                    className={`mb-1 flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 motion-reduce:transition-none ${sending ? 'scale-90 bg-violet-300 text-violet-950 shadow-[0_0_16px_#a78bfa80]' : text ? 'bg-violet-500 text-white' : 'bg-white/10 text-zinc-300'}`}
                >
                    <ArrowUp size={17} />
                </span>
            </div>
        </div>
    );
}
