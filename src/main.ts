import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
