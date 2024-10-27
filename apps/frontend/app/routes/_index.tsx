import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Brand } from "~/assets";

import { Background } from "~/assets/Background";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import { Footer } from "~/containers/footer";
import { ShowcaseHeader } from "~/containers/showcase/header";
import { cn } from "~/lib/utils";
import { getOptionalUser } from "~/server/auth.server";

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
      <ShowcaseHeader {...{ isAuth }} />
      <section className="relative min-h-[calc(100dvh-64px)] overflow-hidden w-full py-32">
        <div className="container">
          <div className="absolute inset-x-0 top-0 z-10 flex size-full items-center justify-center opacity-100">
            <Background />
          </div>
          <div className="mx-auto flex max-w-5xl flex-col items-center">
            <div className="z-10 flex flex-col items-center gap-6 text-center">
              <Brand className="w-40" />
              <Badge variant="outline">{t("website")}</Badge>
              <div>
                <h1 className="mb-6 text-pretty text-2xl font-bold lg:text-5xl">
                  {t("home")}
                </h1>
                <p className="text-muted-foreground lg:text-xl">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig
                  doloremque mollitia fugiat omnis! Porro facilis quo animi
                  consequatur. Explicabo.
                </p>
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Button>Get Started</Button>
                <Button variant="outline">Learn more</Button>
              </div>
              <div className="mt-20 flex flex-col items-center gap-4">
                <p className="text-center: text-muted-foreground lg:text-left">
                  Built with open-source technologies
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="#"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "group px-3",
                    )}
                  >
                    <img
                      src="https://www.shadcnblocks.com/images/block/logos/shadcn-ui-small.svg"
                      alt="company logo"
                      className="h-6 saturate-0 transition-all group-hover:saturate-100"
                    />
                  </a>
                  <a
                    href="#"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "group px-3",
                    )}
                  >
                    <img
                      src="https://www.shadcnblocks.com/images/block/logos/typescript-small.svg"
                      alt="company logo"
                      className="h-6 saturate-0 transition-all group-hover:saturate-100"
                    />
                  </a>
                  <a
                    href="#"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "group px-3",
                    )}
                  >
                    <img
                      src="https://www.shadcnblocks.com/images/block/logos/react-icon.svg"
                      alt="company logo"
                      className="h-6 saturate-0 transition-all group-hover:saturate-100"
                    />
                  </a>
                  <a
                    href="#"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "group px-3",
                    )}
                  >
                    <img
                      src="https://www.shadcnblocks.com/images/block/logos/tailwind-small.svg"
                      alt="company logo"
                      className="h-4 saturate-0 transition-all group-hover:saturate-100"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default HomePage;
