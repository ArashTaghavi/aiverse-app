import { useEffect, useRef, useState } from 'react';
import LoginForm from './LoginForm';
import styles from './LoginCard.module.css';

export default function LoginCard() {
    const [confirmed, setConfirmed] = useState(false);
    const mounted = useRef(true);
    const delay = useRef<{
        timer: ReturnType<typeof setTimeout>;
        resolve: () => void;
    } | null>(null);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            if (delay.current) {
                clearTimeout(delay.current.timer);
                delay.current.resolve();
            }
        };
    }, []);

    function pause(milliseconds: number): Promise<void> {
        return new Promise((resolve) => {
            delay.current = {
                timer: setTimeout(resolve, milliseconds),
                resolve,
            };
        });
    }

    async function confirmAuthentication(): Promise<void> {
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        await pause(reducedMotion ? 0 : 180);
        if (!mounted.current) {
            return;
        }
        setConfirmed(true);
        await pause(reducedMotion ? 200 : 1000);
        delay.current = null;
    }

    return (
        <>
            <section
                aria-labelledby="login-title"
                className={`${styles.card} relative overflow-hidden rounded-3xl border border-white/20 bg-linear-to-br from-white/9 via-[#111117]/75 to-white/3 px-6 py-9 shadow-[0_0_0_1px_#ffffff08,0_0_28px_2px_#ffffff0d,0_18px_45px_-12px_#000000b3,inset_0_1px_0_#ffffff2b,inset_0_-1px_0_#ffffff08]! backdrop-blur-2xl sm:px-10 sm:py-10`}
            >
                <div
                    aria-hidden="true"
                    className={`${styles.edgeShine} pointer-events-none absolute inset-x-6 top-0 h-px overflow-hidden bg-linear-to-r from-transparent via-violet-300 to-transparent shadow-[0_0_18px_2px_#8b5cf670]`}
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-10 -top-16 h-32 rounded-full bg-violet-500/20 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className={`${styles.lock} ${confirmed ? `${styles.unlocked} ${styles.confirmed}` : ''} mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300 shadow-[0_0_30px_-12px_#8b5cf6]`}
                >
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path
                            className={styles.shackle}
                            d="M7 11V7a5 5 0 0 1 10 0v4"
                        />
                        <rect x="4" y="11" width="16" height="11" rx="2.5" />

                        {confirmed ? (
                            <path className={styles.check} d="m8 16 3 3 5-5" />
                        ) : (
                            <>
                                <circle cx="12" cy="16" r="1" />
                                <path d="M12 17v2" />
                            </>
                        )}
                    </svg>
                </div>
                <h1
                    id="login-title"
                    className="text-center text-2xl leading-relaxed font-semibold tracking-tight sm:text-[28px]"
                >
                    Welcome
                </h1>
                <span role="status" className="sr-only">
                    {confirmed ? 'Authentication successful. Redirecting?' : ''}
                </span>
                <LoginForm onAuthenticated={confirmAuthentication} />
            </section>
        </>
    );
}
