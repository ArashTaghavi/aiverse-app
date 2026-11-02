import type { ReactNode } from 'react';
import type { z } from 'zod';
import type { questionSchema } from '@/pages/user/_schemas/question.schema';

export type QuestionValues = z.infer<typeof questionSchema>;

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
