import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  SerializeOptions,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { AuthConfirmEmailDto } from "./dto/auth-confirm-email.dto";
import { AuthEmailLoginDto } from "./dto/auth-email-login.dto";
import { AuthForgotPasswordDto } from "./dto/auth-forgot-password.dto";
import { AuthRegisterLoginDto } from "./dto/auth-register-login.dto";
import { AuthResetPasswordDto } from "./dto/auth-reset-password.dto";
import { AuthUpdateDto } from "./dto/auth-update.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { RefreshResponseDto } from "./dto/refresh-response.dto";

import { Request } from "express";
import { User } from "../users/domain/user";
import { NullableType } from "../utils/types/nullable.type";
import { JwtPayloadType } from "./strategies/types/jwt-payload.type";

@ApiTags("Auth")
@Controller({
  path: "auth",
  version: "1",
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @SerializeOptions({
    groups: ["me"],
  })
  @Post("email/login")
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }

  @Post("email/register")
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<void> {
    return this.service.register(createUserDto);
  }

  @Post("email/confirm")
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto
  ): Promise<void> {
    return this.service.confirmEmail(confirmEmailDto.hash);
  }

  @Post("email/confirm/new")
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmNewEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto
  ): Promise<void> {
    return this.service.confirmNewEmail(confirmEmailDto.hash);
  }

  @Post("forgot/password")
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto
  ): Promise<void> {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @Post("reset/password")
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password
    );
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ["me"],
  })
  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  @ApiOkResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  public me(@Req() request: Request): Promise<NullableType<User>> {
    const userJwtPayload = request.user as JwtPayloadType;
    return this.service.me(userJwtPayload);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @SerializeOptions({
    groups: ["me"],
  })
  @Post("refresh")
  @UseGuards(AuthGuard("jwt-refresh"))
  @HttpCode(HttpStatus.OK)
  public refresh(@Req() request: Request): Promise<RefreshResponseDto> {
    if (!request.user) {
      throw new Error("User not found in request");
    }

    return this.service.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
  }

  @ApiBearerAuth()
  @Post("logout")
  @UseGuards(AuthGuard("jwt"))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Req() request: Request): Promise<void> {
    if (!request.user) {
      throw new Error("User not found in request");
    }

    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ["me"],
  })
  @Patch("me")
  @UseGuards(AuthGuard("jwt"))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public update(
    @Req() request: Request,
    @Body() userDto: AuthUpdateDto
  ): Promise<NullableType<User>> {
    if (!request.user) {
      throw new Error("User not found in request");
    }

    return this.service.update(request.user as JwtPayloadType, userDto);
  }

  @ApiBearerAuth()
  @Delete("me")
  @UseGuards(AuthGuard("jwt"))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Req() request: Request): Promise<void> {
    if (!request.user) {
      throw new Error("User not found in request");
    }

    return this.service.softDelete(request.user as User);
  }
}
