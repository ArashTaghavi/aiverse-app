import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import styles from './ProjectSlider.module.css';
import DocumentChatPreview from './Previews/DocumentChatPreview';
import DatabaseAnalystPreview from './Previews/DatabaseAnalystPreview';
import CustomerSupportPreview from './Previews/CustomerSupportPreview';
import DeepResearchPreview from './Previews/DeepResearchPreview';
import CodebaseAssistantPreview from './Previews/CodebaseAssistantPreview';
import ContractIntelligencePreview from './Previews/ContractIntelligencePreview';
import WorkflowAutomationPreview from './Previews/WorkflowAutomationPreview';
import MultiAgentPreview from './Previews/MultiAgentPreview';

const projects = [
    {
        title: 'Chat with Documents',
        description:
            'Turn your documents into conversations. Ask questions, explore ideas, and follow answers back to their sources.',
        category: 'Documents & knowledge',
        Preview: DocumentChatPreview,
    },
    {
        title: 'AI Database Analyst',
        description:
            'Explore your data in plain language. Turn questions into SQL queries and uncover the story behind the numbers.',
        category: 'Data & insights',
        Preview: DatabaseAnalystPreview,
    },
    {
        title: 'AI Customer Support',
        description:
            'Bring knowledge and conversation together. Help customers find answers with context and a human handoff when needed.',
        category: 'Customer experience',
        Preview: CustomerSupportPreview,
    },
    {
        title: 'Deep Research Agent',
        description:
            'Follow a question further. Plan research, explore sources, and connect findings into a clear, verified answer.',
        category: 'Research & discovery',
        Preview: DeepResearchPreview,
    },
    {
        title: 'AI Codebase Assistant',
        description:
            'Find your way through a codebase. Discover relevant code and understand how the pieces fit together.',
        category: 'Code & development',
        Preview: CodebaseAssistantPreview,
    },
    {
        title: 'Contract Intelligence',
        description:
            'Bring clarity to complex contracts. Extract key terms, review clauses, and surface details that deserve attention.',
        category: 'Documents & analysis',
        Preview: ContractIntelligencePreview,
    },
    {
        title: 'AI Workflow Automation',
        description:
            'Connect tools and turn tasks into workflows. Coordinate each step with approvals along the way.',
        category: 'Tools & automation',
        Preview: WorkflowAutomationPreview,
    },
    {
        title: 'Multi-Agent Workspace',
        description:
            'See specialized agents work together. Delegate tasks, share context, and bring their results into one workspace.',
        category: 'Agents & collaboration',
        Preview: MultiAgentPreview,
    },
];

export default function ProjectSlider() {
    const [active, setActive] = useState(0);
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const go = (direction: number) =>
        setActive(
            (current) =>
                (current + direction + projects.length) % projects.length,
        );

    return (
        <section
            id="projects"
            aria-label="AI projects"
            aria-roledescription="carousel"
            tabIndex={0}
            className="flex h-full min-h-0 scroll-mt-32 flex-col overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-inset sm:scroll-mt-20"
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                    event.preventDefault();
                    go(event.key === 'ArrowRight' ? 1 : -1);
                }
            }}
            onTouchStart={(event) => {
                const touch = event.touches[0];
                touchStart.current = { x: touch.clientX, y: touch.clientY };
            }}
            onTouchCancel={() => {
                touchStart.current = null;
            }}
            onTouchEnd={(event) => {
                if (!touchStart.current) return;
                const touch = event.changedTouches[0];
                const dx = touch.clientX - touchStart.current.x;
                const dy = touch.clientY - touchStart.current.y;
                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
                    go(dx < 0 ? 1 : -1);
                touchStart.current = null;
            }}
        >
            <div
                className="flex min-h-0 flex-1 transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${active * 100}%)` }}
            >
                {projects.map(
                    ({ title, description, category, Preview }, index) => (
                        <article
                            key={title}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${index + 1} of ${projects.length}: ${title}`}
                            aria-hidden={index !== active}
                            inert={index !== active}
                            className={`${styles.slide} flex h-full w-full min-w-0 shrink-0 items-center px-5 py-3 sm:px-10 lg:px-16 xl:px-24`}
                        >
                            <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] items-center gap-3 lg:grid-cols-[0.8fr_1.2fr] lg:grid-rows-[minmax(0,1fr)] lg:gap-12 xl:gap-20">
                                <div className="max-h-full max-w-xl overflow-y-auto">
                                    <p className="mb-2 flex items-center gap-3 text-[10px] font-medium tracking-[0.2em] text-violet-300 uppercase sm:text-xs lg:mb-5">
                                        <span className="h-px w-8 bg-violet-400" />
                                        {category}
                                    </p>
                                    <h1 className="text-[clamp(0.875rem,3.8vw,1.5rem)] leading-tight font-semibold tracking-tight whitespace-nowrap lg:text-[clamp(0.875rem,1.65vw,1.875rem)]">
                                        {title}
                                    </h1>
                                    <p className="mt-5 hidden max-w-lg text-sm leading-7 text-zinc-400 lg:block lg:text-base lg:leading-8">
                                        {description}
                                    </p>
                                    <button
                                        type="button"
                                        disabled
                                        title="Project access is not available yet"
                                        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-violet-200 lg:mt-6"
                                    >
                                        Start building{' '}
                                        <ArrowUpRight
                                            size={17}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                                <div
                                    className={`${styles.preview} h-full min-h-0 min-w-0 [&_.text-zinc-400]:text-zinc-300! [&_.text-zinc-500]:text-zinc-200! [&_.text-zinc-600]:text-zinc-200! [&_.text-zinc-700]:text-zinc-300! [&_code]:text-[13px]! [&_dd]:text-[14px]! [&_dt]:text-[13px]! [&_p]:text-[14px]! [&_p]:leading-6! [&_pre]:text-[13px]! [&_pre]:leading-6! [&_pre.h-28]:h-auto! [&_pre.h-28]:flex-none! [&_pre.h-28]:overflow-visible! [&_pre.h-28]:wrap-anywhere! [&_pre.h-28]:whitespace-pre-wrap! [&_span]:text-[12px]! [&>figure]:relative! [&>figure]:inset-auto! [&>figure]:m-0! [&>figure]:flex! [&>figure]:h-full! [&>figure]:min-h-0! [&>figure]:w-full! [&>figure]:flex-auto! [&>figure]:flex-col! [&>figure]:backdrop-blur-[14px]! [&>figure>.h-72]:h-0! [&>figure>.h-72]:min-h-0! [&>figure>.h-72]:flex-1!`}
                                >
                                    {index === active && <Preview />}
                                </div>
                            </div>
                        </article>
                    ),
                )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/5 px-5 py-2 sm:px-10 lg:px-16 xl:px-24">
                <p
                    aria-live="polite"
                    aria-atomic="true"
                    className="min-w-20 font-mono text-xs text-zinc-500"
                >
                    <span className="text-violet-300">
                        {String(active + 1).padStart(2, '0')}
                    </span>{' '}
                    / 08
                    <span className="sr-only">: {projects[active].title}</span>
                </p>
                <div
                    role="group"
                    aria-label="Choose project"
                    className="order-3 flex w-full justify-center gap-1 sm:order-none sm:w-auto"
                >
                    {projects.map(({ title }, index) => (
                        <button
                            key={title}
                            type="button"
                            aria-label={`Show ${title}`}
                            aria-pressed={active === index}
                            onClick={() => setActive(index)}
                            className="group flex h-8 items-center px-1.5 focus-visible:outline-2 focus-visible:outline-violet-400"
                        >
                            <span
                                className={`h-1 rounded-full transition-all duration-300 motion-reduce:transition-none ${active === index ? 'w-10 bg-violet-400 shadow-[0_0_12px_#a78bfa70]' : 'w-4 bg-zinc-700 group-hover:bg-zinc-400'}`}
                            />
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        aria-label="Previous project"
                        onClick={() => go(-1)}
                        className="rounded-full border border-white/15 p-3 text-zinc-300 transition-colors hover:border-violet-400/50 hover:bg-violet-400/10 focus-visible:outline-2 focus-visible:outline-violet-400"
                    >
                        <ArrowLeft size={18} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next project"
                        onClick={() => go(1)}
                        className="rounded-full border border-white/15 p-3 text-zinc-300 transition-colors hover:border-violet-400/50 hover:bg-violet-400/10 focus-visible:outline-2 focus-visible:outline-violet-400"
                    >
                        <ArrowRight size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    );
}
