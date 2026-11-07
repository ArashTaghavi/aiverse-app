import typewriterKey from '../../../../../assets/sounds/typewriter/key.mp3?url';
import typewriterSpace from '../../../../../assets/sounds/typewriter/space.mp3?url';
import brownPress from '../../../../../assets/sounds/typewriter/cherry-mx-brown-press.mp3?url';
import brownRelease from '../../../../../assets/sounds/typewriter/cherry-mx-brown-release.mp3?url';
import blueKey1 from '../../../../../assets/sounds/typewriter/cherry-mx-blue-key-1.mp3?url';
import blueKey2 from '../../../../../assets/sounds/typewriter/cherry-mx-blue-key-2.mp3?url';
import blueKey3 from '../../../../../assets/sounds/typewriter/cherry-mx-blue-key-3.mp3?url';
import blueKey4 from '../../../../../assets/sounds/typewriter/cherry-mx-blue-key-4.mp3?url';
import whitefoxKey1 from '../../../../../assets/sounds/typewriter/whitefox-hako-violet-key-1.mp3?url';
import whitefoxKey2 from '../../../../../assets/sounds/typewriter/whitefox-hako-violet-key-2.mp3?url';
import whitefoxKey3 from '../../../../../assets/sounds/typewriter/whitefox-hako-violet-key-3.mp3?url';
import whitefoxKey4 from '../../../../../assets/sounds/typewriter/whitefox-hako-violet-key-4.mp3?url';

export const keyboardSounds = [
    {
        id: 'typewriter',
        label: 'Hermes · Typewriter',
        type: [typewriterKey],
        space: [typewriterSpace],
        erase: [typewriterSpace],
    },
    {
        id: 'brown',
        label: 'Cherry MX Brown',
        type: [brownPress],
        space: [brownPress],
        erase: [brownRelease],
    },
    {
        id: 'blue',
        label: 'Cherry MX Blue',
        type: [blueKey1, blueKey2, blueKey3, blueKey4],
        space: [blueKey2],
        erase: [blueKey4],
    },
    {
        id: 'whitefox',
        label: 'WhiteFox · Hako Violet',
        type: [whitefoxKey1, whitefoxKey2, whitefoxKey3, whitefoxKey4],
        space: [whitefoxKey2],
        erase: [whitefoxKey4],
    },
] as const;

export type KeyboardSoundId = (typeof keyboardSounds)[number]['id'];
