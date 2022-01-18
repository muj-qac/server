export type DatabaseUserInterface = {
  readonly id: string;
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  details?: {
    program?: string;
    faculty?: string;
    school?: string;
    department?: string;
  };
  phone_number?: string;
  role: string[];
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
};


export type UserInterface = {
  readonly id: string;
  email: string;
  firstName: string;
  lastName?: string;
  isAdmin: boolean;
};
