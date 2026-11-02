import { useEcho } from '@laravel/echo-react';
import { useEffect, useRef } from 'react';
import { analysisEventSchema } from '../_schemas/analysis.schema';
import type { AnalysisListenerProps } from '@/types';

export default function AnalysisListener({
    userId,
    onUpdate,
}: AnalysisListenerProps) {
    const handler = useRef(onUpdate);
    useEffect(() => {
        handler.current = onUpdate;
    }, [onUpdate]);

    useEcho<unknown>(
        `database-analyst.users.${userId}`,
        '.database-analyst.analysis.updated',
        (payload) => {
            const event = analysisEventSchema.safeParse(payload);
            if (event.success) handler.current(event.data);
        },
    );

    return null;
}
