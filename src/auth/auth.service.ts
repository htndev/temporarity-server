import { User } from './../common/db/entities/user.entity';
import { BadRequestException, ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { UserRepository } from '../common/db/repositories/user.repository';
import { AppConfig } from '../common/providers/config';
import { OAuthProviderData } from '../common/types/auth.type';
import { IdentityProviderRepository } from './../common/db/repositories/identity-provider.repository';
import { HttpResponse } from './../common/types/response.type';
import { redirect } from './../common/utils/redirect.util';
import { CredentialsSignInDto } from './dto/signin.dto';
import { CredentialsSignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly appConfig: AppConfig,
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    @InjectRepository(IdentityProviderRepository)
    private readonly identityProviderRepository: IdentityProviderRepository
  ) {}

  async credentialsSignUp({ email, password }: CredentialsSignUpDto): Promise<HttpResponse> {
    if (await this.userRepository.isExists({ email })) {
      throw new ConflictException(`Use with email '${email}' is already exist.`);
    }
    const user = this.userRepository.create({ email, password });
    await user.save();

    return {
      status: HttpStatus.CREATED
    };
  }

  async credentialsSignIn({ email, password }: CredentialsSignInDto): Promise<HttpResponse> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      this.throwWrongEmailOrPassword();
    }

    if (!(await user.comparePassword(password))) {
      this.throwWrongEmailOrPassword();
    }

    return {
      status: HttpStatus.CREATED
    };
  }

  async oauthSignup(
    { id, email, provider, profilePicture }: OAuthProviderData,
    response: Response
  ): Promise<HttpResponse | unknown> {
    if (!email) {
      // No email provided
      return redirect(response, `${this.appConfig.clientUrl}/login?errorCode=2`);
    }
    const isUserWithEmailExist = await this.userRepository.isExists({ email });
    const isSignedUpByIdentityProvider = await this.identityProviderRepository.isExists({ providerId: id });

    if (isUserWithEmailExist && !isSignedUpByIdentityProvider) {
      // User authorized but not with OAuth
      return redirect(response, `${this.appConfig.clientUrl}/login?errorCode=1`);
    }

    const user =
      !isUserWithEmailExist && !isSignedUpByIdentityProvider
        ? await this.userRepository.createOauthUser({ email, profilePicture, provider, providerId: id })
        : await this.userRepository.findOne({ email });

    return response.json({
      status: HttpStatus.CREATED,
      user
    });
  }

  private throwWrongEmailOrPassword() {
    throw new BadRequestException('Wrong email or password');
  }
}
