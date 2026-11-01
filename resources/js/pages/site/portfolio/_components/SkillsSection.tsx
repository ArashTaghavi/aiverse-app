import {
    Box,
    BrainCircuit,
    Code2,
    Database,
    Gamepad2,
    Network,
    Server,
} from 'lucide-react';
import { creativeInterests, skillGroups } from '../_data/portfolio';
import styles from './Skills.module.css';

const categoryIcons = {
    backend: Server,
    frontend: Code2,
    databases: Database,
    devops: Network,
    ai: BrainCircuit,
};

export default function SkillsSection() {
    return (
        <section
            id="skills"
            aria-labelledby="skills-title"
            className={`${styles.section} scroll-mt-36 border-t border-white/10 pt-12 pb-20 sm:pt-16`}
        >
            <header className="mb-8 text-center">
                <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-sky-200 uppercase">
                    Always learning. Always building.
                </p>
                <h2
                    id="skills-title"
                    className="text-2xl font-medium tracking-tight sm:text-3xl"
                >
                    Skills & expertise
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-300">
                    The tools and disciplines behind the things I build.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {skillGroups.map((group) => {
                    const Icon = categoryIcons[group.id];
                    return (
                        <article
                            key={group.id}
                            aria-labelledby={`skill-${group.id}`}
                            className={`${styles.card} min-w-0 p-5 sm:p-6 ${group.id === 'ai' ? 'sm:col-span-2 lg:col-span-4' : ''}`}
                        >
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <span className={styles.icon}>
                                    <Icon
                                        size={23}
                                        strokeWidth={1.4}
                                        aria-hidden="true"
                                    />
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="font-mono text-[10px] tracking-widest text-zinc-400"
                                >
                                    /{group.number}
                                </span>
                            </div>
                            <h3
                                id={`skill-${group.id}`}
                                className="text-base font-medium tracking-tight text-zinc-100"
                            >
                                {group.title}
                            </h3>
                            <p className="mt-1.5 text-xs leading-6 text-zinc-400">
                                {group.description}
                            </p>
                            <ul
                                aria-label={`${group.title} skills`}
                                className="mt-5 flex flex-wrap gap-2"
                            >
                                {group.skills.map((skill) => (
                                    <li key={skill} className={styles.tag}>
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    );
                })}
            </div>

            <section aria-labelledby="interests-title" className="mt-10">
                <div className="mb-4 flex items-center gap-3">
                    <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-white/10"
                    />
                    <h3
                        id="interests-title"
                        className="text-[10px] font-medium tracking-[0.17em] text-zinc-300 uppercase"
                    >
                        Creative interests
                    </h3>
                    <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-white/10"
                    />
                </div>
                <article
                    className={`${styles.card} flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6`}
                >
                    <span className={`${styles.icon} shrink-0`}>
                        <Box size={23} strokeWidth={1.4} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h4 className="flex items-center gap-2 text-base font-medium text-zinc-100">
                            {creativeInterests.title}
                            <Gamepad2
                                size={17}
                                aria-hidden="true"
                                className="shrink-0 text-sky-200/80"
                            />
                        </h4>
                        <p className="mt-1.5 max-w-sm text-xs leading-6 text-zinc-400">
                            {creativeInterests.description}
                        </p>
                        <ul
                            aria-label="Creative interests"
                            className="mt-4 flex flex-wrap gap-2"
                        >
                            {creativeInterests.skills.map((skill) => (
                                <li key={skill} className={styles.tag}>
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>
            </section>
        </section>
    );
}
