import { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ArrowLeft,
    Database,
    Plus,
    Send,
    Sparkles,
    UserRound,
} from 'lucide-react';
import { Form, Input } from '@/components/form';
import { Button } from '@/components/ui';
import type {
    AnalysisEvent,
    MessageTimeProps,
    DatabaseTurn as Turn,
    DatabaseConversation as Conversation,
    DatabaseAnalysisRequest as PendingRequest,
    DatabaseChatProps,
    QuestionValues,
} from '@/types';
import { questionSchema } from '../../_schemas/question.schema';
import { messageDate } from '../../chat-with-document/_lib/message-dates';
import styles from '../../chat-with-document/_components/MessageHistory.module.css';
import AnalysisProgress from './AnalysisProgress';
import AnalysisListener from './AnalysisListener';

function updateTurn(
    chats: Conversation[],
    request: PendingRequest,
    update: (turn: Turn) => Turn,
): Conversation[] {
    return chats.map((chat) =>
        chat.id === request.chatId
            ? {
                  ...chat,
                  turns: chat.turns.map((turn) =>
                      turn.id === request.turnId ? update(turn) : turn,
                  ),
              }
            : chat,
    );
}

function Time({ timestamp }: MessageTimeProps) {
    const date = messageDate(timestamp);
    return (
        <time
            dateTime={date.iso}
            title={date.full}
            className="mt-2 block text-right text-[10px] text-zinc-400"
        >
            {date.time}
        </time>
    );
}

export default function DatabaseChat({
    initialConversations = [],
    askAction,
}: DatabaseChatProps) {
    const { auth } = usePage().props;
    const [conversations, setConversations] =
        useState<Conversation[]>(initialConversations);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showList, setShowList] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(
        null,
    );
    const active = conversations.find((chat) => chat.id === activeId);
    const messagesRef = useRef<HTMLDivElement>(null);
    const requestLock = useRef(false);
    const isPending = processing || pendingRequest !== null;
    const form = useForm<QuestionValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: { query: '' },
    });

    useEffect(() => {
        const messages = messagesRef.current;
        if (messages) messages.scrollTop = messages.scrollHeight;
    }, [active, isPending]);

    useEffect(() => {
        if (!pendingRequest) return;
        const timeout = setTimeout(() => {
            setConversations((chats) =>
                updateTurn(chats, pendingRequest, (turn) => ({
                    ...turn,
                    error: 'The analysis timed out. Please try again.',
                })),
            );
            setPendingRequest(null);
            requestLock.current = false;
        }, 180_000);
        return () => clearTimeout(timeout);
    }, [pendingRequest]);

    function selectChat(id: string | null) {
        if (requestLock.current) return;
        setActiveId(id);
        setShowList(false);
        form.reset();
    }

    function handleAnalysisUpdate(event: AnalysisEvent) {
        if (!pendingRequest || pendingRequest.requestId !== event.request_id)
            return;
        setConversations((chats) =>
            updateTurn(chats, pendingRequest, (turn) => {
                if (event.type === 'progress')
                    return { ...turn, steps: [...turn.steps, event.data] };
                if (event.type === 'result')
                    return { ...turn, answer: event.data };
                return { ...turn, error: event.data.message };
            }),
        );
        if (event.type !== 'progress') {
            setPendingRequest(null);
            requestLock.current = false;
        }
    }

    const sendQuestion: SubmitHandler<QuestionValues> = (data) => {
        if (requestLock.current || !askAction) return;
        requestLock.current = true;
        const chatId = activeId ?? crypto.randomUUID();
        const turn: Turn = {
            id: crypto.randomUUID(),
            question: data.query,
            createdAt: new Date().toISOString(),
            steps: [],
        };
        const request = {
            requestId: crypto.randomUUID(),
            chatId,
            turnId: turn.id,
        };
        setPendingRequest(request);
        if (activeId) {
            setConversations((chats) =>
                chats.map((chat) =>
                    chat.id === chatId
                        ? { ...chat, turns: [...chat.turns, turn] }
                        : chat,
                ),
            );
        } else {
            const words = data.query.split(/\s+/);
            setConversations((chats) => [
                {
                    id: chatId,
                    title:
                        words.slice(0, 6).join(' ') +
                        (words.length > 6 ? '...' : ''),
                    turns: [turn],
                },
                ...chats,
            ]);
            setActiveId(chatId);
        }
        router.post(
            askAction().url,
            { ...data, request_id: request.requestId },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => form.reset(),
                onError: (errors) => {
                    setConversations((chats) =>
                        updateTurn(chats, request, (item) => ({
                            ...item,
                            error:
                                errors.query ??
                                errors.form ??
                                'Could not submit your question. Please try again.',
                        })),
                    );
                    setPendingRequest(null);
                    requestLock.current = false;
                },
                onCancel: () => {
                    setConversations((chats) =>
                        updateTurn(chats, request, (item) => ({
                            ...item,
                            error: 'Request cancelled.',
                        })),
                    );
                    setPendingRequest(null);
                    requestLock.current = false;
                },
            },
        );
    };

    return (
        <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
            {auth.user && (
                <AnalysisListener
                    userId={auth.user.id}
                    onUpdate={handleAnalysisUpdate}
                />
            )}
            <aside
                aria-label="Database conversations"
                className={`${showList ? 'flex' : 'hidden md:flex'} h-full min-h-0 w-full shrink-0 flex-col border-r border-ui-border bg-[#101016] md:w-64 xl:w-80`}
            >
                <div className="shrink-0 space-y-4 border-b border-ui-border p-5">
                    <h1 className="flex items-center gap-2 font-semibold">
                        <Database size={20} className="text-violet-300" />{' '}
                        Database chats
                    </h1>
                    <Button
                        fullWidth
                        size="sm"
                        onClick={() => selectChat(null)}
                        disabled={isPending}
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
                            No conversations yet. Ask a question to start.
                        </p>
                    )}
                    {conversations.map((chat) => {
                        const last = chat.turns.at(-1)!;
                        const preview = (last.answer?.text || last.question)
                            .trim()
                            .split(/\s+/);
                        return (
                            <button
                                key={chat.id}
                                type="button"
                                disabled={isPending}
                                onClick={() => selectChat(chat.id)}
                                aria-current={
                                    activeId === chat.id ? 'page' : undefined
                                }
                                className={`flex w-full gap-3 rounded-xl p-3 text-left transition focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-60 ${activeId === chat.id ? 'bg-violet-500/15 ring-1 ring-violet-400/20' : 'hover:bg-white/5'}`}
                            >
                                <Database
                                    size={18}
                                    className="mt-1 shrink-0 text-violet-300"
                                    aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1">
                                    <span
                                        dir="auto"
                                        className="block truncate text-sm text-zinc-200"
                                    >
                                        {chat.title}
                                    </span>
                                    <span
                                        dir="auto"
                                        className="mt-1 block truncate text-xs text-ui-secondary"
                                    >
                                        {preview.slice(0, 6).join(' ')}
                                        {preview.length > 6 ? '…' : ''}
                                    </span>
                                    <Time timestamp={last.createdAt} />
                                </span>
                            </button>
                        );
                    })}
                </nav>
                <p className="shrink-0 border-t border-ui-border px-5 py-3 text-[11px] text-ui-muted">
                    Chats are kept while this page is open.
                </p>
            </aside>
            <div
                className={`${showList ? 'hidden md:flex' : 'flex'} h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
            >
                <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#191923]/95 px-4 py-3 sm:px-6">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="md:hidden"
                        aria-label="Show conversations"
                        onClick={() => setShowList(true)}
                        startIcon={<ArrowLeft size={18} />}
                    />
                    <Database size={24} className="shrink-0 text-violet-300" />
                    <div className="min-w-0 flex-1">
                        <h2 dir="auto" className="truncate text-sm font-medium">
                            {active?.title ?? 'Database analyst'}
                        </h2>
                        <p className="mt-1 text-xs text-ui-muted">
                            Ask questions about your database
                        </p>
                    </div>
                </header>
                <div className="flex shrink-0 items-center gap-2 border-b border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-xs text-emerald-300">
                    <Database size={15} aria-hidden="true" /> Default database ·
                    SQLite
                </div>
                <div
                    ref={messagesRef}
                    role="log"
                    aria-label="Database conversation"
                    aria-live="polite"
                    aria-relevant="additions text"
                    className="h-0 min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#0d0e16] bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.11),transparent_60%)] px-2 py-3 sm:px-3"
                >
                    {!active && (
                        <div className="flex min-h-full flex-col items-center justify-center gap-4 px-4 py-10 text-center">
                            <span className="rounded-2xl border border-violet-300/20 bg-violet-400/10 p-4">
                                <Database
                                    size={32}
                                    className="text-violet-300"
                                />
                            </span>
                            <h2 className="text-xl font-semibold">
                                Chat with your database
                            </h2>
                            <p className="max-w-md text-sm leading-6 text-ui-secondary">
                                Ask in plain language. Get the SQL, an
                                explanation, and the query results.
                            </p>
                        </div>
                    )}
                    {active?.turns.map((turn) => (
                        <div key={turn.id} className="space-y-3">
                            <div
                                className={`${styles.bubble} ${styles.user} ml-auto w-fit max-w-[92%] rounded-3xl rounded-tr-md px-3 py-2.5 sm:max-w-[82%]`}
                            >
                                <p className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-200">
                                    <UserRound size={14} aria-hidden="true" />{' '}
                                    You
                                </p>
                                <p
                                    dir="auto"
                                    className="text-sm leading-7 break-words whitespace-pre-wrap"
                                >
                                    {turn.question}
                                </p>
                                <Time timestamp={turn.createdAt} />
                            </div>
                            {turn.steps.length > 0 && (
                                <AnalysisProgress
                                    steps={turn.steps}
                                    finished={!!turn.answer}
                                    failed={
                                        !!turn.error ||
                                        turn.answer?.success === false
                                    }
                                />
                            )}
                            {turn.answer && (
                                <div
                                    className={`${styles.bubble} ${styles.assistant} mr-auto max-w-[95%] min-w-0 space-y-3 rounded-3xl rounded-tl-md px-3 py-2.5 sm:max-w-[90%]`}
                                >
                                    <p className="flex items-center gap-2 text-xs font-medium text-sky-200">
                                        <Sparkles
                                            size={14}
                                            aria-hidden="true"
                                        />{' '}
                                        Assistant
                                    </p>
                                    <p
                                        dir="auto"
                                        className="text-sm leading-7 break-words whitespace-pre-wrap text-zinc-200"
                                    >
                                        {turn.answer.text}
                                    </p>
                                    <p
                                        dir="auto"
                                        className={`rounded-lg border px-3 py-2 text-xs leading-6 ${turn.answer.success ? 'border-emerald-300/20 bg-emerald-300/5 text-emerald-200' : 'border-red-300/20 bg-red-300/5 text-red-200'}`}
                                    >
                                        {turn.answer.success
                                            ? turn.answer.refined
                                                ? 'SQL was refined and executed again.'
                                                : 'SQL was reviewed and verified.'
                                            : 'SQL execution failed.'}
                                        {turn.answer.feedback && (
                                            <span className="mt-1 block">
                                                {turn.answer.feedback}
                                            </span>
                                        )}
                                    </p>
                                    <div className="grid min-w-0 gap-3 xl:grid-cols-2">
                                        <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#0b0d14]/80">
                                            <p className="border-b border-white/10 px-3 py-2 text-[10px] font-semibold tracking-wider text-zinc-400">
                                                Initial SQL
                                            </p>
                                            <pre
                                                dir="ltr"
                                                className="overflow-x-auto p-3 text-xs leading-6 text-zinc-300"
                                            >
                                                <code>
                                                    {turn.answer.initial_sql}
                                                </code>
                                            </pre>
                                        </div>
                                        <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#0b0d14]/80">
                                            <p className="border-b border-white/10 px-3 py-2 text-[10px] font-semibold tracking-wider text-violet-300">
                                                {turn.answer.refined
                                                    ? 'Refined SQL'
                                                    : 'Final SQL · Unchanged'}
                                            </p>
                                            <pre
                                                dir="ltr"
                                                className="overflow-x-auto p-3 text-xs leading-6 text-violet-200"
                                            >
                                                <code>{turn.answer.sql}</code>
                                            </pre>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/15">
                                        <p className="border-b border-white/10 px-3 py-2 text-[10px] font-semibold tracking-wider text-sky-200">
                                            RESULT
                                        </p>
                                        <pre
                                            dir="ltr"
                                            className="max-h-80 overflow-auto p-3 text-xs leading-6 text-zinc-200"
                                        >
                                            {turn.answer.result ||
                                                'No rows returned.'}
                                        </pre>
                                    </div>
                                    <Time timestamp={turn.createdAt} />
                                </div>
                            )}
                            {turn.error && (
                                <p
                                    role="alert"
                                    dir="auto"
                                    className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300"
                                >
                                    {turn.error}
                                </p>
                            )}
                        </div>
                    ))}
                    {isPending && !active?.turns.at(-1)?.steps.length && (
                        <p
                            role="status"
                            className="px-2 py-3 text-sm text-violet-300"
                        >
                            Connecting to the analysis stream…
                        </p>
                    )}
                </div>
                <Form
                    methods={form}
                    onSubmit={sendQuestion}
                    isPending={isPending}
                    className="flex shrink-0 items-end gap-3 border-t border-white/10 bg-[#191923]/95 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 [&>div]:min-w-0 [&>div]:flex-1"
                >
                    <Input<QuestionValues>
                        name="query"
                        label="Your question"
                        placeholder="Ask something about your database…"
                        disabled={!askAction || isPending}
                        autoComplete="off"
                        dir="auto"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="mb-1.5"
                        aria-label="Send question"
                        loading={isPending}
                        disabled={!askAction || isPending}
                        startIcon={<Send size={16} />}
                    />
                </Form>
            </div>
        </div>
    );
}
