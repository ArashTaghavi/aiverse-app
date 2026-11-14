import type { ReactNode } from 'react';
import PublicSurface from '@/pages/site/components/background/PublicSurface';
import { cn } from '@/Modules/Base/Utils/Utils';
import SiteHeader from '../pages/site/home/components/SiteHeader';

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
