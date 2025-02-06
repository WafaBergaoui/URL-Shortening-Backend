import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { CreateUrlDto } from './create-url.dto';
import { Response } from 'express';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UrlController', () => {
  let controller: UrlController;
  let urlService: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: {
            shortenUrl: jest.fn(),
            getOriginalUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /shorten', () => {
    it('should return a short URL', async () => {
      const createUrlDto: CreateUrlDto = { longUrl: 'https://example.com' };
      const shortId = 'abc123';
      const shortUrl = `${process.env.BASE_URL}/${shortId}`;

      jest.spyOn(urlService, 'shortenUrl').mockResolvedValue(shortId);

      const result = await controller.shortenUrl(createUrlDto);
      expect(result).toEqual({ shortUrl });
      expect(urlService.shortenUrl).toHaveBeenCalledWith(createUrlDto.longUrl, undefined);
    });

    it('should throw BadRequestException if custom name is taken', async () => {
      const createUrlDto: CreateUrlDto = { longUrl: 'https://example.com', customName: 'taken' };

      jest.spyOn(urlService, 'shortenUrl').mockRejectedValue(new BadRequestException('This custom name is already taken.'));

      await expect(controller.shortenUrl(createUrlDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('GET /:shortId', () => {
    it('should redirect to the original URL', async () => {
      const shortId = 'a1b2c3';
      const longUrl = 'https://example.com';
      const res = { redirect: jest.fn() } as unknown as Response;

      jest.spyOn(urlService, 'getOriginalUrl').mockResolvedValue(longUrl);

      await controller.redirect(shortId, res);
      expect(urlService.getOriginalUrl).toHaveBeenCalledWith(shortId);
      expect(res.redirect).toHaveBeenCalledWith(longUrl);
    });

    it('should throw NotFoundException if shortId is invalid', async () => {
      const shortId = 'invalid';
      const res = { redirect: jest.fn() } as unknown as Response;

      jest.spyOn(urlService, 'getOriginalUrl').mockRejectedValue(new NotFoundException('URL not found'));

      await expect(controller.redirect(shortId, res)).rejects.toThrow(NotFoundException);
    });
  });
});
