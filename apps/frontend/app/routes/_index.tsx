import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
// import { useTranslation } from "react-i18next";

import { Footer } from "~/containers/footer";
import { ShowcaseHeader } from "~/containers/showcase/header";
import { getOptionalUser } from "~/server/auth.server";
import { userPrefs } from "~/server/cookies.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ context });

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};

  console.log("cookie", cookie);

  return json({
    isAuth: !!user,
    showBanner: cookie.showBanner,
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};

  const bodyParams = await request.formData();

  if (bodyParams.get("bannerVisibility") === "hidden") {
    cookie.showBanner = false;
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
}

const HomePage = () => {
  const { isAuth, showBanner } = useLoaderData<typeof loader>();
  // const { t } = useTranslation();

  console.log("showBanner", showBanner);

  return (
    <main className="flex flex-col">
      <ShowcaseHeader {...{ isAuth }} />
      <section className="min-h-screen w-full py-20">
        {/* <Container></Container> */}
      </section>
      <Footer />
      {showBanner ? (
        <Form method="post">
          <input type="hidden" name="bannerVisibility" value="hidden" />
          <button type="submit">Hide</button>
        </Form>
      ) : null}
    </main>
  );
};

export default HomePage;
