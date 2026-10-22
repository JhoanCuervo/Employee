import { EmployeeRepository } from "../repositories/EmployeeRepository";
import type {
  Employee,
  EmployeeResponse,
  CreateEmployeeInput,
  UpdateEmployee,
  UpdateEmployeeInput,
} from "../types/Employee";

import {
  formatPhone,
  validateEmployeeStatus,
  validateEmploymentType,
  validateHireDate,
  validatePhone,
  validateRequiredString,
  validateString,
} from "../utils/employeeValidation";
import { ApiError, FieldValidationError } from "../utils/ApiError";
import { requireId } from "../utils/requireId";
import { formatEmployeeSummary } from "../utils/employeeFormatter";
import { formatDate } from "../utils/dateFormatter";

import { PositionRepository } from "../repositories/PositionRepository";
import { DepartmentRepository } from "../repositories/DepartmentRepository";
import type { Position } from "../types/Position";
import type { Department } from "../types/Department";
/** Aplica las reglas de negocio y validación para los empleados. */
class EmployeeService {
  private repository = new EmployeeRepository();
  private positionRepository = new PositionRepository();
  private departmentRepository = new DepartmentRepository();

  /** Trae todos los empleados y agrega la información de sus relaciones.
   * @returns {EmployeeResponse[]} Lista de empleados con cargo, departamento y líder.
   */
  getAll(): EmployeeResponse[] {
    const employees = this.repository.findAll();

    const positions = new Map(
      this.positionRepository.findAll().map((p) => [p.id, p]),
    );
    const departments = new Map(
      this.departmentRepository.findAll().map((d) => [d.id, d]),
    );
    const employeesById = new Map(employees.map((e) => [e.id, e]));

    return employees.map((employee) => {
      const position = employee.positionId
        ? (positions.get(employee.positionId) ?? null)
        : null;
      const department = position?.departmentId
        ? (departments.get(position.departmentId) ?? null)
        : null;

      const managerId = this.getManagerId(employee, department);
      const manager = managerId
        ? employeesById.get(managerId) ?? null
        : null;

      return this.toResponse(employee, position, department, manager);
    });
  }

  /** Busca un empleado por su identificador.
   * @param {string} id Identificador del empleado.
   * @returns {EmployeeResponse | null} Empleado encontrado o null si no existe.
   */
  getById(id: string): EmployeeResponse | null {
    requireId(id, "El ID del empleado");

    const employee = this.repository.findById(id);
    return employee ? this.withRelations(employee) : null;
  }

  /** Valida y guarda un empleado nuevo.
   * @param {CreateEmployeeInput} data Datos necesarios para crear el empleado.
   * @returns {EmployeeResponse} Empleado creado con sus relaciones.
   */
  create(data: CreateEmployeeInput): EmployeeResponse {
    const firstName = validateRequiredString(
      data.firstName,
      "firstName",
      "El nombre",
    );
    const lastName = validateRequiredString(
      data.lastName,
      "lastName",
      "El apellido",
    );
    const email = validateRequiredString(data.email, "email", "El correo");
    const phone = validatePhone(data.phone);
    const hireDate = validateHireDate(data.hireDate);
    const employmentType = validateEmploymentType(data.employmentType);
    const positionId =
      data.positionId === undefined
        ? ""
        : validateString(data.positionId, "positionId", "El cargo");

    const existing = this.repository
      .findAll()
      .some((employee) => employee.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      throw new ApiError(
        "CONFLICT",
        409,
        "Ya existe un empleado con ese correo",
        "email"
      );
    }

    const employee = this.repository.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: `'${formatPhone(phone)}`,
      hireDate,
      employmentType,
      positionId,
    });

    return this.withRelations(employee);
  }

  /** Valida y aplica los cambios indicados para un empleado.
   * @param {string} id Identificador del empleado que se actualizará.
   * @param {UpdateEmployeeInput} data Campos que se van a modificar.
   * @returns {EmployeeResponse | null} Empleado actualizado o null si no existe.
   */
  update(id: string, data: UpdateEmployeeInput): EmployeeResponse | null {
    requireId(id, "El ID del empleado");

    if ("id" in data) {
      throw new FieldValidationError("id", "No se puede modificar el ID");
    }

    const changes: UpdateEmployee = {};

    if (data.firstName !== undefined) {
      changes.firstName = validateRequiredString(
        data.firstName,
        "firstName",
        "El nombre",
      );
    }

    if (data.lastName !== undefined) {
      changes.lastName = validateRequiredString(
        data.lastName,
        "lastName",
        "El apellido",
      );
    }

    if (data.email !== undefined) {
      const email = validateRequiredString(data.email, "email", "El correo");
      if (
        this.repository
          .findAll()
          .some(
            (employee) =>
              employee.id !== id &&
              employee.email.toLowerCase() === email.toLowerCase(),
          )
      ) {
        throw new ApiError(
          "CONFLICT",
          409,
          "El correo ya pertenece a otro empleado",
          "email"
        );
      }
      changes.email = email.toLowerCase();
    }

    if (data.phone !== undefined) {
      changes.phone = `'${formatPhone(validatePhone(data.phone))}`;
    }

    if (data.hireDate !== undefined) {
      changes.hireDate = validateHireDate(data.hireDate);
    }

    if (data.employmentType !== undefined) {
      changes.employmentType = validateEmploymentType(data.employmentType);
    }

    if (data.positionId !== undefined) {
      changes.positionId = validateString(
        data.positionId,
        "positionId",
        "El cargo",
      );
    }

    const employee = this.repository.update(id, changes);
    return employee ? this.withRelations(employee) : null;
  }

  /** Cambia el estado de un empleado.
   * @param {string} id Identificador del empleado.
   * @param {unknown} status Estado: ACTIVE, RETIRED u ON_LEAVE.
   * @returns {EmployeeResponse | null} Empleado actualizado o null si no existe.
   */
  changeStatus(
    id: string,
    status: unknown
  ): EmployeeResponse | null {
    requireId(id, "El ID del empleado");

    const newStatus = validateEmployeeStatus(status);

    const employee = this.repository.update(id, { status: newStatus });
    return employee ? this.withRelations(employee) : null;
  }

  /** Elimina un empleado usando su identificador.
   * @param {string} id Identificador del empleado.
   * @returns {boolean} true si se eliminó; false si no se encontró.
   */
  delete(id: string): boolean {
    requireId(id, "El ID del empleado");

    return this.repository.delete(id);
  }

  /** Completa los datos del empleado con cargo, departamento y líder.
   * @param {Employee} employee Registro base del empleado.
   * @returns {EmployeeResponse} Empleado junto con la información relacionada.
   */
  private withRelations(employee: Employee): EmployeeResponse {
    //Busca información del cargo
    const position = employee.positionId
      ? this.positionRepository.findById(employee.positionId)
      : null;

    //Busca información del departamento
    const department = position?.departmentId
      ? this.departmentRepository.findById(position.departmentId)
      : null;

    //Busca información del lider managerEmployeeId
    const managerId = this.getManagerId(employee, department);

    const manager = managerId
      ? this.repository.findById(managerId)
      : null;

    return this.toResponse(employee, position, department, manager);
  }

  /** Devuelve el ID del líder del empleado, o null si no tiene
   * o si el líder del departamento es el propio empleado.
   * @param {Employee} employee Empleado consultado.
   * @param {Department | null | undefined} department Departamento del empleado.
   * @returns {string | null} ID del líder o null.
   */
  private getManagerId(
    employee: Employee,
    department: Department | null | undefined,
  ): string | null {
    const managerId = department?.managerEmployeeId?.trim();

    if (!managerId || managerId === employee.id.trim()) {
      return null;
    }

    return managerId;
  }

  private toResponse(
    employee: Employee,
    position: Position | null,
    department: Department | null,
    manager: Employee | null,
  ): EmployeeResponse {
    const { _rowIndex, ...base } = employee;

    return {
      ...base,
      hireDate: formatDate(employee.hireDate),
      position: position
        ? {
            title: position.title,
            description: position.description,
            salaryBand: position.salaryBand,
          }
        : null,
      department: department
        ? { name: department.name, description: department.description }
        : null,
      manager: formatEmployeeSummary(manager),
    };
  }
}

export default EmployeeService;
