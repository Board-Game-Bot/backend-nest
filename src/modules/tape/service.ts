import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateTapeDto, DeleteTapeDto, RequestMyTapeDto, RequestTapeDto, UploadDto } from './dtos';
import { Participant, Tape } from '@/entity';

@Injectable()
export class TapeService {
  @InjectRepository(Tape)
    tapeDao: Repository<Tape>;
  @InjectRepository(Participant)
    participantDao: Repository<Participant>;

  dataSource: DataSource;

  async upload(userId: string, dto: UploadDto) {
    try {
      await this.tapeDao.insert({
        userId,
        ...dto,
      });
    }
    catch (e) {
      console.log('upload tape error: e.message');
      throw new Error('upload tape error');
    }
  }

  async get(userId: string, gameId: string, pageIndex: number, pageSize: number) {
    try {
      return {
        tapes: await this.tapeDao.find({
          select: {
            id: true,
            gameId: true,
            uploadTime: true,
          },
          where: { userId, gameId },
          order: {
            uploadTime: 'DESC',
          },
          skip: pageIndex * pageSize,
          take: pageSize,
        }),
      };
    }
    catch {
      throw new Error('get tapes error');
    }
  }

  async json(userId: string, tapeId: string) {
    const result = await this.tapeDao.findOne({
      relations: ['participant'],
      select: {
        participants: true,
        json: true,
      },
      where: {
        id: tapeId,
        userId,
      },
    });
    return result;
  }

  async createTapeWithParticipants(dto: CreateTapeDto) {
    try {
      let newTape: Tape;
      await this.dataSource.transaction(async manager => {
        const tape = await manager.save(Tape, {
          gameId: dto.gameId,
          json: JSON.stringify(dto.json),
        });
        const participants = dto.participants.map(p => ({
          ...p,
          tapeId: tape.id,
        }));
        await manager.save(Participant, participants);
        newTape = tape;
      });
      return newTape;
    }
    catch (e) {
      throw new Error('create tape error');
    }
  }

  async requestTape(dto: RequestTapeDto) {
    try {
      const { id: tapeId } = dto;
      return await this.tapeDao
        .createQueryBuilder('tape')
        .leftJoinAndSelect('tape.participants', 'p')
        .where('p.tapeId = :tapeId', { tapeId })
        .select(['tape.id', 'tape.gameId', 'tape.json', 'p.index', 'p.botId', 'p.isWin', 'p.userId'])
        .getOne();
    }
    catch (e) {
      throw new Error('request tape error');
    }
  }

  async requestMyTape(userId: string, dto: RequestMyTapeDto) {
    try {
      return {
        tapes: await this.tapeDao.findBy({
          userId,
        }),
      };
    }
    catch (e) {
      throw new Error('request my tape error');
    }
  }

  async delete(userId: string, tapeId: string) {
    try {
      await this.tapeDao.delete({
        userId,
        id: tapeId,
      });
      return ;
    }
    catch (e) {
      throw new Error('delete tape error');
    }
  }
}