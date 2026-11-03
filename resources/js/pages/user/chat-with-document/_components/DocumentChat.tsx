import { useEffect, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    FileText,
    MessageSquare,
    Plus,
    Send,
    Upload,
} from "lucide-react";
import { FileInput, Form, Input } from "@/components/form";
import { Button } from "@/components/ui";
import {
    ask,
    upload,
} from "@/actions/App/Http/Controllers/User/ChatWithDocumentController";
import { index as chatWithDocument } from "@/actions/App/Http/Controllers/User/ChatWithDocumentController";
import type {
    DocumentChatProps,
    NewChatFormValues,
    DocumentQuestionValues,
    EmbeddingStatus,
} from "@/types";
import DocumentEmbeddingListener from "./DocumentEmbeddingListener";
import MessageHistory from "./MessageHistory";
import { messageDate } from "../_lib/message-dates";
import { documentQuestionSchema } from "../_schemas/question.schema";
import { newChatSchema } from "../_schemas/new-chat.schema";
import PreparingUpload from "./PreparingUpload";

export default function DocumentChat({
    documentId = null,
    documents = [],
    selectedDocument = null,
    history: turns = [],
}: DocumentChatProps) {
    const { auth, errors } = usePage().props;
    const activeId = documentId;
    const selected =
        selectedDocument ??
        documents.find((item) => String(item.id) === activeId);
    const [embeddingStatuses, setEmbeddingStatuses] = useState<
        Record<number, EmbeddingStatus>
    >({});
    const embeddingStatus = selected
        ? (embeddingStatuses[selected.id] ?? selected.embedding_status)
        : undefined;
    const isDocumentReady = embeddingStatus === "COMPLETED";
    const active = selected
        ? { id: selected.id, title: selected.title }
        : undefined;
    const document = selected
        ? {
              document_id: selected.id,
              original_filename: selected.original_name,
          }
        : null;
    const conversations = documents.map((item) => ({
        id: String(item.id),
        title: item.title,
        preview: item.last_message,
        timestamp: item.created_at,
    }));
    const [showList, setShowList] = useState(false);
    const [uploadFormKey, setUploadFormKey] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [asking, setAsking] = useState(false);
    const error = errors.form;
    const messagesRef = useRef<HTMLDivElement>(null);
    const uploadForm = useForm<NewChatFormValues>({
        resolver: zodResolver(newChatSchema),
        defaultValues: { file: null, title: "" },
    });
    const questionForm = useForm<DocumentQuestionValues>({
        resolver: zodResolver(documentQuestionSchema),
        defaultValues: { question: "" },
    });

    useEffect(() => {
        const messages = messagesRef.current;
        if (messages) messages.scrollTop = messages.scrollHeight;
    }, [activeId, turns, asking]);

    function newChat() {
        if (uploading || asking) return;
        router.visit(chatWithDocument().url, { preserveScroll: true });
        setShowList(false);
        uploadForm.reset();
        setUploadFormKey((value) => value + 1);
        questionForm.reset();
    }

    const uploadDocument: SubmitHandler<NewChatFormValues> = (data) => {
        if (uploading || asking || !data.file) return;
        router.post(upload().url, data, {
            onStart: () => setUploading(true),
            onFinish: () => setUploading(false),
            onSuccess: () => {
                uploadForm.reset();
                setUploadFormKey((value) => value + 1);
            },
        });
    };

    const sendQuestion: SubmitHandler<DocumentQuestionValues> = (data) => {
        if (!document || !isDocumentReady || uploading || asking) return;
        router.post(
            ask().url,
            { document_id: document.document_id, ...data },
            {
                preserveScroll: true,
                onStart: () => setAsking(true),
                onFinish: () => setAsking(false),
                onSuccess: () => questionForm.reset(),
            },
        );
    };

    return (
        <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
            {auth.user && (
                <DocumentEmbeddingListener
                    userId={auth.user.id}
                    onUpdate={(id, status) => {
                        setEmbeddingStatuses((current) => ({
                            ...current,
                            [id]: status,
                        }));
                    }}
                />
            )}
            <aside
                aria-label="Conversations"
                className={`${showList ? "flex" : "hidden md:flex"} h-full min-h-0 w-full shrink-0 flex-col border-r border-ui-border bg-[#101016] md:w-64 xl:w-80`}
            >
                <div className="shrink-0 space-y-4 border-b border-ui-border p-5">
                    <h1 className="flex items-center gap-2 font-semibold">
                        <MessageSquare size={20} className="text-violet-300" />{" "}
                        Document chats
                    </h1>
                    <Button
                        fullWidth
                        size="sm"
                        onClick={newChat}
                        disabled={uploading || asking}
                        startIcon={<Plus size={16} />}
                    >
                        New chat
                    </Button>
                </div>
                <nav
                    aria-label="Chat history"
                    className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3"
                >
                    {conversations.length === 0 && (
                        <p className="p-3 text-xs text-ui-muted">
                            No conversations yet. Upload a document to start.
                        </p>
                    )}
                    {conversations.map((chat) => (
                        <Link
                            key={chat.id}
                            href={
                                chatWithDocument({
                                    query: { document_id: chat.id },
                                }).url
                            }
                            preserveScroll
                            aria-disabled={uploading || asking}
                            onClick={(event) => {
                                if (uploading || asking) {
                                    event.preventDefault();
                                    return;
                                }
                                setShowList(false);
                            }}
                            aria-current={
                                activeId === chat.id ? "page" : undefined
                            }
                            className={`flex w-full gap-3 rounded-xl p-3 text-left transition focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-60 ${activeId === chat.id ? "bg-violet-500/15 ring-1 ring-violet-400/20" : "hover:bg-white/5"}`}
                        >
                            <FileText
                                size={18}
                                className="mt-1 shrink-0 text-violet-300"
                                aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm text-zinc-200">
                                    {chat.title}
                                </span>
                                <span
                                    dir="auto"
                                    className="mt-1 block truncate text-xs text-ui-secondary"
                                >
                                    {chat.preview || "No messages yet"}
                                </span>
                                {chat.timestamp && (
                                    <time
                                        dateTime={chat.timestamp}
                                        title={messageDate(chat.timestamp).full}
                                        className="mt-1 block text-xs text-ui-muted"
                                    >
                                        {messageDate(chat.timestamp).time}
                                    </time>
                                )}
                            </span>
                        </Link>
                    ))}
                </nav>
            </aside>
            <div
                className={`${showList ? "hidden md:flex" : "flex"} h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
            >
                <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#191923]/95 px-4 py-3 shadow-sm shadow-black/20 sm:px-6">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="md:hidden"
                        aria-label="Show conversations"
                        onClick={() => setShowList(true)}
                        startIcon={<ArrowLeft size={18} />}
                    />
                    <FileText size={24} className="shrink-0 text-violet-300" />
                    <div className="min-w-0 flex-1">
                        <h2
                            className="truncate text-sm font-medium"
                            title={active?.title}
                        >
                            {active?.title ?? "New conversation"}
                        </h2>
                        <p className="mt-1 text-xs text-ui-muted">
                            {document
                                ? "Document ready · One document per chat"
                                : "Upload a Word document to begin"}
                        </p>
                    </div>
                </header>
                {!document ? (
                    <div className="flex min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8">
                        <Form
                            methods={uploadForm}
                            onSubmit={uploadDocument}
                            isPending={uploading}
                            className="m-auto w-full max-w-lg space-y-5 py-6"
                        >
                            <div className="space-y-2 text-center">
                                <FileText
                                    size={40}
                                    className="mx-auto text-violet-300"
                                />
                                <h2 className="text-xl font-semibold">
                                    Chat with your document
                                </h2>
                                <p className="text-sm text-ui-secondary">
                                    Upload once, then ask questions about its
                                    contents.
                                </p>
                            </div>
                            <Input<NewChatFormValues>
                                name="title"
                                label="Document name (required)"
                                placeholder="Give this conversation a name"
                                disabled={uploading}
                                dir="auto"
                            />
                            <FileInput<NewChatFormValues>
                                key={uploadFormKey}
                                name="file"
                                label="Word document"
                                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                disabled={uploading}
                                hint="One .docx file per conversation. The document cannot be replaced after upload."
                            />
                            <Button
                                type="submit"
                                loading={uploading}
                                startIcon={<Upload size={16} />}
                            >
                                Upload document
                            </Button>
                            <PreparingUpload />
                            {uploading && (
                                <p
                                    role="status"
                                    className="text-sm text-ui-secondary"
                                >
                                    Uploading and preparing your document…
                                </p>
                            )}
                        </Form>
                    </div>
                ) : (
                    <>
                        {document && (
                            <div className="flex shrink-0 items-center gap-3 border-b border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm">
                                <FileText
                                    size={20}
                                    className="shrink-0 text-emerald-300"
                                    aria-hidden="true"
                                />
                                <div className="min-w-0">
                                    <p
                                        className="truncate text-zinc-100"
                                        title={document.original_filename}
                                    >
                                        {document.original_filename}
                                    </p>
                                    <p className="mt-1 text-xs text-emerald-300">
                                        Document ready · Locked to this
                                        conversation
                                    </p>
                                </div>
                            </div>
                        )}
                        <div
                            ref={messagesRef}
                            role="log"
                            aria-label="Document conversation"
                            aria-live="polite"
                            aria-relevant="additions text"
                            className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[#0d0e16] bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.11),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.05),transparent_55%)] px-2 py-3 sm:px-3"
                        >
                            {turns.length === 0 && (
                                <p className="py-12 text-center text-sm text-ui-muted">
                                    {isDocumentReady
                                        ? "Your document is ready. Ask your first question below."
                                        : embeddingStatus === "FAILED"
                                          ? "We could not prepare this document."
                                          : "Processing your document?"}
                                </p>
                            )}
                            <MessageHistory turns={turns ?? []} />
                            {asking && (
                                <p
                                    role="status"
                                    className="text-sm text-violet-300"
                                >
                                    Reading your document and preparing an
                                    answer…
                                </p>
                            )}
                        </div>
                        <Form
                            methods={questionForm}
                            onSubmit={sendQuestion}
                            isPending={asking}
                            className="flex shrink-0 items-end gap-3 border-t border-white/10 bg-[#191923]/95 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.7)] sm:px-6 [&>div]:min-w-0 [&>div]:flex-1"
                        >
                            <Input<DocumentQuestionValues>
                                name="question"
                                label="Your question"
                                placeholder="Ask something about your document…"
                                disabled={!isDocumentReady || asking}
                                autoComplete="off"
                                dir="auto"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="mb-1.5"
                                aria-label="Send question"
                                loading={asking}
                                disabled={!isDocumentReady}
                                startIcon={<Send size={16} />}
                            ></Button>
                        </Form>
                    </>
                )}
                {error && (
                    <p
                        role="alert"
                        className="max-h-24 shrink-0 overflow-y-auto rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300"
                    >
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
