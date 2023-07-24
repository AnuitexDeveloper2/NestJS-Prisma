import { Controller, Post } from "@nestjs/common";
import { Body, HttpCode } from "@nestjs/common/decorators";
import { HttpStatus } from "@nestjs/common/enums";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto"

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post('signup')
    signUp(@Body() dto: AuthDto) {
        return this.authService.signUp(dto)
    }
    
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() dto: AuthDto) {

        return this.authService.login(dto)
    }       
}