import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PRIVATE_BUCKET } from '@app/common/utils/special';
import { File } from '@app/common/interfaces/special';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PrivateService {
  constructor(@Inject(PRIVATE_BUCKET) readonly s3: S3Client) {}

  getObject(file: File): Promise<GetObjectCommandOutput> {
    const input = { Bucket: file.bucket, Key: file.key };
    const command = new GetObjectCommand(input);
    return this.s3.send(command);
  }

  async getShareLink(file: File, expiresInSeconds = 3600): Promise<string> {
    const input = { Bucket: file.bucket, Key: file.key };
    const command = new GetObjectCommand(input);

    return await getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }
}
