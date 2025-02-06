import { Controller, Post, Get, Body, Param, Res, BadRequestException } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './create-url.dto';
import { Response } from 'express';

@Controller('/')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  async shortenUrl(@Body() createUrlDto: CreateUrlDto) {
    try {
      const shortId = await this.urlService.shortenUrl(
        createUrlDto.longUrl,
        createUrlDto.customName,
      );
      return { shortUrl: `${process.env.BASE_URL}/${shortId}` };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get(':shortId')
  async redirect(@Param('shortId') shortId: string, @Res() res: Response) {
    const longUrl = await this.urlService.getOriginalUrl(shortId);
    return res.redirect(longUrl);
  }
}
