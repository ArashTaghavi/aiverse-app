import { Camera, UserRound } from 'lucide-react';
import { profile } from '../_data/portfolio';
import styles from '../Portfolio.module.css';
import IntroTypewriter from './IntroTypewriter';

export default function ProfileIntro() {
    return (
        <div
            className={`${styles.intro} relative isolate flex flex-col items-center gap-5 pt-12 pb-4 text-center sm:pt-16`}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[450px] w-[min(800px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,#3b82f640_0%,#6366f126_35%,transparent_72%)] blur-[60px]"
            />
            <div className="relative">
                <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-linear-to-br from-white/10 to-white/2 shadow-[0_0_0_7px_#ffffff04,0_0_32px_#ffffff08] sm:size-28">
                    {profile.photo ? (
                        <img
                            src={profile.photo}
                            alt={`Portrait of ${profile.name}`}
                            width={112}
                            height={112}
                            sizes="112px"
                            className="absolute inset-0 size-full object-cover"
                            fetchPriority="high"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-300">
                            <UserRound
                                size={30}
                                strokeWidth={1}
                                aria-hidden="true"
                            />
                            <span className="font-mono text-[8px] tracking-[0.16em]">
                                YOUR PHOTO
                            </span>
                        </div>
                    )}
                </div>
                {!profile.photo && (
                    <span
                        aria-hidden="true"
                        className="absolute right-0 bottom-0 rounded-full border border-white/20 bg-[#121215] p-1.5 text-zinc-200"
                    >
                        <Camera size={13} />
                    </span>
                )}
            </div>
            <IntroTypewriter />
            <div
                aria-hidden="true"
                className="mt-2 h-10 w-px bg-linear-to-b from-white/35 to-transparent"
            />
        </div>
    );
}
