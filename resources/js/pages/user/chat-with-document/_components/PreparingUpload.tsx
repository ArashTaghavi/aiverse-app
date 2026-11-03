import { FileCheck2, HardDriveUpload, Layers, FileText } from 'lucide-react';

const steps = [
    {
        row_number: 1,
        title: 'Upload and save file',
        description: 'Save the file to disk and its details to the database.',
        icon: HardDriveUpload,
    },
    {
        row_number: 2,
        title: 'Generate and store embeddings',
        description: 'Process the file contents and save their embeddings.',
        icon: Layers,
    },
    {
        row_number: 3,
        title: 'Final result: success or error',
        description: 'Report the outcome of file preparation.',
        icon: FileCheck2,
    },
];

export default function PreparingUpload() {
    return (
        <section
            dir="ltr"
            aria-labelledby="preparing-upload-title"
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#191923] p-5 sm:p-7"
        >
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-violet-300">
                    <FileText size={22} aria-hidden="true" />
                </div>
                <div className="space-y-1">
                    <h2 id="preparing-upload-title" className="text-base font-semibold text-zinc-100">
                        Preparing your file
                    </h2>
                    <p className="text-xs leading-6 text-ui-secondary">
                        File preparation steps before starting your chat.
                    </p>
                </div>
            </div>

            <ol className="pt-6">
                {steps.map((step) => (
                    <li key={step.row_number} className="group flex gap-3 sm:gap-4">
                        <div className="flex shrink-0 flex-col items-center">
                            <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-ui-muted">
                                <step.icon size={18} aria-hidden="true" />
                            </div>
                            <div aria-hidden="true" className="my-2 w-px flex-1 bg-white/10 group-last:hidden" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2 pb-7 group-last:pb-0">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs text-ui-muted">Step {step.row_number}</span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-ui-muted">
                                    Pending
                                </span>
                            </div>
                            <h3 className="text-sm leading-6 font-medium text-zinc-200">{step.title}</h3>
                            <p className="text-xs leading-6 text-ui-muted">{step.description}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
