import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { PRIVATE_BUCKET } from '@app/common/consts';
import { File } from '@app/common/interfaces';
import { Observable, from } from 'rxjs';

@Injectable()
export class PrivateService {
  constructor(@Inject(PRIVATE_BUCKET) private readonly s3: S3Client) {}

  getObject(file: File): Observable<GetObjectCommandOutput> {
    const input = { Bucket: file.bucket, Key: file.key };
    const command = new GetObjectCommand(input);
    return from(this.s3.send(command));
  }
}
