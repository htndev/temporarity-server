import { BadRequestException, ConflictException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { IdentityProviderRepository } from '../common/db/repositories/identity-provider.repository';
import { UserRepository } from '../common/db/repositories/user.repository';
import { AppConfig } from '../common/providers/config';
import { TokenService } from '../common/providers/token/token.service';
import { OAuthProviderData } from '../common/types/auth.type';
import { CookiesType } from '../common/types/base.type';
import { HttpResponse } from '../common/types/response.type';
import { Token } from '../common/types/token.type';
import { redirect } from '../common/utils/redirect.util';
import { UserPreferencesRepository } from '../common/db/repositories/user-preferences.repository';
import { CredentialsSignInDto } from './dto/signin.dto';
import { CredentialsSignUpDto } from './dto/signup.dto';

type TokensObject = { [k in Token]: string };
type TokenType = { tokens: TokensObject };
type TokenResponse = HttpResponse<TokenType>;

@Injectable()
export class AuthService {
  constructor(
    private readonly appConfig: AppConfig,
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    @InjectRepository(IdentityProviderRepository)
    private readonly identityProviderRepository: IdentityProviderRepository,
    private readonly userPreferencesRepository: UserPreferencesRepository,
    private readonly tokenService: TokenService
  ) {}

  async credentialsSignUp(
    { email, password, fullName, language }: CredentialsSignUpDto,
    response: Response
  ): Promise<TokenResponse> {
    if (await this.userRepository.isExists({ email })) {
      throw new ConflictException(`Use with email '${email}' is already exist.`);
    }
    const user = this.userRepository.create({ fullName, email, password });
    await user.save();

    const userPreferences = this.userPreferencesRepository.create({ userId: user._id, language: language ?? 'en-US' });
    await userPreferences.save();

    const tokens = await this.tokenService.generateTokens({ email, fullName });

    this.tokenService.setTokens(tokens, response);

    return {
      status: HttpStatus.CREATED,
      tokens
    };
  }

  async credentialsSignIn({ email, password }: CredentialsSignInDto, response: Response): Promise<TokenResponse> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      this.throwWrongEmailOrPassword();
    }

    if (user.isOauthUser && password) {
      this.throwWrongEmailOrPassword();
    }

    if (!(await user.comparePassword(password))) {
      this.throwWrongEmailOrPassword();
    }

    const tokens = await this.tokenService.generateTokens({ email, fullName: user.fullName });

    this.tokenService.setTokens(tokens, response);

    return {
      status: HttpStatus.CREATED,
      tokens
    };
  }

  async oauth(
    { id, email, provider, profilePicture, fullName }: OAuthProviderData,
    response: Response
  ): Promise<HttpResponse | unknown> {
    if (!email) {
      // No email provided
      return this.redirect(response, '/signin?errorMessage=Failed to authorize');
    }
    const isUserWithEmailExist = await this.userRepository.isExists({ email });
    const isSignedUpByIdentityProvider = await this.identityProviderRepository.isExists({ providerId: id });

    if (isUserWithEmailExist && !isSignedUpByIdentityProvider) {
      // User authorized but not with OAuth
      return this.redirectToSignUpPageWithMessage(response, 'You have already signed up with credentials');
    }

    if (isUserWithEmailExist) {
      const user = await this.userRepository.findOne({ where: { email } });
      const identityProvider = await this.identityProviderRepository.getIdentityProviderByUser(user);

      if (identityProvider !== provider) {
        return this.redirectToSignUpPageWithMessage(response, 'You have been signed up by another OAuth2.0 provider');
      }
    }

    const user =
      !isUserWithEmailExist && !isSignedUpByIdentityProvider
        ? await this.userRepository.createOauthUser({ email, fullName, profilePicture, provider, providerId: id })
        : await this.userRepository.findOne({ where: { email } });

    const tokens = await this.tokenService.generateTokens({ email: user.email, fullName: user.fullName });

    this.tokenService.setTokens(tokens, response);

    return this.redirect(response, `/dashboard?${new URLSearchParams(tokens).toString()}`);
  }

  async getTokens(cookies: CookiesType, response: Response): Promise<TokenResponse> {
    const rawTokens = this.tokenService.getTokensFromCookies(cookies);
    const hasRefreshToken = !!rawTokens.refresh;

    if (!hasRefreshToken) {
      throw new UnauthorizedException();
    }

    const tokens =
      Object.values(rawTokens).filter(Boolean).length === 2
        ? rawTokens
        : await this.tokenService.generateTokensByRefreshToken(rawTokens.refresh);

    this.tokenService.setTokens(tokens, response);

    return {
      status: HttpStatus.OK,
      tokens
    };
  }

  async newTokens(payload: { email: string; fullName: string }, response: Response): Promise<TokenResponse> {
    const tokens = await this.tokenService.generateTokens(payload);

    this.tokenService.setTokens(tokens, response);

    return {
      status: HttpStatus.OK,
      tokens
    };
  }

  async logout(response: Response): Promise<HttpResponse> {
    this.tokenService.deleteCookies(response);

    return {
      status: HttpStatus.OK
    };
  }

  private throwWrongEmailOrPassword() {
    throw new BadRequestException('Wrong email or password');
  }

  private redirect(response: Response, path: string): unknown {
    return redirect(response, `${this.appConfig.clientUrl}${path}`);
  }

  private redirectToSignUpPageWithMessage(response: Response, message: string): unknown {
    return this.redirect(response, `/signup?errorMessage=${message}`);
  }
}
