import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateFiddleDto {
  @ApiProperty({ type: String })
  @IsString()
  code: string
}
