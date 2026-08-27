import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock_token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      name: 'Test User',
      currency: 'NGN',
      createdAt: new Date(),
    });
    mockPrisma.user.update.mockResolvedValue({});

    const result = await service.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBe('mock_token');
    expect(result.refreshToken).toBe('mock_token');
  });

  it('should throw ConflictException when registering existing email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing_id' });

    await expect(
      service.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException when password does not match during login', async () => {
    const hashed = await bcrypt.hash('CorrectPassword123!', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      passwordHash: hashed,
    });

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
