import { Head } from '@inertiajs/react';
import SiteLayout from '../../Layouts/SiteLayout';
import ProjectSlider from './home/components/ProjectSlider';

export default function Home() {
    return (
        <>
            <Head title="AI Projects | OpenLearnLab">
                <meta
                    name="description"
                    content="Explore eight AI experiences, from document chat to multi-agent workflows."
                />
            </Head>
            <main className="h-[calc(100dvh-var(--site-header-height,115px))] min-h-0 min-w-0 shrink-0 sm:h-[calc(100dvh-var(--site-header-height,79px))]">
                <ProjectSlider />
            </main>
        </>
    );
}

Home.layout = SiteLayout;
