import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('GPT')
    .setDescription('GPT')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('default')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT, '0.0.0.0');
  console.log(`LISTEN ON PROT : ${PORT}`);
  console.log(`${await app.getUrl()}/docs`);
}

bootstrap();
