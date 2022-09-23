import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { OAuthProviderData } from '../common/types/auth.type';
import { AuthScope } from './../common/constants/auth.constant';
import { AuthService } from './auth.service';
import { CredentialsSignInDto } from './dto/signin.dto';
import { CredentialsSignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/credentials/signup')
  async credentialsSignUp(@Body() body: CredentialsSignUpDto) {
    return this.authService.credentialsSignUp(body);
  }

  @Post('/credentials/signin')
  async credentialsSignIn(@Body() body: CredentialsSignInDto) {
    return this.authService.credentialsSignIn(body);
  }

  @Get('/google')
  @UseGuards(AuthGuard(AuthScope.Google))
  async googleSignUp() {
    return {
      status: HttpStatus.OK
    };
  }

  @Get('/google/callback')
  @UseGuards(AuthGuard(AuthScope.Google))
  async googleCallback(@Req() { user }: Request, @Res() response: Response) {
    return this.authService.oauth(user as OAuthProviderData, response);
  }

  @Get('/facebook')
  @UseGuards(AuthGuard(AuthScope.Facebook))
  async facebookSignUp() {
    return {
      status: HttpStatus.OK
    };
  }

  @Get('/facebook/callback')
  @UseGuards(AuthGuard(AuthScope.Facebook))
  async facebookCallback(@Req() { user }: Request, @Res() response: Response) {
    return this.authService.oauth(user as OAuthProviderData, response);
  }

  @Get('/github')
  @UseGuards(AuthGuard(AuthScope.Github))
  async githubSignUp() {
    return {
      status: HttpStatus.OK
    };
  }

  @Get('/github/callback')
  @UseGuards(AuthGuard(AuthScope.Github))
  async githubCallback(@Req() { user }: Request, @Res() response: Response) {
    return this.authService.oauth(user as OAuthProviderData, response);
  }
}
