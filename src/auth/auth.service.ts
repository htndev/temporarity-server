import { TokenType } from './../common/types/token.type';
import { BadRequestException, ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { UserRepository } from '../common/db/repositories/user.repository';
import { AppConfig } from '../common/providers/config';
import { OAuthProviderData } from '../common/types/auth.type';
import { IdentityProviderRepository } from './../common/db/repositories/identity-provider.repository';
import { TokenService } from './../common/providers/token/token.service';
import { HttpResponse } from './../common/types/response.type';
import { redirect } from './../common/utils/redirect.util';
import { CredentialsSignInDto } from './dto/signin.dto';
import { CredentialsSignUpDto } from './dto/signup.dto';

type TokenResponse = HttpResponse<{ tokens: { [k in TokenType]: string } }>;

@Injectable()
export class AuthService {
  constructor(
    private readonly appConfig: AppConfig,
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    @InjectRepository(IdentityProviderRepository)
    private readonly identityProviderRepository: IdentityProviderRepository,
    private readonly tokenService: TokenService
  ) {}

  async credentialsSignUp({ email, password, fullName }: CredentialsSignUpDto): Promise<TokenResponse> {
    if (await this.userRepository.isExists({ email })) {
      throw new ConflictException(`Use with email '${email}' is already exist.`);
    }
    const user = this.userRepository.create({ fullName, email, password });
    await user.save();

    const tokens = await this.tokenService.generateTokens({ email, fullName });

    return {
      status: HttpStatus.CREATED,
      tokens
    };
  }

  async credentialsSignIn({ email, password }: CredentialsSignInDto): Promise<TokenResponse> {
    const user = await this.userRepository.findOne({ email });

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
      return this.redirect(response, '/signin?message=Failed to authorize');
    }
    const isUserWithEmailExist = await this.userRepository.isExists({ email });
    const isSignedUpByIdentityProvider = await this.identityProviderRepository.isExists({ providerId: id });

    if (isUserWithEmailExist && !isSignedUpByIdentityProvider) {
      // User authorized but not with OAuth
      return this.redirectToSignUpPageWithMessage(response, 'You have already signed up with credentials');
    }

    if (isUserWithEmailExist) {
      const user = await this.userRepository.findOne({ email });
      const identityProvider = await this.identityProviderRepository.getIdentityProviderByUser(user);

      if (identityProvider !== provider) {
        return this.redirectToSignUpPageWithMessage(response, 'You have been signed up by another OAuth2.0 provider');
      }
    }

    const user =
      !isUserWithEmailExist && !isSignedUpByIdentityProvider
        ? await this.userRepository.createOauthUser({ email, fullName, profilePicture, provider, providerId: id })
        : await this.userRepository.findOne({ email });

    const tokens = await this.tokenService.generateTokens({ email: user.email, fullName: user.fullName });

    return this.redirect(response, `/?${new URLSearchParams(tokens).toString()}`);
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
