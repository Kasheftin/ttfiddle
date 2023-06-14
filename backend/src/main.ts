import { NestFactory } from '@nestjs/core'
import { PrismaService } from 'nestjs-prisma'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: 'http://localhost:5173'
  })

  await app.listen(process.env.POST || 3000)
  console.log(`App started on ${process.env.PORT || 3000}`)

  const prismaService = app.get(PrismaService)
  await prismaService.enableShutdownHooks(app)
}
bootstrap()
