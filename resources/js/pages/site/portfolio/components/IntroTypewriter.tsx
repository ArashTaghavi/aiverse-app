import { useEffect, useRef, useState } from 'react';
import { ChevronDown, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { learningSegments, profile } from '../Data/Portfolio';
import { buildIntroTimeline } from './IntroTimeline';
import { MechanicalTypingSound } from './MechanicalTypingSound';
import styles from '../Portfolio.module.css';
import { keyboardSounds, type KeyboardSoundId } from './KeyboardSounds';

const frames = buildIntroTimeline(profile.name, learningSegments);
const finalFrame = frames[frames.length - 1];
const prefix = "Hello, I'm ";

export default function IntroTypewriter() {
    const [frame, setFrame] = useState(frames[0]);
    const [run, setRun] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [soundError, setSoundError] = useState(false);
    const [soundLoading, setSoundLoading] = useState(false);
    const [selectedSound, setSelectedSound] =
        useState<KeyboardSoundId>('typewriter');
    const audio = useRef<MechanicalTypingSound | null>(null);
    const soundOn = useRef(false);

    useEffect(
        () => () => {
            void audio.current?.close();
        },
        [],
    );

    useEffect(() => {
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let timer: ReturnType<typeof setTimeout> | undefined;
        let next = 0;
        function advance() {
            if (document.hidden) return;
            const current = frames[next];
            setFrame(current);
            if (soundOn.current && current.key)
                audio.current?.play(current.key);
            next++;
            if (next < frames.length)
                timer = setTimeout(advance, frames[next].at - current.at);
        }
        function restart() {
            clearTimeout(timer);
            next = 0;
            timer = setTimeout(
                motion.matches ? () => setFrame(finalFrame) : advance,
                0,
            );
        }
        function visibilityChanged() {
            clearTimeout(timer);
            if (!document.hidden && motion.matches) {
                timer = setTimeout(() => setFrame(finalFrame), 0);
                return;
            }
            if (!document.hidden && !motion.matches && next < frames.length)
                timer = setTimeout(advance, 100);
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

    async function toggleSound() {
        if (soundLoading) return;
        if (soundOn.current) {
            soundOn.current = false;
            setSoundEnabled(false);
            audio.current?.stop();
            return;
        }
        setSoundLoading(true);
        try {
            audio.current ??= new MechanicalTypingSound();
            await audio.current.enable(selectedSound);
            soundOn.current = true;
            setSoundEnabled(true);
            setSoundError(false);
            setRun((current) => current + 1);
        } catch {
            setSoundError(true);
        } finally {
            setSoundLoading(false);
        }
    }

    async function changeSound(next: KeyboardSoundId) {
        if (soundLoading) return;
        if (!soundOn.current) {
            setSelectedSound(next);
            setSoundError(false);
            return;
        }
        setSoundLoading(true);
        soundOn.current = false;
        audio.current?.stop();
        try {
            await audio.current!.enable(next);
            setSelectedSound(next);
            soundOn.current = true;
            setSoundError(false);
            setRun((current) => current + 1);
        } catch {
            // Keep the existing preset selected if the new recording cannot load.
            soundOn.current = true;
            setSoundError(true);
        } finally {
            setSoundLoading(false);
        }
    }

    return (
        <div className="flex w-full flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-300">
                <button
                    type="button"
                    onClick={() => void toggleSound()}
                    disabled={soundLoading}
                    aria-pressed={soundEnabled}
                    className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-200"
                >
                    {soundEnabled ? (
                        <Volume2 size={14} aria-hidden="true" />
                    ) : (
                        <VolumeX size={14} aria-hidden="true" />
                    )}
                    {soundLoading
                        ? 'Loading sound…'
                        : soundEnabled
                          ? 'Sound on'
                          : 'Enable sound'}
                </button>
                <div className="relative">
                    <select
                        aria-label="Keyboard sound"
                        value={selectedSound}
                        onChange={(event) =>
                            void changeSound(
                                event.target.value as KeyboardSoundId,
                            )
                        }
                        disabled={soundLoading}
                        className="max-w-[210px] appearance-none rounded-lg border border-white/15 bg-[#0c0c12] py-2 pr-8 pl-3 text-xs text-zinc-100 outline-none hover:border-white/30 focus-visible:border-sky-200 disabled:opacity-50"
                    >
                        {keyboardSounds.map((sound) => (
                            <option key={sound.id} value={sound.id}>
                                {sound.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={12}
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-300"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setRun((current) => current + 1)}
                    aria-label="Replay introduction"
                    className="rounded-md p-1.5 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-200"
                >
                    <RotateCcw size={13} aria-hidden="true" />
                </button>
                {soundError && (
                    <span role="status">
                        Could not load sound. Please try again.
                    </span>
                )}
            </div>
            <p
                key={run}
                className={`relative max-w-full text-2xl leading-snug font-medium tracking-tight text-zinc-100 sm:text-4xl ${frame.phase === 'zoom' ? styles.introGreeting : ''}`}
            >
                <span className="sr-only">{finalFrame.greeting}</span>
                <span aria-hidden="true" className="invisible">
                    {finalFrame.greeting}
                </span>
                <span aria-hidden="true" className="absolute inset-0">
                    {frame.greeting.slice(0, prefix.length)}
                    <span className="text-sky-200">
                        {frame.greeting.slice(prefix.length)}
                    </span>
                    {frame.phase === 'greeting' && (
                        <span className={styles.typingCaret} />
                    )}
                </span>
            </p>
            <p className="relative w-full max-w-xl text-sm leading-7 text-zinc-200 sm:text-base">
                <span className="sr-only">{finalFrame.story}</span>
                <span aria-hidden="true" className="invisible">
                    {finalFrame.story}
                </span>
                <span
                    aria-hidden="true"
                    className={`absolute inset-0 ${frame.phase === 'done' ? styles.storyComplete : ''}`}
                >
                    {frame.story}
                    {frame.phase === 'story' && (
                        <span className={styles.typingCaret} />
                    )}
                </span>
            </p>
        </div>
    );
}
