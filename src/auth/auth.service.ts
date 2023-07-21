import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config/dist/config.service";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }
    async login(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if (!user) {
            throw new ForbiddenException('Credentials incorrect')
        }
        const pwMatches = await argon.verify(
            user.hash,
            dto.password
        )
        if (!pwMatches) {
            throw new ForbiddenException("Incorrect password")
        }
        return this.signToken(user.id, user.email)
    }


    async signUp(dto: AuthDto) {
        const hash = await argon.hash(dto.password)
        try {

            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash: hash
                },
                select: {
                    id: true,
                    email: true,
                }
            })
            return user
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken')
                }
                throw error
            }
        }
    }

    async signToken(userId: number, email: string): Promise<{ accessToken: string }> {
        const payload = { sub: userId, email }
        const secret = this.config.get('JWT_SECRET')
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret
        })
        return { accessToken: token }
    }
}

