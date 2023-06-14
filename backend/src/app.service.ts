import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import ShortUniqueId from 'short-unique-id'
import { CreateFiddleDto } from './dto/CreateFiddle.dto'
import { FiddleResponseWithTokenDto } from './dto/FiddleResponseWithToken.dto'
import { UpdateFiddleDto } from './dto/UpdateFiddle.dto'
import { CheckFiddleDto } from './dto/CheckFiddle.dto'
import { RecentFiddlesDto } from './dto/RecentFiddlesDto.dto'
import { FiddleResponseDto } from './dto/FiddleResponse.dto'

const uid = new ShortUniqueId()

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getFiddle(id: string, version?: number, includeToken = false) {
    const fiddle = await this.prisma.fiddle.findFirst({
      where: version ? { id, version } : { id },
      orderBy: { version: 'desc' }
    })
    if (!fiddle) {
      throw new NotFoundException('Fiddle not found')
    }
    if (!includeToken) {
      delete fiddle.token
    }
    return fiddle
  }

  async getRecentFiddlesByIds(body: RecentFiddlesDto) {
    const fiddles = await this.prisma.fiddle.findMany({
      where: {
        id: {
          in: body.ids.split('|')
        }
      },
      orderBy: {
        version: 'desc'
      }
    })
    const fiddlesByIds = fiddles.reduce((out: Record<string, FiddleResponseDto>, fiddle) => {
      if (!out[fiddle.id]) {
        delete fiddle.token
        out[fiddle.id] = fiddle
      }
      return out
    }, {})
    return Object.values(fiddlesByIds).sort((f1, f2) => f2.updatedAt - f1.updatedAt)
  }

  async createFiddle(body: CreateFiddleDto): Promise<FiddleResponseWithTokenDto> {
    const id = uid(6)
    const token = uid(10)
    const dt = Math.floor(Date.now() / 1000)
    await this.prisma.fiddle.create({
      data: {
        id,
        token,
        version: 1,
        code: body.code,
        createdAt: dt,
        updatedAt: dt
      }
    })
    return this.getFiddle(id, 1, true)
  }

  async forkFiddle(id: string, version?: number): Promise<FiddleResponseWithTokenDto> {
    const fiddle = await this.getFiddle(id, version)
    return this.createFiddle({ code: fiddle.code })
  }

  async checkToken(id: string, body: CheckFiddleDto): Promise<FiddleResponseWithTokenDto> {
    const fiddle = await this.getFiddle(id, undefined, true)
    if (fiddle.token !== body.token) {
      throw new ForbiddenException('Token is invalid')
    }
    return fiddle
  }

  async updateFiddle(id: string, body: UpdateFiddleDto): Promise<FiddleResponseWithTokenDto> {
    const fiddle = await this.checkToken(id, { token: body.token })
    const dt = Math.floor(Date.now() / 1000)
    await this.prisma.fiddle.create({
      data: {
        id,
        token: body.token,
        version: fiddle.version + 1,
        code: body.code,
        createdAt: dt,
        updatedAt: dt
      }
    })
    return this.getFiddle(id, fiddle.version + 1, true)
  }
}
