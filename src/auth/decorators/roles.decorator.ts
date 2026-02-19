import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para definir roles permitidas em um endpoint
 *
 * @example
 * ```typescript
 * @Roles('SUPER_ADMIN', 'ADMIN')
 * @Post()
 * create() {}
 * ```
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
