/** Serialize reloads and retain notifications received while streaming or reloading. */
export function createHistoryRefresh(load: () => Promise<void>, isPaused: () => boolean) {
    let dirty = false;
    let running = false;
    let disposed = false;
    let waiters: { resolve: () => void; reject: (error: unknown) => void }[] = [];

    async function drain() {
        if (running || disposed || isPaused()) return;
        running = true;
        try {
            while (dirty && !disposed && !isPaused()) {
                dirty = false;
                await load();
            }
        } catch (error) {
            dirty = false;
            const failed = waiters;
            waiters = [];
            failed.forEach(({ reject }) => reject(error));
        } finally {
            running = false;
            if (!dirty || disposed) {
                const completed = waiters;
                waiters = [];
                completed.forEach(({ resolve }) => resolve());
            }
        }
    }

    return {
        request() {
            if (disposed) return Promise.resolve();
            dirty = true;
            const finished = new Promise<void>((resolve, reject) =>
                waiters.push({ resolve, reject }),
            );
            void drain();
            return finished;
        },
        dispose() {
            disposed = true;
            dirty = false;
            waiters.forEach(({ resolve }) => resolve());
            waiters = [];
        },
    };
}

export function isHistoryTurnSettled(turn?: { answer_status: string; answer: string | null }) {
    return (
        turn?.answer_status === "FAILED" ||
        (turn?.answer_status === "COMPLETED" && Boolean(turn.answer?.trim()))
    );
}
