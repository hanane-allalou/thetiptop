export interface User {
    id: number;
    name: string;
    email: string;
    role: "employee" | "admin" | "user";
    [key: string]: any;
  }
  