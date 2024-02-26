import { Global, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtOption, passwordOption } from '@src/config/option';
import { EmailCertificationModule } from '@src/modules/emailCertification.module';
import { UserModule } from '@src/modules/user.module';
import { AuthController } from './auth.controller';
import {
  AUTH_CACHE_SERVICE,
  AUTH_LOCAL_SERVICE,
  JWT_OPTIONS,
  JWT_SERVICE,
  PASSWORD_OPTIONS,
  PASSWORD_SERVICE,
} from './constant';
import { AuthCacheService } from './provider/auth.cache.service';
import { AuthJWTService } from './provider/auth.jwt.service';
import { AuthLocalService } from './provider/auth.local.service';
import { AuthPasswordService } from './provider/auth.password.service';
import { AuthService } from './provider/auth.service';

const authServices: Provider[] = [
  AuthService,
  { provide: AUTH_LOCAL_SERVICE, useClass: AuthLocalService },
  { provide: PASSWORD_SERVICE, useClass: AuthPasswordService },
  { provide: JWT_SERVICE, useClass: AuthJWTService },
  { provide: AUTH_CACHE_SERVICE, useClass: AuthCacheService },
];

const options: Provider[] = [
  { provide: JWT_OPTIONS, useValue: jwtOption },
  {
    provide: PASSWORD_OPTIONS,
    useValue: passwordOption,
  },
];

@Global()
@Module({
  imports: [JwtModule, EmailCertificationModule, UserModule],
  controllers: [AuthController],
  providers: [...options, ...authServices],
  exports: [AuthService, ...authServices],
})
export class AuthModule {}
