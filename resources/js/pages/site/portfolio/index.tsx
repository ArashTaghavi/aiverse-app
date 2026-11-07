import { Head } from '@inertiajs/react';
import SiteLayout from '../../../Layouts/SiteLayout';
import ProfileIntro from './Components/ProfileIntro';
import ContactLinks from './Components/ContactLinks';
import SkillsSection from './Components/SkillsSection';
import { profile } from './Data/Portfolio';

export default function PortfolioPage() {
    return (
        <>
            <Head title={`${profile.name} | Software Developer`}>
                <meta
                    name="description"
                    content="Self-taught software developer exploring artificial intelligence, intelligent applications, and 3D graphics. Get in touch with Arash Taghavi."
                />
            </Head>
            <main className="mx-auto w-full max-w-[1440px] flex-1 px-5 sm:px-8">
                <h1 className="sr-only">
                    {profile.name} — Self-taught software developer
                </h1>
                <div className="mx-auto w-full max-w-3xl">
                    <ProfileIntro />
                </div>
                <SkillsSection />
                <ContactLinks />
            </main>
        </>
    );
}

PortfolioPage.layout = [
    SiteLayout,
    { className: 'bg-black selection:bg-sky-300/25' },
] satisfies [typeof SiteLayout, { className: string }];
