import styles from "./TypingIndicator.module.css";

export default function TypingIndicator() {
    return (
        <div role="status" className="flex items-center gap-3 py-1 text-xs text-sky-200/80">
            <span>
                Assistant is typing<span className="sr-only">…</span>
            </span>
            <span aria-hidden="true" className="flex items-center gap-1">
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
            </span>
        </div>
    );
}
