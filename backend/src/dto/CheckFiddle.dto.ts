import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CheckFiddleDto {
  @ApiProperty({ type: String })
  @IsString()
  token: string
}
