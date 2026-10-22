export interface LeaveType {
  id: string;
  name: string;
  description: string;
  _rowIndex?: number;
}

export type CreateLeaveType = Omit<LeaveType, "id">;

export type CreateLeaveTypeInput = CreateLeaveType;

export type UpdateLeaveType = Partial<CreateLeaveType>;

export type UpdateLeaveTypeInput = Partial<CreateLeaveTypeInput>;
