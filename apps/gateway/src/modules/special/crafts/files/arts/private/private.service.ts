import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { PRIVATE_BUCKET } from '@app/common/consts';
import { File } from '@app/common/interfaces';

@Injectable()
export class PrivateService {
  constructor(@Inject(PRIVATE_BUCKET) private readonly s3: S3Client) {}

  getObject(file: File): Promise<GetObjectCommandOutput> {
    const input = { Bucket: file.bucket, Key: file.key };
    const command = new GetObjectCommand(input);
    return this.s3.send(command);
  }
}
