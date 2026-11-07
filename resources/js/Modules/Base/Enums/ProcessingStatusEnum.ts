export const ProcessingStatusEnum = {
    Pending: "PENDING",
    Processing: "PROCESSING",
    Completed: "COMPLETED",
    Failed: "FAILED",
} as const;

export type ProcessingStatusEnum =
    (typeof ProcessingStatusEnum)[keyof typeof ProcessingStatusEnum];
