import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { getModelToken } from '@nestjs/mongoose';
import { Url } from './url.schema';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as shortid from 'shortid';

describe('UrlService', () => {
  let service: UrlService;
  let urlModel: Model<Url>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getModelToken(Url.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            prototype: {
              save: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    urlModel = module.get<Model<Url>>(getModelToken(Url.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shortenUrl', () => {
    it('should generate a short URL', async () => {
      const longUrl = 'https://example.com';
      const shortId = shortid.generate();

      // Mock the `findOne` method to return null (no existing URL)
      jest.spyOn(urlModel, 'findOne').mockResolvedValue(null);

      // Mock the `save` method for the new URL instance
      const mockSave = jest.fn().mockResolvedValue({ longUrl, shortId });
      jest.spyOn(urlModel.prototype, 'save').mockImplementation(mockSave);

      const result = await service.shortenUrl(longUrl);
      expect(result).toBe(shortId);
      expect(urlModel.findOne).toHaveBeenCalledWith({ shortId });
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw BadRequestException if custom name is taken', async () => {
      const longUrl = 'https://example.com';
      const customName = 'taken';

      // Mock the `findOne` method to return an existing URL
      jest.spyOn(urlModel, 'findOne').mockResolvedValue({ longUrl, shortId: customName } as Url);

      await expect(service.shortenUrl(longUrl, customName)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL', async () => {
      const shortId = 'abc123';
      const longUrl = 'https://example.com';

      // Mock the `findOne` method to return a URL document
      jest.spyOn(urlModel, 'findOne').mockResolvedValue({ longUrl, shortId } as Url);

      const result = await service.getOriginalUrl(shortId);
      expect(result).toBe(longUrl);
      expect(urlModel.findOne).toHaveBeenCalledWith({ shortId });
    });

    it('should throw NotFoundException if shortId is invalid', async () => {
      const shortId = 'invalid';

      // Mock the `findOne` method to return null (URL not found)
      jest.spyOn(urlModel, 'findOne').mockResolvedValue(null);

      await expect(service.getOriginalUrl(shortId)).rejects.toThrow(NotFoundException);
    });
  });
});
