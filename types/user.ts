export enum UserRole {
  NORMAL = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2,
}

export interface User {
  name: string;
  role: UserRole;
}