import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS para permitir acesso do frontend
  app.enableCors({
    origin: [
      'http://localhost:3000', // Desenvolvimento local
      'http://localhost:3001',
      'http://localhost:4200', // Admin Angular local
      'https://ohana-sushi-delivery-git-development-danieltquadros-projects.vercel.app', // Frontend DEV
      'https://www.ohanasushidelivery.com.br', // Frontend PRD
      'https://ohanasushidelivery.com.br', // Frontend PRD (sem www)
      'https://ohana-admin.vercel.app', // Admin PRD
      'https://admin.ohanasushidelivery.com.br', // Admin PRD (subdomínio)
    ],
    credentials: true,
  });

  // Define prefixo global para rotas REST
  app.setGlobalPrefix('api');

  // Habilita validação automática em toda a aplicação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // Remove silenciosamente campos extras
      // Exemplo: se enviar { title: "X", hack: "bad" }
      //          Só passa { title: "X" }
      forbidNonWhitelisted: true,
      // Retorna erro 400 se houver campos extras
      // Mais seguro!
      transform: true,
      // Converte automaticamente tipos
      // URL: "/products/123" → id vira número 123
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
