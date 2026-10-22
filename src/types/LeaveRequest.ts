import type { Employee } from "./Employee";

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LeaveRequestReviewStatus = Exclude<
  LeaveRequestStatus,
  "PENDING"
>;

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: LeaveRequestStatus;
  reviewedBy: string;
  requestedAt: string;
  _rowIndex?: number;
}

export type LeaveRequestResponse = Omit<LeaveRequest, "leaveTypeId"> & {
  employee: (Pick<Employee, "email" | "phone"> & { name: string }) | null;
  reviewer: (Pick<Employee, "email" | "phone"> & { name: string }) | null;
  name: string;
  description: string;
};

export type CreateLeaveRequest = Omit<
  LeaveRequest,
  "id" | "status"
>;

export type CreateLeaveRequestInput = Omit<
  CreateLeaveRequest,
  "reviewedBy"
> & {
  reviewedBy?: string;
};

export type UpdateLeaveRequest = Partial<CreateLeaveRequest> & {
  status?: LeaveRequestStatus;
};

export type UpdateLeaveRequestInput = Partial<CreateLeaveRequestInput>;

export type ReviewLeaveRequestInput = {
  status?: unknown;
  reviewedBy?: string;
};
