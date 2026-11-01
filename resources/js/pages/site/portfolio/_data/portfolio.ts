// Replace this sample content with your own details.
export const learningSegments = [
    { text: "I'm a " },
    { text: 'self-taugh', correction: 'self-taught' },
    { text: ' software developer with years of experience, driven by ' },
    { text: 'curiosty', correction: 'curiosity' },
    {
        text: " and a passion for technology. Recently, I've been exploring Artificial ",
    },
    { text: 'Intellignece', correction: 'Intelligence' },
    {
        text: " and building intelligent applications. I'm also passionate about 3D graphics, working with ",
    },
    { text: 'Bledner', correction: 'Blender' },
    { text: ' and Unreal Engine to bring creative ideas to life.' },
];

export const profile = {
    name: 'Arash',
    // Put your photo in public/ and set this to its path, e.g. "/profile.jpg".
    photo: '',
    role: 'Full-stack developer & AI builder',
    availability: 'Open to interesting projects',
    phone: '+989190130120',
    email: 'arash.taghavi69@gmail.com',
    linkedin: 'arash-taghavi',
    introduction:
        'I turn complex ideas into calm, intuitive digital experiences. A little design thinking, a lot of thoughtful engineering.',
    about: 'I enjoy the space where good design meets useful technology. My focus is on building things that feel simple on the surface, with solid engineering underneath — from a carefully crafted interface to the AI systems behind it.',
};

export const projects = [
    {
        title: 'A conversation with your knowledge.',
        name: 'Document intelligence',
        type: 'AI experience',
        visual: 'documents',
        description:
            'An intuitive way to explore documents, ask better questions, and trace every answer to its source.',
        stack: ['Next.js', 'Python', 'RAG'],
        detail: 'Documents are parsed into searchable chunks. Retrieval finds relevant context, and the response includes citations so the source is always one click away.',
    },
    {
        title: 'Less querying. More understanding.',
        name: 'Natural language analytics',
        type: 'Data application',
        visual: 'analytics',
        description:
            'Plain-language questions become validated SQL and clear insights, with the complexity kept behind the scenes.',
        stack: ['TypeScript', 'PostgreSQL', 'FastAPI'],
        detail: 'A read-only query workflow translates a question into SQL, validates the query, and presents the results in a compact visual interface.',
    },
    {
        title: 'One goal. A team of possibilities.',
        name: 'Multi-agent workspace',
        type: 'Intelligent workflow',
        visual: 'agents',
        description:
            'A focused workspace where specialized agents coordinate research, review, and delivery.',
        stack: ['Python', 'Agent orchestration', 'React'],
        detail: 'A supervisor delegates tasks to specialized agents. Shared context and a review step keep the work coordinated from the initial request to the final result.',
    },
] as const;

export const skillGroups = [
    {
        id: 'backend',
        number: '01',
        title: 'Backend Development',
        description: 'APIs, services & application logic.',
        skills: ['Python', 'PHP', 'FastAPI', 'Laravel', 'WebSocket'],
    },
    {
        id: 'frontend',
        number: '02',
        title: 'Frontend Development',
        description: 'Interfaces that connect people and ideas.',
        skills: [
            'JavaScript',
            'TypeScript',
            'React',
            'Next.js',
            'Tailwind CSS',
        ],
    },
    {
        id: 'databases',
        number: '03',
        title: 'Databases',
        description: 'Structured data & reliable foundations.',
        skills: ['PostgreSQL', 'MySQL', 'SQL Server'],
    },
    {
        id: 'devops',
        number: '04',
        title: 'DevOps & Operating Systems',
        description: 'From local development to deployment.',
        skills: ['Linux', 'Docker', 'Kubernetes', 'Git', 'CI/CD'],
    },
    {
        id: 'ai',
        number: '05',
        title: 'AI & Machine Learning',
        description: 'Exploring data. Building intelligent applications.',
        skills: [
            'Classical Machine Learning',
            'Deep Learning',
            'Computer Vision',
            'EDA',
            'RAG',
            'AI Agents',
            'Scikit-learn',
            'TensorFlow',
        ],
    },
] as const;

export const creativeInterests = {
    title: '3D & Game Development',
    description:
        'A creative playground for worlds, visuals, and interactive ideas.',
    skills: ['Blender', 'Unreal Engine'],
} as const;
