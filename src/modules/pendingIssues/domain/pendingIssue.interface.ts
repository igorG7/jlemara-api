export type PendingStatus =
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELED";

export type PendingIssueLogType = {
    status: PendingStatus;
    date: Date;
    note: string;
};

export type PendingUserIssueType = {
    userID: string;
    title: string;
    description: string;
    date: Date;
    reference: string;
    dueDate: Date;
    status: PendingStatus;
    log: PendingIssueLogType[];
    createdAt: Date;
    updatedAt: Date;
};