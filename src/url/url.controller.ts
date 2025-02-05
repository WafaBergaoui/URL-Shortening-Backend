import { Controller, Post, Get, Body, Param, Res } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './create-url.dto';
import { Response } from 'express';

@Controller('/')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten') // Handles POST /shorten
  async shortenUrl(@Body() createUrlDto: CreateUrlDto) {
    const shortId = await this.urlService.shortenUrl(createUrlDto.longUrl);
    return { shortUrl: `${process.env.BASE_URL}/${shortId}` };
  }

  @Get(':shortId') // Handles GET /:shortId
  async redirect(@Param('shortId') shortId: string, @Res() res: Response) {
    const longUrl = await this.urlService.getOriginalUrl(shortId);
    return res.redirect(longUrl);
  }
}
