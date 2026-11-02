import type { MessageHistoryProps, MessageTimeProps } from '@/types';
import { groupMessagesByDay, messageDate } from '../_lib/message-dates';
import { Sparkles, UserRound } from 'lucide-react';
import styles from './MessageHistory.module.css';

function MessageTime({ timestamp }: MessageTimeProps) {
    const date = messageDate(timestamp);
    if (!date.iso) return null;
    return (
        <time
            dateTime={date.iso}
            title={date.full}
            aria-label={date.full}
            dir="ltr"
            className="mt-2 block text-right text-[10px] text-zinc-400 tabular-nums"
        >
            {date.time}
        </time>
    );
}

export default function MessageHistory({ turns }: MessageHistoryProps) {
    return groupMessagesByDay(turns).map((group) => (
        <section
            key={group.day}
            aria-label={group.label}
            className="relative w-full space-y-4 pb-2"
        >
            <div className="sticky top-0 z-10 flex justify-center py-2">
                <span
                    dir="ltr"
                    className="rounded-full border border-white/15 bg-[#252533]/90 px-4 py-1.5 text-[11px] text-zinc-300 shadow-lg shadow-black/20 backdrop-blur-md"
                >
                    {group.label}
                </span>
            </div>
            {group.turns.map((turn) => (
                <div key={turn.id} className="space-y-3">
                    <div
                        className={`${styles.bubble} ${styles.user} ml-auto w-fit max-w-[92%] rounded-3xl rounded-tr-md px-3 py-2.5 sm:max-w-[82%]`}
                    >
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-200">
                            <span className="flex size-6 items-center justify-center rounded-lg border border-violet-200/20 bg-violet-300/15">
                                <UserRound size={13} aria-hidden="true" />
                            </span>
                            You
                        </div>
                        <p
                            dir="auto"
                            className="text-sm leading-7 break-words whitespace-pre-wrap text-zinc-100"
                        >
                            {turn.question}
                        </p>
                        <MessageTime timestamp={turn.created_at} />
                    </div>
                    <div
                        className={`${styles.bubble} ${styles.assistant} mr-auto w-fit max-w-[95%] rounded-3xl rounded-tl-md px-3 py-2.5 sm:max-w-[90%]`}
                    >
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-sky-200">
                            <span className="flex size-6 items-center justify-center rounded-lg border border-sky-200/20 bg-sky-300/10">
                                <Sparkles size={13} aria-hidden="true" />
                            </span>
                            Assistant
                        </div>
                        <p
                            dir="auto"
                            className="text-sm leading-7 break-words whitespace-pre-wrap text-zinc-200"
                        >
                            {turn.answer ??
                                (turn.answer_status === 'FAILED'
                                    ? 'Could not prepare an answer. Please try again.'
                                    : 'Preparing an answer…')}
                        </p>
                        <MessageTime timestamp={turn.created_at} />
                    </div>
                </div>
            ))}
        </section>
    ));
}
