import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import type { AnalysisProgressProps } from '@/types';

export default function AnalysisProgress({
    steps,
    finished,
    failed,
}: AnalysisProgressProps) {
    return (
        <div
            dir="ltr"
            className="mr-auto max-w-[95%] rounded-2xl border border-violet-300/15 bg-violet-400/5 px-3 py-2.5 sm:max-w-[90%]"
        >
            <ol aria-label="Analysis progress" className="space-y-2">
                {steps.map((step, index) => {
                    const last = index === steps.length - 1;
                    const running = last && !finished && !failed;
                    const Icon = running
                        ? LoaderCircle
                        : last && failed
                          ? CircleAlert
                          : Check;
                    return (
                        <li
                            key={`${step.stage}-${index}`}
                            className={`flex items-center gap-2 text-xs leading-6 ${last && failed ? 'text-red-300' : running ? 'text-violet-200' : 'text-zinc-400'}`}
                        >
                            <Icon
                                size={14}
                                aria-hidden="true"
                                className={`shrink-0 ${running ? 'animate-spin motion-reduce:animate-none' : ''}`}
                            />
                            <span>
                                {running
                                    ? step.message
                                    : step.message.replace(/…$/, '')}
                            </span>
                        </li>
                    );
                })}
            </ol>
            <p role="status" className="sr-only">
                {failed
                    ? 'Analysis failed'
                    : finished
                      ? 'Analysis complete'
                      : steps.at(-1)?.message}
            </p>
        </div>
    );
}
