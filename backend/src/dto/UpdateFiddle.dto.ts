import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { CreateFiddleDto } from './CreateFiddle.dto'

export class UpdateFiddleDto extends CreateFiddleDto {
  @ApiProperty({ type: String })
  @IsString()
  code: string

  @ApiProperty({ type: String })
  @IsString()
  token: string
}
