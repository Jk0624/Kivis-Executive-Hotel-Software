import { SetMetadata } from '@nestjs/common';

// ==========================================
// ROLES DECORATOR
// ==========================================
export const Roles = (
  ...roles: string[]
) => SetMetadata(
  'roles',
  roles,
);