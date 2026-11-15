import type { ReactNode } from 'react';
import PublicSurface from '@/Pages/Site/Components/Background/PublicSurface';
import { cn } from '@/Modules/Base/Utils/Utils';
import SiteHeader from '../Pages/Site/Home/Components/SiteHeader';

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
