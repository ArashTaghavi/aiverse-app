import {
    Check,
    FileCheck2,
    HardDriveUpload,
    Layers,
    FileText,
    LoaderCircle,
    MessageSquare,
    X,
    type LucideIcon,
} from "lucide-react";
import { useEcho } from "@laravel/echo-react";
import type {
    DocumentResponse,
    EmbeddingStatus,
} from "@/Modules/ChatWithDocument/Types";
import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import {
    show as chatWithDocument,
    status as documentStatus,
} from "@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController";

type UploadProgressEvent = {
    step: "UPLOAD" | "EMBEDDING" | "RESULT";
    status: "PROCESSING" | "COMPLETED" | "FAILED";
    data: {
        id: number;
        uuid: string;
        title: string;
        original_name: string;
        human_size: string;
        embedding_status: EmbeddingStatus;
        embedding_error: string | null;
    };
};

type UploadStep = UploadProgressEvent["step"];
type StepStatus = UploadProgressEvent["status"];

const statusLabels: Record<StepStatus, string> = {
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
};

const statusClasses: Record<StepStatus | "PENDING", string> = {
    PENDING: "border-white/10 bg-white/5 text-ui-muted",
    PROCESSING: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    COMPLETED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    FAILED: "border-red-400/30 bg-red-400/10 text-red-300",
};

const steps: {
    key: UploadStep;
    title: string;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        key: "UPLOAD",
        title: "Upload & save",
        description: "Store your file and its details.",
        icon: HardDriveUpload,
    },
    {
        key: "EMBEDDING",
        title: "Generate embeddings",
        description: "Prepare the contents for your questions.",
        icon: Layers,
    },
    {
        key: "RESULT",
        title: "Ready to chat",
        description: "Your document will be available here.",
        icon: FileCheck2,
    },
];

export default function PreparingUpload({
    userId,
    uploadAttempt,
    document,
    onClose,
}: {
    userId: number;
    uploadAttempt: number;
    document: DocumentResponse | null;
    onClose: () => void;
}) {
    const [statuses, setStatuses] = useState<
        Partial<Record<UploadStep, StepStatus>>
    >({});
    const [uploadedRecord, setUploadedRecord] = useState<
        UploadProgressEvent["data"] | null
    >(null);

    useEffect(() => {
        if (uploadAttempt > 0) {
            setStatuses({ UPLOAD: "processing" });
            setUploadedRecord(null);
        }
    }, [uploadAttempt]);

    useEffect(() => {
        if (!document) return;
        const documentUuid = document.uuid;
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout>;

        function update(snapshot: DocumentResponse) {
            const terminal =
                snapshot.embedding_status === "COMPLETED"
                    ? "completed"
                    : snapshot.embedding_status === "FAILED"
                      ? "failed"
                      : null;
            setUploadedRecord({
                ...snapshot,
                human_size: snapshot.size,
                embedding_error: null,
            });
            setStatuses({
                UPLOAD: "completed",
                EMBEDDING: terminal ?? "processing",
                ...(terminal ? { RESULT: terminal } : {}),
            });
            return terminal !== null;
        }

        async function poll() {
            try {
                const response = await fetch(documentStatus(documentUuid).url, {
                    headers: { Accept: "application/json" },
                    signal: controller.signal,
                });
                if (response.ok) {
                    const payload = (await response.json()) as {
                        data: DocumentResponse;
                    };
                    if (controller.signal.aborted) return;
                    if (update(payload.data)) return;
                }
            } catch {
                if (controller.signal.aborted) return;
            }
            if (!controller.signal.aborted) timer = setTimeout(poll, 5000);
        }

        if (!update(document)) void poll();
        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [document]);

    useEcho<UploadProgressEvent>(
        `chat-with-document.users.${userId}`,
        ".chat-with-document.upload.progress",
        (event) => {
            if (!document || event.data.id !== document.id) return;
            setUploadedRecord(event.data);
            setStatuses((current) => {
                const updated = { ...current, [event.step]: event.status };

                if (event.status === "completed") {
                    const stepIndex = steps.findIndex(
                        (step) => step.key === event.step,
                    );
                    const nextStep = steps[stepIndex + 1];

                    if (nextStep && !updated[nextStep.key]) {
                        updated[nextStep.key] = "processing";
                    }
                }

                return updated;
            });
        },
        [document?.id],
    );

    return (
        <section
            dir="ltr"
            aria-labelledby="preparing-upload-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#191923] p-4 shadow-xl shadow-black/10 sm:p-5"
        >
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-violet-300">
                    <FileText size={18} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <h2
                        id="preparing-upload-title"
                        className="text-base font-semibold text-zinc-100"
                    >
                        Preparing your file
                    </h2>
                    <p className="text-xs leading-5 text-ui-secondary">
                        Just a few moments before your first question.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close upload progress"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ui-muted transition hover:bg-white/5 hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
                >
                    <X size={18} aria-hidden="true" />
                </button>
            </div>

            <ol aria-live="polite" className="pt-4">
                {steps.map((step) => {
                    const status = statuses[step.key];
                    const colors = statusClasses[status ?? "PENDING"];
                    const Icon =
                        status === "completed"
                            ? Check
                            : status === "failed"
                              ? X
                              : status === "processing"
                                ? LoaderCircle
                                : step.icon;

                    return (
                        <li
                            key={step.key}
                            aria-current={
                                status === "processing" ? "step" : undefined
                            }
                            className={`group flex gap-3 transition-opacity ${!status ? "opacity-40" : "opacity-100"}`}
                        >
                            <div className="flex shrink-0 flex-col items-center">
                                <div
                                    className={`flex size-8 items-center justify-center rounded-lg border transition-colors ${colors} ${status === "processing" ? "ring-4 ring-violet-400/5" : ""}`}
                                >
                                    <Icon
                                        size={15}
                                        aria-hidden="true"
                                        className={
                                            status === "processing"
                                                ? "motion-safe:animate-spin"
                                                : undefined
                                        }
                                    />
                                </div>
                                <div
                                    aria-hidden="true"
                                    className={`my-2 w-px flex-1 transition-colors group-last:hidden ${status === "completed" ? "bg-emerald-400/30" : "bg-white/10"}`}
                                />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-1 pb-5 group-last:pb-0">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3
                                        className={`text-sm font-medium ${status === "completed" ? "text-emerald-300" : status === "failed" ? "text-red-300" : "text-zinc-200"}`}
                                    >
                                        {step.title}
                                    </h3>
                                    <span
                                        className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${colors}`}
                                    >
                                        {status
                                            ? statusLabels[status]
                                            : "Waiting"}
                                    </span>
                                </div>
                                {!(
                                    step.key === "RESULT" &&
                                    status === "completed"
                                ) && (
                                    <p className="text-xs leading-5 text-ui-muted">
                                        {step.description}
                                    </p>
                                )}
                                {step.key === "RESULT" &&
                                    status === "completed" &&
                                    uploadedRecord?.embedding_status ===
                                        "COMPLETED" && (
                                        <div className="mt-2 flex flex-col gap-3 overflow-hidden rounded-xl border border-emerald-400/20 bg-linear-to-br from-emerald-400/10 to-transparent p-3.5">
                                            <div className="flex items-center gap-2 text-emerald-300">
                                                <FileCheck2
                                                    size={18}
                                                    aria-hidden="true"
                                                />
                                                <span className="text-xs font-medium">
                                                    Document prepared
                                                    successfully
                                                </span>
                                            </div>
                                            <dl className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 text-sm">
                                                <div className="col-span-2 min-w-0">
                                                    <dt className="text-xs text-ui-muted">
                                                        Title
                                                    </dt>
                                                    <dd
                                                        dir="auto"
                                                        className="mt-0.5 font-medium break-words text-zinc-100"
                                                    >
                                                        {uploadedRecord.title}
                                                    </dd>
                                                </div>
                                                <div className="min-w-0">
                                                    <dt className="text-xs text-ui-muted">
                                                        File name
                                                    </dt>
                                                    <dd
                                                        dir="auto"
                                                        className="mt-0.5 text-xs break-words text-zinc-300"
                                                    >
                                                        {
                                                            uploadedRecord.original_name
                                                        }
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-ui-muted">
                                                        File size
                                                    </dt>
                                                    <dd className="mt-0.5 text-xs whitespace-nowrap text-zinc-300">
                                                        {
                                                            uploadedRecord.human_size
                                                        }
                                                    </dd>
                                                </div>
                                            </dl>
                                            <p className="border-t border-emerald-400/10 pt-3 text-xs leading-5 text-ui-secondary">
                                                Everything is ready. Start a
                                                conversation with your document.
                                            </p>
                                            <Link
                                                href={
                                                    chatWithDocument(
                                                        uploadedRecord.uuid,
                                                    ).url
                                                }
                                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
                                            >
                                                <MessageSquare
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                                Start chat
                                            </Link>
                                        </div>
                                    )}
                                {step.key === "RESULT" &&
                                    status === "failed" && (
                                        <p
                                            role="alert"
                                            className="text-sm leading-6 text-red-300"
                                        >
                                            We could not prepare your document.
                                            Please try again.
                                        </p>
                                    )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
