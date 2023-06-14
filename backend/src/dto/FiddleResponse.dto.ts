import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class FiddleResponseDto {
  @ApiProperty({ type: String })
  @IsString()
  id: string

  @ApiProperty({ type: Number })
  @IsNumber()
  version: number

  @ApiProperty({ type: String })
  @IsString()
  code: string

  @ApiProperty({ type: Number })
  @IsNumber()
  createdAt: number

  @ApiProperty({ type: Number })
  @IsNumber()
  updatedAt: number
}
