export const AnswerStatusEnum = {
    Pending: "PENDING",
    Processing: "PROCESSING",
    Completed: "COMPLETED",
    Failed: "FAILED",
} as const;

export type AnswerStatusEnum =
    (typeof AnswerStatusEnum)[keyof typeof AnswerStatusEnum];
