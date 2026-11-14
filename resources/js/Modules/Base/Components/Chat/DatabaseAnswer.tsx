import type { ReactNode } from 'react';

type DatabaseAnswerData = {
    sql: string;
    initial_sql?: string;
    text?: string;
    result: unknown;
    success: boolean;
    refined?: boolean;
    feedback?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

export function parseDatabaseAnswer(value: unknown): DatabaseAnswerData | null {
    const parsed = parseJson(value);
    if (
        !isRecord(parsed) ||
        typeof parsed.sql !== 'string' ||
        typeof parsed.success !== 'boolean' ||
        !Object.hasOwn(parsed, 'result')
    )
        return null;

    return {
        sql: parsed.sql,
        result: parseJson(parsed.result),
        success: parsed.success,
        initial_sql:
            typeof parsed.initial_sql === 'string'
                ? parsed.initial_sql
                : undefined,
        text: typeof parsed.text === 'string' ? parsed.text : undefined,
        refined: parsed.refined === true,
        feedback:
            typeof parsed.feedback === 'string' ? parsed.feedback : undefined,
    };
}

function displayValue(value: unknown): string {
    if (value === null) return 'NULL';
    if (value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string') return value;
    if (typeof value === 'function') return value.toString();
    if (
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'bigint' ||
        typeof value === 'symbol'
    )
        return String(value);
    return '';
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="min-w-0 space-y-2">
            <h3 className="text-xs font-semibold tracking-wide text-sky-200">
                {title}
            </h3>
            {children}
        </section>
    );
}

function SqlBlock({ sql }: { sql: string }) {
    return (
        <pre
            dir="ltr"
            className="max-h-64 max-w-full overflow-auto rounded-xl border border-white/10 bg-black/25 p-3 text-left font-mono text-xs leading-6 text-sky-100"
        >
            <code>{sql}</code>
        </pre>
    );
}

function QueryResult({ result }: { result: unknown }) {
    if (Array.isArray(result) && result.every(isRecord)) {
        if (result.length === 0) {
            return <p className="text-sm text-zinc-400">No rows returned.</p>;
        }
        const columns = [...new Set(result.flatMap((row) => Object.keys(row)))];
        return (
            <div className="space-y-2">
                <p className="text-xs text-zinc-400">
                    {result.length} rows returned
                </p>
                <div
                    tabIndex={0}
                    role="region"
                    aria-label="Query results"
                    className="max-h-96 max-w-full overflow-auto rounded-xl border border-white/10"
                >
                    <table
                        dir="ltr"
                        className="w-full border-collapse text-left text-xs"
                    >
                        <caption className="sr-only">Query results</caption>
                        <thead className="sticky top-0 bg-[#252b3b] text-sky-100">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column}
                                        scope="col"
                                        className="border-b border-white/10 px-3 py-2.5 font-semibold whitespace-nowrap"
                                    >
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((row, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-white/5 last:border-0 even:bg-white/3"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column}
                                            dir="auto"
                                            className="max-w-80 min-w-24 px-3 py-2 align-top break-words whitespace-pre-wrap text-zinc-200"
                                        >
                                            {displayValue(
                                                Object.hasOwn(row, column)
                                                    ? row[column]
                                                    : undefined,
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
    if (isRecord(result) && typeof result.affected_rows === 'number') {
        return (
            <div className="space-y-1 rounded-xl border border-emerald-300/15 bg-emerald-300/5 p-3">
                <p className="text-sm text-emerald-200">
                    {result.affected_rows >= 0
                        ? `${result.affected_rows} rows affected`
                        : 'Statement completed.'}
                </p>
                {typeof result.message === 'string' && (
                    <p dir="auto" className="text-xs text-zinc-300">
                        {result.message}
                    </p>
                )}
            </div>
        );
    }
    return (
        <pre
            dir="auto"
            className="max-h-96 overflow-auto rounded-xl bg-black/20 p-3 text-xs leading-6 break-words whitespace-pre-wrap text-zinc-200"
        >
            {typeof result === 'string'
                ? result || 'No result was returned.'
                : JSON.stringify(result, null, 2)}
        </pre>
    );
}

export default function DatabaseAnswer({
    answer,
}: {
    answer: DatabaseAnswerData;
}) {
    return (
        <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                <span
                    className={`rounded-full border px-2.5 py-1 ${answer.success ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : 'border-red-300/20 bg-red-300/10 text-red-200'}`}
                >
                    {answer.success ? 'Query executed' : 'Query failed'}
                </span>
                {answer.refined && (
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-amber-200">
                        SQL revised
                    </span>
                )}
            </div>
            {answer.text && (
                <Section title="Explanation">
                    <p
                        dir="auto"
                        className="text-sm leading-7 break-words whitespace-pre-wrap text-zinc-200"
                    >
                        {answer.text}
                    </p>
                </Section>
            )}
            <Section title={answer.refined ? 'Final SQL' : 'SQL'}>
                <SqlBlock sql={answer.sql} />
            </Section>
            <Section title={answer.success ? 'Result' : 'Execution error'}>
                {answer.success ? (
                    <QueryResult result={answer.result} />
                ) : (
                    <pre
                        dir="auto"
                        className="max-h-72 overflow-auto rounded-xl border border-red-300/20 bg-red-300/5 p-3 text-xs leading-6 break-words whitespace-pre-wrap text-red-200"
                    >
                        {displayValue(answer.result)}
                    </pre>
                )}
            </Section>
            {answer.feedback && (
                <Section title="Review">
                    <p
                        dir="rtl"
                        className="text-right text-sm leading-7 break-words whitespace-pre-wrap text-zinc-300"
                    >
                        {answer.feedback}
                    </p>
                </Section>
            )}
            {answer.refined &&
                answer.initial_sql &&
                answer.initial_sql !== answer.sql && (
                    <details className="min-w-0 rounded-xl border border-white/10 p-3">
                        <summary className="cursor-pointer text-xs font-medium text-zinc-400">
                            Original SQL
                        </summary>
                        <div className="mt-3">
                            <SqlBlock sql={answer.initial_sql} />
                        </div>
                    </details>
                )}
        </div>
    );
}
