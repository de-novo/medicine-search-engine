import { Inject, Injectable } from '@nestjs/common';
import { AuthError } from '@src/constant/error/auth.error';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { UserService } from '@src/services/user.service';
import { Auth } from '@src/type/auth.type';
import { isLeft, isRight, left, right } from 'fp-ts/lib/Either';
import {
  BasicAuthJWTService,
  BasicAuthPasswordService,
  BasicAuthService,
} from '../auth.interface';
import { JWT_SERVICE, PASSWORD_SERVICE } from '../constant';

@Injectable()
export class AuthLocalService implements BasicAuthService {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
    private readonly emailCertificationService: EmailCertificationService,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: BasicAuthPasswordService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: BasicAuthJWTService,
  ) {}

  async signup(dto: Auth.SignupDto) {
    if (dto.type !== 'local') throw new Error('Check Signup type!'); // never
    const { email, password, nickname, email_certification_id } = dto;

    const userOrError = await this.userService.findEmail(email);
    if (isRight(userOrError)) return left(AuthError.User.EMAIL_ALREADY_EXISTS);

    const nicknameExistOrError = await this.userService.findNickName(nickname);
    if (isRight(nicknameExistOrError))
      return left(AuthError.User.NICKNAME_ALREADY_EXISTS);

    const checkEmailCertification =
      await this.emailCertificationService.checkEmailCertification({
        email,
        id: email_certification_id,
        type: 'SIGN_UP',
      });
    if (isLeft(checkEmailCertification))
      return left(AuthError.Authentication.EMAIL_CERTIFICATION_NOT_VERIFIED);

    const hashedPassword = await this.passwordService.hash(password);
    const newUser = await this.userService.createUserWithSnapshot({
      email,
      password: hashedPassword,
      nickname,
    });

    return right(newUser);
  }

  async login(dto: Auth.LoginDto) {
    if (dto.type !== 'local')
      return left(AuthError.Authentication.INVALID_TYPE);
    const { email, password } = dto;
    const userOrError = await this.userService.findUnique(email);
    if (isLeft(userOrError)) return left(AuthError.User.USER_NOT_FOUND);
    const { right: user } = userOrError;
    const isPasswordMatch = await this.passwordService.compare(
      password,
      user.password || '',
    );
    if (isLeft(isPasswordMatch)) return isPasswordMatch;
    const payload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.accessTokenSign(payload);
    const refreshToken = this.jwtService.refreshTokenSign(payload);
    return right({
      access_token: accessToken,
      refresh_token: refreshToken,
      payload,
    });
  }
}
