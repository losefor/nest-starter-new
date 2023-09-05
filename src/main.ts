import helmet from 'helmet';
import * as morgan from 'morgan';
import * as cors from 'cors';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    bufferLogs: true,
  });

  // Setup pjino logger as default
  app.useLogger(app.get(Logger));

  // Protect Swagger
  app.use(
    '/docs*',
    basicAuth({
      challenge: true,
      users: {
        admin: 'admin',
      },
    }),
  );

  // Setup logging
  app.use(morgan('dev'));

  // Setup cors
  app.use(cors());

  // Setup security headers
  app.use(helmet());

  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'version',
    defaultVersion: '1',
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Starter Docs')
      .setDescription('This swagger auto generated by nestjs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    app.enableCors();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT);
}
bootstrap();
