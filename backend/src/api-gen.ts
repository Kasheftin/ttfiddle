import * as fs from 'fs'
import * as path from 'path'
import { exec } from './exec'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { getFromContainer, MetadataStorage } from 'class-validator'
import { validationMetadatasToSchemas } from 'class-validator-jsonschema'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const swaggerConfig = new DocumentBuilder()
    .setTitle(process.env.npm_package_name)
    .setVersion(process.env.npm_package_version)
    .build()

  await exec('rm -rf tmp')
  await exec('mkdir -p tmp')

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  const metadata = (getFromContainer(MetadataStorage) as any).validationMetadatas
  document.components.schemas = Object.assign(
    {},
    document.components.schemas || {},
    validationMetadatasToSchemas(metadata)
  )
  Object.values(document.components.schemas).forEach((schema) => {
    ;(schema as any).additionalProperties = false
  })

  await fs.promises.writeFile(
    path.join(__dirname, '..', 'tmp', 'api.json'),
    JSON.stringify(document)
  )

  await exec(
    'nswag openapi2tsclient /input:tmp/api.json /output:tmp/api.ts /template:Axios /operationGenerationMode:MultipleClientsFromOperationId /typeScriptVersion:3.8'
  )
  await exec('mv tmp/api.ts ../frontend/src/api')
  await exec('mv tmp/api.json ../frontend/src/api')
  await exec('rm -rf tmp')

  app.close()
  console.log('API successfully generated')
}
bootstrap()
