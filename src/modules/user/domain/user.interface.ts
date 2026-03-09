export type UserRole =
    | "ASSISTANT" // Assistente | 0
    | "CONSULTANT" // Consultor  | 1
    | "BROKER" // Corretor   | 2
    | "SUPERVISOR" // Supervisor | 2
    | "COORDINATOR" // Coordenador| 4
    | "MANAGER" // Gerente    | 5
    | "DIRECTOR"; // Diretor    | 6

export type UserDepartment =
    | "CRC" // Customer Relationship Center
    | "LEGAL" // Jurídico
    | "INVENTORY" // Estoque
    | "SALES" // Vendas
    | "OPERATIONS"; // Operações

export interface UserType {
    _id?: string;
    uau_id: string;
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: UserRole;
    department?: UserDepartment;
    company?: string;
    teamId?: string;
    isActive?: boolean;
    isExternal?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    lastAccessAt?: Date;
}