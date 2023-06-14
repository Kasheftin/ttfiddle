import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { FiddleResponseDto } from './FiddleResponse.dto'

export class FiddleResponseWithTokenDto extends FiddleResponseDto {
  @ApiProperty({ type: String })
  @IsString()
  token: string
}
