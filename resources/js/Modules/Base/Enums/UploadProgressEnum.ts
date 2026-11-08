export const UploadProgressEnum = {
    Upload: 'UPLOAD',
    Embedding: 'EMBEDDING',
    Result: 'RESULT',
} as const;

export type UploadProgressEnum =
    (typeof UploadProgressEnum)[keyof typeof UploadProgressEnum];
