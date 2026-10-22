export type EmployeeStatus = "ACTIVE" | "RETIRED" | "ON_LEAVE";
export type EmploymentType = "PERMANENT" | "FIXED_TERM" | "APPRENTICE";
import type { Department } from "./Department";
import type { Position } from "./Position";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  positionId: string;
  _rowIndex?: number;
}

export type EmployeeResponse = Employee & {
  position: Pick<Position, "title" | "description" | "salaryBand"> | null;
  department: Pick<Department, "name" | "description"> | null;
  manager: Pick<Employee, "email" | "phone"> & { name: string } | null;
};

export type CreateEmployee = Omit<Employee, "id" | "status">;

export type CreateEmployeeInput = Omit<
  CreateEmployee,
  "phone" | "positionId"
> & {
  phone: number;
  positionId?: string;
};

export type UpdateEmployee = Partial<CreateEmployee> & {
  status?: EmployeeStatus;
};

export type UpdateEmployeeInput = Partial<
  Omit<CreateEmployeeInput, "phone">
> & {
  phone?: number;
};
