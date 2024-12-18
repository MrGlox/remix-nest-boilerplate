// import { Module, Scope } from '@nestjs/common';
// import { CmsService } from './cms.service';
// import { HttpAdapterHost } from '@nestjs/core';
// import payload from 'payload';
// import { ConfigService } from '@nestjs/config';
// import config from './payload.config';

// @Module({
//   providers: [
//     CmsService,
//     {
//       provide: 'CMS',
//       inject: [HttpAdapterHost, ConfigService],
//       scope: Scope.DEFAULT, // Singleton
//       useFactory: async (
//         httpAdapterHost: HttpAdapterHost,
//         configService: ConfigService,
//       ) => {
//         const { httpAdapter } = httpAdapterHost;
//         await payload.init({
//           server: httpAdapter.getInstance(),
//           config,
//         });
//         return payload;
//       },
//     },
//   ],
//   exports: [CmsService, 'CMS'],
// })
// export class CmsModule {}
