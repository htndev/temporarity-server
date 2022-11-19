import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { OAuthProviderData } from '../common/types/auth.type';
import { AuthScope } from '../common/constants/auth.constant';
import { Cookies } from '../common/decorators/cookies.decorator';
import { User } from '../common/decorators/user.decorator';
import { JwtAccessTokenGuard } from '../common/guards/jwt-access-token.guard';
import { SafeUser } from '../common/types/auth.type';
import { CookiesType } from '../common/types/base.type';
import { AuthService } from './auth.service';
import { CredentialsSignInDto } from './dto/signin.dto';
import { CredentialsSignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/credentials/signup')
  async credentialsSignUp(@Body() body: CredentialsSignUpDto, @Res() response: Response) {
    return response.json(await this.authService.credentialsSignUp(body, response));
  }

  @Post('/credentials/signin')
  async credentialsSignIn(@Body() body: CredentialsSignInDto, @Res() response: Response) {
    return response.json(await this.authService.credentialsSignIn(body, response));
  }

  @Get('/google')
  @UseGuards(AuthGuard(AuthScope.Google))
  async google() {
    return {
      status: HttpStatus.PERMANENT_REDIRECT
    };
  }

  @Get('/google/callback')
  @UseGuards(AuthGuard(AuthScope.Google))
  async googleCallback(@Req() { user }: Request, @Res() response: Response) {
    return response.json(await this.authService.oauth(user as OAuthProviderData, response));
  }

  @Get('/facebook')
  @UseGuards(AuthGuard(AuthScope.Facebook))
  async facebook() {
    return {
      status: HttpStatus.PERMANENT_REDIRECT
    };
  }

  @Get('/facebook/callback')
  @UseGuards(AuthGuard(AuthScope.Facebook))
  async facebookCallback(@Req() { user }: Request, @Res() response: Response) {
    return response.json(await this.authService.oauth(user as OAuthProviderData, response));
  }

  @Get('/github')
  @UseGuards(AuthGuard(AuthScope.Github))
  async github() {
    return {
      status: HttpStatus.PERMANENT_REDIRECT
    };
  }

  @Get('/github/callback')
  @UseGuards(AuthGuard(AuthScope.Github))
  async githubCallback(@Req() { user }: Request, @Res() response: Response) {
    return response.json(await this.authService.oauth(user as OAuthProviderData, response));
  }

  @Get('/me')
  @UseGuards(JwtAccessTokenGuard)
  async me(@User() user: SafeUser) {
    return {
      status: HttpStatus.OK,
      user
    };
  }

  @Get('/tokens')
  async tokens(@Cookies() cookies: CookiesType, @Res() response: Response) {
    return response.json(await this.authService.getTokens(cookies, response));
  }

  @Post('/logout')
  async logout(@Res() response: Response) {
    return response.json(await this.authService.logout(response));
  }
}
