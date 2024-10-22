// We use class-transformer in ORM entity and domain entity.
// We duplicate these rules because you can choose not to use adapters
// in your project and return an ORM entity directly in response.
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ApiProperty } from "@nestjs/swagger";

import { Transform } from "class-transformer";

import { AppConfig } from "../../../../../config/app-config.type";
import appConfig from "../../../../../config/app.config";
import { FileConfig, FileDriver } from "../../../../config/file-config.type";
import fileConfig from "../../../../config/file.config";

export class FileEntity {
  @ApiProperty({
    type: String,
    example: "cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae",
  })
  id: string;

  @ApiProperty({
    type: String,
    example: "https://example.com/path/to/file.jpg",
  })
  @Transform(
    ({ value }) => {
      if ((fileConfig() as FileConfig).driver === FileDriver.LOCAL) {
        return (appConfig() as AppConfig).backendDomain + value;
      } else if (
        [FileDriver.S3_PRESIGNED, FileDriver.S3].includes(
          (fileConfig() as FileConfig).driver
        )
      ) {
        const s3 = new S3Client({
          region: (fileConfig() as FileConfig).awsS3Region ?? "",
          credentials: {
            accessKeyId: (fileConfig() as FileConfig).accessKeyId ?? "",
            secretAccessKey: (fileConfig() as FileConfig).secretAccessKey ?? "",
          },
        });

        const command = new GetObjectCommand({
          Bucket: (fileConfig() as FileConfig).awsDefaultS3Bucket ?? "",
          Key: value,
        });

        return getSignedUrl(s3, command, { expiresIn: 3600 });
      }

      return value;
    },
    {
      toPlainOnly: true,
    }
  )
  path: string;
}
