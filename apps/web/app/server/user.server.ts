import { type AppLoadContext } from "react-router";
import z from "zod";

// import { type EditProfileSchema } from "~/routes/_public+/profile";

const authenticatedUserSchema = z.object({
  id: z.string(),
  email: z.string(),
});

// export const editProfile = async ({
//   context,
//   profileData,
//   userId,
// }: {
//   context: AppLoadContext;
//   // profileData: z.infer<typeof EditProfileSchema>;
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

export const getUserAddress = async ({
  context,
}: {
  context: AppLoadContext;
}) => {
  const user = authenticatedUserSchema
    .optional()
    .nullable()
    .parse(context.user);

  if (user) {
    return await context.remixService.getAddress({
      userId: user.id,
    });
  }

  return null;
};

export const getUserProfile = async ({
  context,
}: {
  context: AppLoadContext;
}) => {
  const user = authenticatedUserSchema
    .optional()
    .nullable()
    .parse(context.user);

  if (user) {
    return await context.remixService.getAddress({
      userId: user.id,
    });
  }

  return null;
};
