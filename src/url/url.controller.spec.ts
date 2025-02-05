import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  const mockUrlService = {
    shortenUrl: jest.fn().mockResolvedValue('mockShortId'),
    getOriginalUrl: jest.fn().mockResolvedValue('https://example.com'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  it('should return a shortened URL', async () => {
    const response = await controller.shortenUrl({ longUrl: 'https://example.com' });
    expect(response).toEqual({ shortUrl: 'http://localhost:8080/mockShortId' });
    expect(service.shortenUrl).toHaveBeenCalledWith('https://example.com');
  });

  it('should redirect to the original URL', async () => {
    const mockRes = {
      redirect: jest.fn(),
    } as any;

    await controller.redirect('mockShortId', mockRes);
    expect(mockRes.redirect).toHaveBeenCalledWith('https://example.com');
    expect(service.getOriginalUrl).toHaveBeenCalledWith('mockShortId');
  });
});
