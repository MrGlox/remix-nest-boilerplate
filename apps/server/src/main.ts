import { join } from "node:path";


import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { getPublicDir, startDevServer } from "@repo/web";

import { urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import { WinstonModule } from "nest-winston";
import passport from "passport";
import * as winston from "winston";

import RedisStore from "connect-redis";
import Redis from "ioredis";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./core/exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
              return process.env.NODE_ENV === "production"
                ? `${timestamp} [${level}]: ${message}`
                : `[${level}]: ${message}`;
            }),
          ),
        }),
      ],
    }),
    rawBody: true,
    bodyParser: true,
  });

  await startDevServer(app);

  // Initialize client
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const redisClient = new Redis(redisUrl, {})

  // Initialize store
  const redisStore = new RedisStore({
    client: redisClient,
    ttl: 86400 * 30,
  });

  const config = new DocumentBuilder()
    .setTitle("Cats example")
    .setDescription("The cats API description")
    .setVersion("1.0")
    .addTag("cats")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  app.set("trust proxy", 1);

  app.use(
    session({
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: process.env.SESSION_SECRET || "123",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    }),
  );

  app.useStaticAssets(join(__dirname, "..", "public"), {
    prefix: "/public/",
  });

  app.useStaticAssets(getPublicDir(), {
    immutable: true,
    maxAge: "1y",
    index: false,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(cookieParser());

  app.use("/auth", urlencoded({ extended: true }));
  app.use("/auth/logout", urlencoded({ extended: true }));

  app.use("/auth/google", urlencoded({ extended: true }));
  app.use("/auth/google/callback", urlencoded({ extended: true }));

  const selectedPort = process.env.PORT ?? 3000;
  await app.listen(selectedPort);
}
bootstrap();
