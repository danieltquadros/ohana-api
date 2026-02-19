import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateGuestDto } from './dto/create-guest.dto';
import { ConvertGuestToUserDto } from './dto/convert-guest-to-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          { phone: registerDto.phone },
          { cpf: registerDto.cpf },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('User with this email already exists');
      }
      if (existingUser.phone === registerDto.phone) {
        throw new ConflictException('User with this phone already exists');
      }
      if (existingUser.cpf === registerDto.cpf) {
        throw new ConflictException('User with this CPF already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        cpf: registerDto.cpf,
        role: 'USER', // Default role for registration
        status: 'PENDING_VERIFICATION',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        cpf: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user status allows login
    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('User account is inactive');
    }
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('User account is suspended');
    }

    // GUEST users cannot login (no password)
    if (!user.password) {
      throw new UnauthorizedException(
        'Guest users cannot login. Please register an account first.',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      accessToken,
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        cpf: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Create GUEST user for quick checkout
   * No email or password required, only phone + name
   */
  async createGuest(createGuestDto: CreateGuestDto) {
    // Check if phone already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: createGuestDto.phone },
    });

    if (existingUser) {
      // If user exists and is GUEST, return existing user with token
      if (existingUser.role === 'GUEST') {
        const payload = {
          phone: existingUser.phone,
          sub: existingUser.id,
          role: existingUser.role,
        };
        const accessToken = this.jwtService.sign(payload);

        return {
          user: {
            id: existingUser.id,
            phone: existingUser.phone,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            role: existingUser.role,
            status: existingUser.status,
          },
          accessToken,
        };
      }

      // If user exists but is not GUEST, throw error
      throw new ConflictException(
        'User with this phone already exists. Please login.',
      );
    }

    // Create GUEST user
    const user = await this.prisma.user.create({
      data: {
        phone: createGuestDto.phone,
        firstName: createGuestDto.firstName,
        lastName: createGuestDto.lastName,
        role: 'GUEST',
        status: 'ACTIVE', // GUEST users start as ACTIVE
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate JWT token (using phone instead of email)
    const payload = {
      phone: user.phone,
      sub: user.id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }

  /**
   * Convert GUEST user to full USER
   * Adds email and password to existing GUEST
   */
  async convertGuestToUser(userId: number, convertDto: ConvertGuestToUserDto) {
    // Find GUEST user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role !== 'GUEST') {
      throw new ConflictException('User is not a GUEST');
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: convertDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(convertDto.password, 10);

    // Update user to full USER
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: convertDto.email,
        password: hashedPassword,
        role: 'USER',
        status: 'PENDING_VERIFICATION',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    // Generate new JWT token with email
    const payload = {
      email: updatedUser.email,
      sub: updatedUser.id,
      role: updatedUser.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: updatedUser,
      accessToken,
    };
  }
}
