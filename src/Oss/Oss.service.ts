// src/oss/oss.service.ts
import { Injectable } from '@nestjs/common';
import OSS from 'ali-oss';

@Injectable()
export class OssService {
  constructor(private readonly ossClient: OSS) {}

  async generateUploadSignature(filename: string): Promise<{ url: string }> {
    const expires = 3600; // 1小时有效
    const options = {
      expires,
      method: 'PUT',
      path: `uploads/${filename}`,
    };
    const signatureUrl = this.ossClient.signatureUrl(options.path, options);
    return { url: signatureUrl };
  }
}
