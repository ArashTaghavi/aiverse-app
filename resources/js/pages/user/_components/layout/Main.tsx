import type { UserMainProps } from '@/types';
import styles from './Main.module.css';

export default function Main({ children, viewport = false }: UserMainProps) {
    return (
        <main
            id="dashboard-content"
            tabIndex={-1}
            className={`mx-auto flex w-full min-w-0 flex-1 flex-col outline-none ${viewport ? 'h-0 min-h-0 overflow-hidden p-3 sm:p-5 lg:p-6' : 'px-5 py-8 sm:px-8 sm:py-10 lg:px-10'}`}
        >
            <div
                className={`relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-ui-border bg-linear-to-br from-white/[0.035] via-[#111117] to-white/[0.015] shadow-[0_0_0_1px_#ffffff04,0_18px_45px_-20px_#00000080,inset_0_1px_0_#ffffff0d] ${viewport ? 'h-0 min-h-0' : 'gap-6 p-4 sm:p-6 lg:p-7'}`}
            >
                <div
                    aria-hidden="true"
                    className={`${styles.edgeShine} pointer-events-none absolute inset-x-6 top-0 z-10 h-px overflow-hidden bg-linear-to-r from-transparent via-violet-300 to-transparent shadow-[0_0_18px_2px_#8b5cf670]`}
                />
                {children}
            </div>
        </main>
    );
}
