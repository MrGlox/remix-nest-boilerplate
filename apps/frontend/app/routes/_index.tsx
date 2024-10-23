import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { Brand } from "~/assets";
import { Container } from "~/components/layout/container";
import { Button } from "~/components/ui/button";
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
  const { t } = useTranslation();

  return (
    <main className="flex flex-col">
      <header className="border-b ">
        <Container
          size="large"
          className="flex h-16 items-center px-4 justify-between"
        >
          <Link to="/" className="flex items-center text-lg font-medium">
            <Brand className="w-10 h-10 min-w-10 mr-2" />
            Boilerplate
          </Link>
          <nav>
            <ul className="flex gap-2">
              {isAuth && (
                <li>
                  <Button asChild variant="ghost">
                    <Link to="/dashboard">
                      {t("title", { ns: "dashboard" })}
                    </Link>
                  </Button>
                </li>
              )}
              {!isAuth && (
                <>
                  <li>
                    <Button asChild variant="ghost">
                      <Link to="/signup">
                        {t("signup.title", { ns: "auth" })}
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button asChild>
                      <Link to="/signin">
                        {t("signin.title", { ns: "auth" })}
                      </Link>
                    </Button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </Container>
      </header>
      <section className="min-h-screen w-full py-20">
        <Container>test</Container>
      </section>
    </main>
  );
};

export default HomePage;
