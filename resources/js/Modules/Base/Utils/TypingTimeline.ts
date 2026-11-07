export type TypingEvent = {
    at: number;
    text: string;
    key?: "type" | "space" | "erase";
};

// Shared by the portfolio introduction and document-chat user drafts.
export function buildTypingTimeline(
    segments: readonly { text: string; correction?: string }[],
    start = 0,
) {
    const events: TypingEvent[] = [{ at: start, text: "" }];
    let at = start;
    let text = "";
    function type(value: string) {
        for (const character of value) {
            at +=
                80 +
                ((text.length * 13) % 85) +
                (/[,.]/.test(character) ? 280 : 0);
            text += character;
            events.push({ at, text, key: character.trim() ? "type" : "space" });
        }
    }
    for (const segment of segments) {
        type(segment.text);
        if (segment.correction === undefined) continue;
        at += 650;
        let common = 0;
        while (
            common < segment.text.length &&
            common < segment.correction.length &&
            segment.text[common] === segment.correction[common]
        )
            common++;
        for (let index = segment.text.length; index > common; index--) {
            at += 80;
            text = text.slice(0, -1);
            events.push({ at, text, key: "erase" });
        }
        at += 200;
        type(segment.correction.slice(common));
    }
    return events;
}
