// import { type AppLoadContext } from "react-router";
// import { type z } from "zod";

// import { type EditProfileSchema } from "~/routes/_public+/profile";

// export const editProfile = async ({
//   context,
//   profileData,
//   userId,
// }: {
//   context: AppLoadContext;
//   profileData: z.infer<typeof EditProfileSchema>;
//   userId: string;
// }) => {
//   return await context.remixService.prisma.user.update({
//     where: {
//       id: userId,
//     },
//     data: {
//       email: profileData.email,
//       pseudo: profileData.pseudo,
//     },
//     select: {
//       id: true,
//     },
//   });
// };
