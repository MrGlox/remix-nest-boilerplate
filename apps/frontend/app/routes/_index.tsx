import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
// import { useTranslation } from "react-i18next";

import { Footer } from "~/containers/footer";
import { ShowcaseHeader } from "~/containers/showcase/header";
import { getOptionalUser } from "~/server/auth.server";

export const handle = { i18n: ["auth", "common", "dashboard"] };

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ context });

  return json({
    isAuth: !!user,
  });
};

const HomePage = () => {
  const { isAuth } = useLoaderData<typeof loader>();
  // const { t } = useTranslation();

  return (
    <main className="flex flex-col">
      <ShowcaseHeader {...{ isAuth }} />
      <section className="min-h-screen w-full py-20">
        {/* <Container></Container> */}
      </section>
      <Footer />
    </main>
  );
};

export default HomePage;
