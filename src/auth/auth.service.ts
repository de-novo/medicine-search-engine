import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
}
