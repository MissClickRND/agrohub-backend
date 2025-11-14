import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {FieldEntity} from 'src/database/entities/field.entity';
import {OrgEntity} from 'src/database/entities/org.entity';
import {DataSource, Repository} from 'typeorm';
import {CreateOrgReqDto} from './dto/createOrg.dto';

@Injectable()
export class OrgService {
    constructor(
        @InjectRepository(FieldEntity)
        private readonly fieldRepository: Repository<FieldEntity>,
        @InjectRepository(OrgEntity)
        private readonly orgRepository: Repository<OrgEntity>,
        private readonly dataSourсe: DataSource,
    ) {
    }

    async createOrg(userId: string, dto: CreateOrgReqDto) {
        const org = this.orgRepository.create({
            name: dto.name,
            userId: userId,
            fields: []
        })

        return this.orgRepository.save(org)
    }

    async getOrg(userId: string) {
        return await this.orgRepository.findOne({where: {userId: userId}});
    }
}
