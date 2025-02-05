import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url } from './url.schema';
import * as shortid from 'shortid';

@Injectable()
export class UrlService {
  constructor(@InjectModel(Url.name) private readonly urlModel: Model<Url>) { }

  async shortenUrl(longUrl: string): Promise<string> {
    const shortId = shortid.generate();
    const newUrl = new this.urlModel({ longUrl, shortId });
    await newUrl.save();
    return shortId;
  }

  async getOriginalUrl(shortId: string): Promise<string> {
    const url = await this.urlModel.findOne({ shortId });
    if (!url) throw new NotFoundException('URL not found');

    return url.longUrl;
  }
}
