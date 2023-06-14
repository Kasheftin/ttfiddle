import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class RecentFiddlesDto {
  @ApiProperty({ type: String })
  @IsString()
  ids: string
}
