import { BadRequestException, Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { FiddleResponseDto } from './dto/FiddleResponse.dto'
import { ApiResponse } from '@nestjs/swagger'
import { FiddleResponseWithTokenDto } from './dto/FiddleResponseWithToken.dto'
import { CreateFiddleDto } from './dto/CreateFiddle.dto'
import { UpdateFiddleDto } from './dto/UpdateFiddle.dto'
import { CheckFiddleDto } from './dto/CheckFiddle.dto'
import { RecentFiddlesDto } from './dto/RecentFiddlesDto.dto'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('fiddles/:id')
  @ApiResponse({ status: 200, type: FiddleResponseDto })
  getLastFiddleById(@Param('id') id: string): Promise<FiddleResponseDto> {
    return this.appService.getFiddle(id)
  }

  @Patch('recent-fiddles')
  @ApiResponse({ status: 200, type: FiddleResponseDto, isArray: true })
  getRecentFiddlesByIds(@Body() body: RecentFiddlesDto): Promise<FiddleResponseDto[]> {
    return this.appService.getRecentFiddlesByIds(body)
  }

  @Get('fiddles/:id/:version')
  @ApiResponse({ status: 200, type: FiddleResponseDto })
  getFiddleByIdAndVersion(
    @Param('id') id: string,
    @Param('version') version: string
  ): Promise<FiddleResponseDto> {
    if (version && !isNaN(Number(version))) {
      return this.appService.getFiddle(id, Number(version))
    } else {
      throw new BadRequestException('Version is invalid')
    }
  }

  @Post('fiddles')
  @ApiResponse({ status: 201, type: FiddleResponseWithTokenDto })
  createFiddle(@Body() body: CreateFiddleDto): Promise<FiddleResponseWithTokenDto> {
    return this.appService.createFiddle(body)
  }

  @Patch('fiddles/:id/check')
  @ApiResponse({ status: 200, type: FiddleResponseWithTokenDto })
  checkToken(
    @Param('id') id: string,
    @Body() body: CheckFiddleDto
  ): Promise<FiddleResponseWithTokenDto> {
    return this.appService.checkToken(id, body)
  }

  @Post('fiddles/:id/:version/fork')
  @ApiResponse({ status: 201, type: FiddleResponseWithTokenDto })
  forkFiddleVersion(
    @Param('id') id: string,
    @Param('version') version: string
  ): Promise<FiddleResponseWithTokenDto> {
    if (version && !isNaN(Number(version))) {
      return this.appService.forkFiddle(id, Number(version))
    } else {
      throw new BadRequestException('Version is invalid')
    }
  }

  @Post('fiddles/:id/fork')
  @ApiResponse({ status: 201, type: FiddleResponseWithTokenDto })
  forkFiddle(@Param('id') id: string): Promise<FiddleResponseWithTokenDto> {
    return this.appService.forkFiddle(id)
  }

  @Patch('fiddles/:id')
  @ApiResponse({ status: 200, type: FiddleResponseWithTokenDto })
  updateFiddle(
    @Param('id') id: string,
    @Body() body: UpdateFiddleDto
  ): Promise<FiddleResponseWithTokenDto> {
    return this.appService.updateFiddle(id, body)
  }
}
