import type { Employee } from "../types/Employee";

export type EmployeeSummary = Pick<Employee, "email" | "phone"> & {
  name: string;
};

/** Arma el resumen de un empleado que se expone en las respuestas.
 * @param {Employee | null} employee Empleado que se quiere resumir.
 * @returns {EmployeeSummary | null} Resumen del empleado o null si no existe.
 */
export const formatEmployeeSummary = (
  employee: Employee | null
): EmployeeSummary | null => {
  if (!employee) {
    return null;
  }

  return {
    email: employee.email ?? null,
    phone: employee.phone ?? null,
    name: `${employee.firstName} ${employee.lastName}`.trim(),
  };
};
