import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard para verificar se usuário tem role adequada
 *
 * Uso em conjunto com JwtAuthGuard:
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('SUPER_ADMIN', 'ADMIN')
 *
 * Funcionamento:
 * 1. Extrai roles permitidas do metadata (@Roles())
 * 2. Se não houver roles definidas, permite acesso
 * 3. Se houver roles, verifica se user.role está na lista
 * 4. Usuário vem de req.user (populado pelo JwtAuthGuard)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Buscar roles permitidas do metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há roles definidas, permite acesso
    if (!requiredRoles) {
      return true;
    }

    // Extrair usuário da request (populado pelo JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Verificar se user.role está nas roles permitidas
    return requiredRoles.some((role) => user.role === role);
  }
}
