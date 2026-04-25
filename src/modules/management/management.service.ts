import { Injectable } from '@nestjs/common';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ManagementService {
  constructor(private prisma: PrismaService) {}

  async getLeadershipProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        leadsCell: { select: { id: true, name: true } },
        leadsSmallGroup: { select: { id: true, name: true } },
        leadsCommunity: { select: { id: true, name: true } },
        leadsZone: { select: { id: true, name: true } },
        districtsLed: { select: { id: true, name: true } },
        hod: { select: { id: true, name: true } },
        leadsSubTeam: { select: { id: true, name: true } },
        leadsChurchTeam: { select: { id: true, name: true } },
      },
    });
  }

  create(createManagementDto: CreateManagementDto) {
    return 'This action adds a new management';
  }

  findAll() {
    return `This action returns all management`;
  }

  findOne(id: number) {
    return `This action returns a #${id} management`;
  }

  update(id: number, updateManagementDto: UpdateManagementDto) {
    return `This action updates a #${id} management`;
  }

  remove(id: number) {
    return `This action removes a #${id} management`;
  }
}
