import type { ReactNode } from 'react';
import PublicSurface from '@/components/ui/background/PublicSurface';
import { cn } from '@/lib/utils';
import SiteHeader from './home/_components/SiteHeader';

type SiteLayoutProps = {
    children: ReactNode;
    className?: string;
};

export default function SiteLayout({ children, className }: SiteLayoutProps) {
    return (
        <PublicSurface>
            <div
                id="top"
                className={cn(
                    'relative isolate flex min-h-screen w-full flex-col',
                    className,
                )}
            >
                <SiteHeader />
                {children}
            </div>
        </PublicSurface>
    );
}
