import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";

// Prisma returns BigInt ids, which JSON.stringify cannot serialise on its own.
Object.defineProperty(BigInt.prototype, "toJSON", {
  value: function (this: bigint) {
    return this.toString();
  },
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix("api");
  app.use(helmet());
  app.use(json({ limit: "50mb" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));
  app.enableCors({
    origin: true,
    methods: "GET, PUT, POST, DELETE, OPTIONS, PATCH",
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  });
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const options = new DocumentBuilder()
    .setTitle("Jason RTM API")
    .setDescription("Remote Therapeutic Monitoring API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, options),
  );

  const port = configService.get<number>("PORT") ?? 3000;
  await app.listen(port);
  console.log(`Server is up at: http://localhost:${port}/api`);
}

void bootstrap();
