import { buildTypingTimeline, type TypingEvent } from '@/Modules/Base/Utils/TypingTimeline';

export const sendPause = 450;

export type DraftEvent = TypingEvent;

export function buildHumanDraft(
    text: string,
    start: number,
    correction: { word: string; typo: string },
) {
    const position = text.indexOf(correction.word);
    const segments =
        position < 0
            ? [{ text }]
            : [
                  { text: text.slice(0, position) },
                  { text: correction.typo, correction: correction.word },
                  { text: text.slice(position + correction.word.length) },
              ];
    return buildTypingTimeline(segments, start);
}

export type PreviewMessage = {
    text: string;
    user: boolean;
    draftStart: number;
    start: number;
    end: number;
    draftEvents?: readonly DraftEvent[];
};

export function previewText(
    message: PreviewMessage,
    elapsed: number,
    speed: number,
) {
    if (elapsed < message.start) return '';
    return message.user
        ? message.text
        : message.text.slice(
              0,
              Math.max(0, Math.floor((elapsed - message.start) / speed)),
          );
}

export function previewDraft(
    timeline: readonly PreviewMessage[],
    elapsed: number,
    speed: number,
) {
    const message = timeline.find(
        (item) =>
            item.user && elapsed >= item.draftStart && elapsed < item.start,
    );
    if (!message) return { text: '', sending: false };
    if (message.draftEvents?.length) {
        const event = message.draftEvents.findLast(
            (item) => item.at <= elapsed,
        );
        const finishedAt =
            message.draftEvents[message.draftEvents.length - 1].at;
        return { text: event?.text ?? '', sending: elapsed >= finishedAt };
    }
    const length = Math.max(
        0,
        Math.floor((elapsed - message.draftStart) / speed),
    );
    return {
        text: message.text.slice(0, length),
        sending: length >= message.text.length,
    };
}
