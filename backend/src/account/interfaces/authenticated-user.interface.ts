export interface AuthenticatedUser {
  id: string;
  phone: string;
  role: string;
  name?: string | null;
  email?: string | null;
}