import type { ChatTurnResponse } from '@/Modules/ChatWithDocument/Types';

const timeZone = 'Asia/Tehran';
const dayFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});
const fullFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'full',
    timeStyle: 'short',
});

export function messageDate(timestamp: string) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return {
            day: 'unknown',
            label: 'Unknown date',
            time: '',
            full: '',
            iso: undefined,
        };
    }
    return {
        day: dayFormatter.format(date),
        label: dateFormatter.format(date),
        time: timeFormatter.format(date),
        full: fullFormatter.format(date),
        iso: date.toISOString(),
    };
}

export function groupMessagesByDay(turns: ChatTurnResponse[]) {
    const groups: { day: string; label: string; turns: ChatTurnResponse[] }[] =
        [];
    for (const turn of turns) {
        const { day, label } = messageDate(turn.created_at);
        const previous = groups.at(-1);
        if (previous?.day === day) previous.turns.push(turn);
        else groups.push({ day, label, turns: [turn] });
    }
    return groups;
}
