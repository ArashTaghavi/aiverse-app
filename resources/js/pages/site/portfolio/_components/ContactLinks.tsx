import { ArrowUpRight, Link2, Mail, Phone } from 'lucide-react';
import { profile } from '../_data/portfolio';
import styles from './Skills.module.css';

const contacts = [
    {
        label: 'Phone',
        value: profile.phone,
        href: `tel:${profile.phone}`,
        icon: Phone,
        external: false,
        action: "Let's talk",
    },
    {
        label: 'Email',
        value: profile.email,
        href: `mailto:${profile.email}`,
        icon: Mail,
        external: false,
        action: 'Send a message',
    },
    {
        label: 'LinkedIn',
        value: profile.linkedin,
        href: `https://www.linkedin.com/in/${profile.linkedin}/`,
        icon: Link2,
        external: true,
        action: 'Connect on LinkedIn',
    },
];

export default function ContactLinks() {
    return (
        <section
            id="contact"
            aria-labelledby="contact-title"
            className="w-full scroll-mt-36 border-t border-white/10 pt-12 pb-16 sm:pb-20"
        >
            <header className="mb-8 text-center">
                <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-sky-200 uppercase">
                    A conversation away
                </p>
                <h2
                    id="contact-title"
                    className="text-2xl font-medium tracking-tight sm:text-3xl"
                >
                    Let&apos;s connect.
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                    Have an idea or a project in mind? Get in touch.
                </p>
            </header>
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {contacts.map(
                    ({ label, value, href, icon: Icon, external, action }) => (
                        <li key={label} className="min-w-0">
                            <a
                                href={href}
                                target={external ? '_blank' : undefined}
                                rel={
                                    external ? 'noopener noreferrer' : undefined
                                }
                                className={`${styles.card} group flex h-full flex-col p-6 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200 sm:p-7`}
                            >
                                <span className="mb-7 flex items-center justify-between gap-4">
                                    <span className={styles.icon}>
                                        <Icon
                                            size={21}
                                            strokeWidth={1.5}
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <ArrowUpRight
                                        size={18}
                                        aria-hidden="true"
                                        className="text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-200 motion-reduce:transition-none"
                                    />
                                </span>
                                <span className="mb-2 text-[10px] tracking-[0.15em] text-zinc-400 uppercase">
                                    {label}
                                </span>
                                <span
                                    dir="ltr"
                                    className="min-w-0 text-base font-medium break-all text-zinc-100 transition-colors group-hover:text-sky-200 sm:text-lg"
                                >
                                    {value}
                                </span>
                                <span className="mt-6 border-t border-white/10 pt-4 text-xs text-zinc-300">
                                    {action}
                                </span>
                            </a>
                        </li>
                    ),
                )}
            </ul>
        </section>
    );
}
