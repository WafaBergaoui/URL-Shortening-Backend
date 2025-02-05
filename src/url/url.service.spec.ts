import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { getModelToken } from '@nestjs/mongoose';
import { Url } from './url.schema';
import * as shortid from 'shortid';

// Mock shortid
jest.mock('shortid', () => ({
  generate: jest.fn(() => 'mockShortId'), // Always return 'mockShortId'
}));

class MockUrlModel {
  longUrl: string;
  shortId: string;
  save = jest.fn().mockResolvedValue(this); // Mock save method

  constructor(data: Partial<Url>) {
    this.longUrl = data.longUrl;
    this.shortId = data.shortId;
  }

  static findOne = jest.fn(); // Mock findOne as a static method
}

describe('UrlService', () => {
  let service: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getModelToken(Url.name),
          useValue: MockUrlModel, // Use the mock class
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should shorten a URL', async () => {
    const longUrl = 'https://example.com';

    // Create a mock instance and spy on its save method
    const mockInstance = new MockUrlModel({ longUrl, shortId: 'mockShortId' });
    jest.spyOn(mockInstance, 'save');

    // Mock the constructor to return the mock instance
    jest.spyOn(MockUrlModel.prototype, 'constructor').mockImplementation(() => mockInstance);

    // Call the service method
    const result = await service.shortenUrl(longUrl);

    // Assertions
    expect(result).toBe('mockShortId');
    expect(mockInstance.save).toHaveBeenCalled(); // Ensure save is called
  });


  it('should get the original URL', async () => {
    const shortId = 'mockShortId';
    const longUrl = 'https://example.com';

    MockUrlModel.findOne.mockResolvedValueOnce({ longUrl });

    const result = await service.getOriginalUrl(shortId);

    expect(result).toBe(longUrl);
    expect(MockUrlModel.findOne).toHaveBeenCalledWith({ shortId });
  });

  it('should throw an error if shortId is not found', async () => {
    MockUrlModel.findOne.mockResolvedValueOnce(null);

    await expect(service.getOriginalUrl('nonexistentId')).rejects.toThrow(
      'URL not found',
    );
  });
});
