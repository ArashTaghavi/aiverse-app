import type { ReactNode } from "react";

export type QuestionValues = { question: string };

export type UserPageProps = {
    title: string;
    description?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    toolbar?: ReactNode;
    children?: ReactNode;
    fillHeight?: boolean;
};

export type UserLayoutProps = { children: ReactNode };
export type UserMainProps = { children: ReactNode; viewport?: boolean };
export type UserNavigationProps = { onNavigate?: () => void };
