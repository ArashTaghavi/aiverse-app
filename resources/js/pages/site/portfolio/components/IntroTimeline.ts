import { buildTypingTimeline } from '@/Modules/Base/Utils/TypingTimeline';

export type IntroFrame = {
    at: number;
    greeting: string;
    story: string;
    phase: 'greeting' | 'zoom' | 'story' | 'done';
    key?: 'type' | 'erase' | 'space';
};

export function buildIntroTimeline(
    name: string,
    segments: readonly { text: string; correction?: string }[],
) {
    const greeting = `Hello, I'm ${name}.`;
    const frames: IntroFrame[] = [
        { at: 0, greeting: '', story: '', phase: 'greeting' },
    ];
    let at = 500;
    let typedGreeting = '';
    let story = '';
    for (const [index, character] of Array.from(greeting).entries()) {
        at += 100 + ((index * 17) % 70) + (character === ',' ? 220 : 0);
        typedGreeting += character;
        frames.push({
            at,
            greeting: typedGreeting,
            story,
            phase: 'greeting',
            key: character.trim() ? 'type' : 'space',
        });
    }
    at += 350;
    frames.push({ at, greeting, story, phase: 'zoom' });
    at += 1550;
    frames.push({ at, greeting, story, phase: 'story' });
    const storyEvents = buildTypingTimeline(segments, at);
    for (const event of storyEvents.slice(1)) {
        frames.push({
            at: event.at,
            greeting,
            story: event.text,
            phase: 'story',
            key: event.key,
        });
    }
    const last = storyEvents[storyEvents.length - 1];
    at = last.at;
    story = last.text;
    frames.push({ at: at + 400, greeting, story, phase: 'done' });
    return frames;
}
