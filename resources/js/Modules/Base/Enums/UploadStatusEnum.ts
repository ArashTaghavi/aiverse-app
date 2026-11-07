export const UploadStatusEnum = {
    Upload: "UPLOAD",
    Embedding: "EMBEDDING",
    Result: "RESULT",
} as const;

export type UploadStatusEnum =
    (typeof UploadStatusEnum)[keyof typeof UploadStatusEnum];
