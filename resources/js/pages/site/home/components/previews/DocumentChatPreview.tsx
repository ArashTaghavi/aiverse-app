import blueSpacebar from '../../../../../../assets/sounds/typewriter/blue-switch-spacebar-balanced.mp3?url';
import blueModifier from '../../../../../../assets/sounds/typewriter/blue-switch-modifier.mp3?url';
import mechanicalEnter from '../../../../../../assets/sounds/typewriter/mechanical-enter.mp3?url';
import PreviewComposer from './PreviewComposer';
import { buildHumanDraft, sendPause } from './preview-timeline';
import {
    MechanicalTypingSound,
    type TypewriterKey,
} from '../../../portfolio/components/mechanical-typing-sound';

import { useEffect, useRef, useState } from 'react';
import { FileText, Sparkles, UserRound, Volume2, VolumeX } from 'lucide-react';

const userTypingScale = 1.45;
const readingPause = 2200;
const documentName = 'the-last-lighthouse.pdf';
const conversation = [
    {
        role: 'user',
        text: 'In The Last Lighthouse PDF, why does Nora return to the island?',
        citation: '',
    },
    {
        role: 'assistant',
        text: "Nora receives a letter in her missing father's handwriting. It asks her to light the old lighthouse before the next storm.",
        citation: 'p. 2 · The letter',
    },
    {
        role: 'user',
        text: 'What does she find inside the lighthouse? Is there a clue about her father?',
        citation: '',
    },
    {
        role: 'assistant',
        text: 'She finds his logbook beneath a loose floorboard. Its final entry describes a hidden cove and a boat arriving after midnight.',
        citation: 'pp. 3–4 · The hidden logbook',
    },
    {
        role: 'user',
        text: 'Does the ending reveal whether her father is still alive?',
        citation: '',
    },
    {
        role: 'assistant',
        text: 'The ending leaves that open. Nora sees a familiar silhouette aboard the boat, but the story ends before she can identify him.',
        citation: 'p. 6 · A light in the storm',
    },
] as const;

const userCorrections = [
    { word: 'island', typo: 'islnad' },
    { word: 'lighthouse', typo: 'lighhouse' },
    { word: 'alive', typo: 'alvie' },
];

function buildDocumentDraft(text: string, start: number, question: number) {
    const events = buildHumanDraft(text, start, userCorrections[question]);
    let pause = 0;
    let word = 0;
    return events.map((event, index) => {
        const previous = events[index - 1];
        if (event.key === 'type' && previous?.key === 'space') {
            word++;
            // Brief thinking pauses between some words, rather than a steady metronome.
            if ((word + question) % 3 === 0)
                pause += 220 + ((event.text.length * 19) % 220);
            else if ((word + question) % 5 === 0)
                pause += 120 + ((word * 31) % 140);
        }
        if (event.key === 'erase' && previous?.key !== 'erase') pause += 180;
        if (event.key === 'type' && previous?.key === 'erase') pause += 120;
        return {
            ...event,
            at: start + (event.at - start) * userTypingScale + pause,
        };
    });
}

function buildWordResponse(text: string, start: number) {
    const events = [{ at: start, text: '' }];
    let at = start;
    let visible = '';
    for (const [index, word] of (text.match(/\S+\s*/g) ?? []).entries()) {
        at += 150 + ((index * 17) % 60) + (/[.!?]\s*$/.test(word) ? 140 : 0);
        visible += word;
        events.push({ at, text: visible });
    }
    return events;
}

let nextStart = 800;
const timeline = conversation.map((message, index) => {
    const user = message.role === 'user';
    const draftStart = nextStart;
    const draftEvents = user
        ? buildDocumentDraft(message.text, draftStart, Math.floor(index / 2))
        : undefined;
    const start = draftEvents
        ? draftEvents[draftEvents.length - 1].at + sendPause
        : draftStart;
    const responseEvents = user
        ? undefined
        : buildWordResponse(message.text, start);
    const end = responseEvents
        ? responseEvents[responseEvents.length - 1].at
        : start;
    nextStart = end + readingPause;
    return {
        ...message,
        user,
        draftStart,
        start,
        end,
        draftEvents,
        responseEvents,
    };
});
const completedAt = timeline[timeline.length - 1].end;
const cycleLength = completedAt + 7000;
const playbackEvents: { at: number; key?: TypewriterKey }[] = [
    { at: 0 },
    ...timeline.flatMap<{ at: number; key?: TypewriterKey }>((message) =>
        message.draftEvents
            ? [
                  ...message.draftEvents,
                  { at: message.start, key: 'enter' as const },
              ]
            : (message.responseEvents ?? []),
    ),
];

export default function DocumentChatPreview() {
    const [elapsed, setElapsed] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [soundLoading, setSoundLoading] = useState(false);
    const [soundError, setSoundError] = useState(false);
    const [run, setRun] = useState(0);
    const audio = useRef<MechanicalTypingSound | null>(null);
    const soundOn = useRef(false);
    const mounted = useRef(false);
    const transcript = useRef<HTMLDivElement>(null);
    const followLatest = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            void audio.current?.close();
            audio.current = null;
        };
    }, []);

    async function toggleSound() {
        if (soundLoading) return;
        if (soundOn.current) {
            soundOn.current = false;
            setSoundEnabled(false);
            audio.current?.stop();
            return;
        }
        setSoundLoading(true);
        setSoundError(false);
        try {
            audio.current ??= new MechanicalTypingSound();
            await audio.current.enable('blue', {
                space: [blueSpacebar],
                erase: [blueModifier],
                enter: [mechanicalEnter],
            });
            if (!mounted.current) return;
            soundOn.current = true;
            setSoundEnabled(true);
            setRun((current) => current + 1);
        } catch {
            if (mounted.current) setSoundError(true);
        } finally {
            if (mounted.current) setSoundLoading(false);
        }
    }

    useEffect(() => {
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let timer: ReturnType<typeof setTimeout> | undefined;
        let next = 0;
        function advance() {
            if (document.hidden) return;
            const current = playbackEvents[next];
            setElapsed(current.at);
            if (soundOn.current && current.key) {
                audio.current?.play(current.key, {
                    gain: current.key === 'space' ? 0.35 : 1,
                });
            }
            next++;
            if (next < playbackEvents.length) {
                timer = setTimeout(
                    advance,
                    playbackEvents[next].at - current.at,
                );
            } else {
                next = 0;
                timer = setTimeout(advance, cycleLength - current.at);
            }
        }
        function restart() {
            clearTimeout(timer);
            next = 0;
            timer = setTimeout(
                motion.matches ? () => setElapsed(completedAt) : advance,
                0,
            );
        }
        function visibilityChanged() {
            clearTimeout(timer);
            if (!document.hidden)
                timer = setTimeout(
                    motion.matches ? () => setElapsed(completedAt) : advance,
                    100,
                );
        }
        restart();
        motion.addEventListener('change', restart);
        document.addEventListener('visibilitychange', visibilityChanged);
        return () => {
            clearTimeout(timer);
            motion.removeEventListener('change', restart);
            document.removeEventListener('visibilitychange', visibilityChanged);
        };
    }, [run]);

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

    return (
        <figure
            aria-label="Illustrative multi-turn chat about a mystery story PDF, with page citations"
            className="relative mt-3 overflow-hidden rounded-xl border border-violet-300/10 bg-[#0c0b12]/45 text-left shadow-[0_0_2px_1px_#ffffff26,0_0_26px_3px_#ffffff14,0_0_36px_5px_#00000059,inset_0_0_10px_1px_#ffffff1a]!"
        >
            <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-zinc-500">
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa70]"
                    />
                    document.chat
                </span>
                <button
                    type="button"
                    onClick={() => void toggleSound()}
                    disabled={soundLoading}
                    aria-pressed={soundEnabled}
                    aria-label={
                        soundEnabled
                            ? 'Mute Cherry MX Blue typing sound'
                            : 'Enable Cherry MX Blue typing sound'
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] text-zinc-200 transition-colors hover:border-violet-300/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-violet-300 disabled:opacity-50"
                >
                    {soundEnabled ? (
                        <Volume2 size={13} aria-hidden="true" />
                    ) : (
                        <VolumeX size={13} aria-hidden="true" />
                    )}
                    {soundLoading
                        ? 'Loading sound…'
                        : soundEnabled
                          ? 'Sound on'
                          : 'Enable sound'}
                </button>
            </figcaption>
            {soundError && (
                <p role="status" className="px-3 py-2 text-xs text-amber-200">
                    Could not load sound. Please try again.
                </p>
            )}
            <div
                aria-hidden="true"
                className="flex items-center gap-2 border-b border-white/5 px-3 py-2 text-[10px] text-zinc-500"
            >
                <FileText size={13} className="text-violet-300/70" />
                <span>{documentName}</span>
                <span className="ml-auto text-emerald-400/70">
                    6 pages · Indexed
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
                className="h-72 [scrollbar-width:thin] [scrollbar-color:#3a304a_transparent] space-y-3 overflow-y-auto overscroll-contain p-3"
            >
                {elapsed < timeline[0].start && (
                    <p className="text-[10px] text-zinc-600">
                        Document ready. Ask a question...
                    </p>
                )}
                {timeline
                    .filter((message) => elapsed >= message.start)
                    .map((message, index) => {
                        const user = message.role === 'user';
                        const typing = elapsed < message.end;
                        const text = user
                            ? message.text
                            : (message.responseEvents?.findLast(
                                  (event) => event.at <= elapsed,
                              )?.text ?? '');
                        return (
                            <div
                                key={index}
                                className={`flex items-start gap-2 ${user ? 'ml-6 flex-row-reverse' : 'mr-3'}`}
                            >
                                <span
                                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border ${user ? 'border-white/8 bg-white/4 text-zinc-400' : 'border-violet-300/15 bg-violet-300/5 text-violet-300'}`}
                                >
                                    {user ? (
                                        <UserRound size={12} />
                                    ) : (
                                        <Sparkles size={12} />
                                    )}
                                </span>
                                <div
                                    className={`min-w-0 flex-1 rounded-lg border px-2.5 py-2 ${user ? 'rounded-tr-sm border-white/6 bg-white/3' : 'rounded-tl-sm border-violet-300/10 bg-violet-300/3'}`}
                                >
                                    <p
                                        className={`mb-1 text-[9px] font-medium tracking-wide ${user ? 'text-zinc-500' : 'text-violet-300/80'}`}
                                    >
                                        {user ? 'YOU' : 'DOCUMENT ASSISTANT'}
                                    </p>
                                    <p className="text-[11px] leading-5 text-zinc-300">
                                        {text}
                                        {typing && (
                                            <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-violet-200 align-middle motion-reduce:animate-none" />
                                        )}
                                    </p>
                                    {!user && !typing && (
                                        <span className="mt-2 inline-flex max-w-full items-start gap-1.5 rounded border border-cyan-300/10 bg-cyan-300/5 px-2 py-1 text-[9px] leading-4 text-cyan-200/70">
                                            <FileText
                                                size={10}
                                                className="mt-0.5 shrink-0"
                                            />
                                            <span>
                                                {documentName} ·{' '}
                                                {message.citation}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>
            <PreviewComposer
                timeline={timeline}
                elapsed={elapsed}
                speed={120 * userTypingScale}
            />
            <p className="sr-only">
                Illustrative conversation about a fictional mystery story PDF,
                The Last Lighthouse.{' '}
                {conversation
                    .map(
                        (message) =>
                            `${message.role}: ${message.text}${message.citation ? ` Source: ${documentName}, ${message.citation}.` : ''}`,
                    )
                    .join(' ')}
            </p>
        </figure>
    );
}
