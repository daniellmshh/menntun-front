import type { UserRole } from "@/types";

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    users: number;
  };
}

export interface SchoolModule {
  module: string;
  active: boolean;
  isCore: boolean;
}

export interface SchoolUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  active: boolean;
}

export type SchoolDetailTab = "general" | "modules" | "users";
