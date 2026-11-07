export const UploadStatusEnum = {
    Upload: "UPLOAD",
    Embedding: "EMBEDDING",
    Result: "RESULT",
};

export type UploadStatusEnum =
    (typeof UploadStatusEnum)[keyof typeof UploadStatusEnum];
