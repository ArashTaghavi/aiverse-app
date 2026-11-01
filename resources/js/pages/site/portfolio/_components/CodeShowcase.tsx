import styles from '../Portfolio.module.css';

const source = `import { retrieve, generate } from "./ai";

async function answer(question: string) {
  const sources = await retrieve(question);

  const response = await generate({
    question,
    context: sources,
    includeCitations: true,
  });

  return { answer: response.text, sources };
}`;

function highlight(line: string) {
    return line
        .split(
            /("[^"\n]*"|\b(?:import|from|async|function|const|await|return|true|string)\b)/g,
        )
        .map((token, index) => {
            const color = token.startsWith('"')
                ? 'text-emerald-200'
                : /^(import|from|async|function|const|await|return)$/.test(
                        token,
                    )
                  ? 'text-violet-200'
                  : /^(true|string)$/.test(token)
                    ? 'text-amber-200'
                    : 'text-zinc-100';
            return (
                <span key={index} className={color}>
                    {token}
                </span>
            );
        });
}

export default function CodeShowcase() {
    return (
        <div
            className="min-w-0 py-8 lg:py-12"
            aria-label="TypeScript example: retrieve context and generate an answer with sources"
        >
            <p className="mb-6 pl-8 font-mono text-[10px] tracking-[0.14em] text-zinc-400">
                knowledge.ts / TYPESCRIPT
            </p>
            <pre className="font-mono text-[11px] leading-7 sm:text-xs xl:text-[13px]">
                <code>
                    {source.split('\n').map((line, index) => (
                        <span
                            key={index}
                            className={`${styles.codeLine} flex`}
                            style={{ animationDelay: `${index * 0.2 + 0.4}s` }}
                        >
                            <span
                                aria-hidden="true"
                                className="mr-4 w-4 shrink-0 text-right text-zinc-500"
                            >
                                {index + 1}
                            </span>
                            <span className="min-w-0 wrap-anywhere whitespace-pre-wrap">
                                {highlight(line) || ' '}
                            </span>
                        </span>
                    ))}
                </code>
            </pre>
        </div>
    );
}
