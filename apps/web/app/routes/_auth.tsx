import { LoaderFunctionArgs } from "react-router";
import { Link, Outlet, redirect, useLoaderData, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { Brand } from "~/assets";
import { buttonVariants } from "~/components/ui/button";
import { LazyImage, generateImageWithBlurhash } from "~/containers/lazy-image";
import { ShowcaseFooter } from "~/containers/showcase/footer";
import { cn } from "~/lib/utils";
import { getOptionalUser } from "~/server/auth.server";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ context });

  if (user) {
    return redirect("/dashboard");
  }

  const background = await generateImageWithBlurhash(
    "https://images.pexels.com/photos/2486168/pexels-photo-2486168.jpeg",
    {
      height: 1600,
      width: 800,
    },
  );

  return {
    background,
  };
};

export default function AuthLayout() {
  const { t } = useTranslation("auth");
  const { pathname } = useLocation();

  const { background } = useLoaderData<typeof loader>();

  return (
    <>
      <section className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="flex justify-end gap-4 absolute right-1/2 lg:right-1/4 translate-x-1/2 top-4 md:top-8 max-w-[484px] w-[calc(50%+64px)]">
          {pathname === "/signin" && (
            <Link
              to="/signup"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              {t("signup.title")}
            </Link>
          )}
          {(pathname === "/signup" ||
            pathname === "/change-password" ||
            pathname === "/forgot-password") && (
            <Link
              to="/signin"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              {t("signin.title")}
            </Link>
          )}
          {/* <LanguageSwitcher /> */}
        </div>
        <aside className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute flex items-center inset-0 bg-zinc-900 overflow-hidden">
            <LazyImage
              layout="fullWidth"
              alt="Palm tree"
              containerClassName="after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-zinc-900 after:opacity-75"
              src={background.src}
              {...background}
            />
          </div>
          <nav className="relative z-20">
            <Link to="/" className="flex items-center text-lg font-medium">
              <Brand className="w-10 h-10 min-w-10 mr-2" />
              Boilerplate
            </Link>
          </nav>
          <footer className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This library has saved me countless hours of work and
                helped me deliver stunning designs to my clients faster than
                ever before.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </footer>
        </aside>
        <article className="lg:p-8">
          <Outlet />
        </article>
      </section>
      <ShowcaseFooter />
    </>
  );
}
