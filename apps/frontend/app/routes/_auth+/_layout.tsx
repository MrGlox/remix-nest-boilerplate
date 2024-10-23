import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, redirect, useLocation } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { Brand } from "~/assets";
import { buttonVariants } from "~/components/ui/button";
import { LanguageSwitcher } from "~/containers/language-switcher";
import { cn } from "~/lib/utils";
import { getOptionalUser } from "~/server/auth.server";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ context });

  if (user) {
    return redirect("/dashboard");
  }

  return null;
};

export const handle = { i18n: ["common", "auth"] };

export default function AuthLayout() {
  const { t } = useTranslation("auth");
  const { pathname } = useLocation();

  return (
    <>
      <aside className="md:hidden">
        {/* <img
          src="https://images.pexels.com/photos/2486168/pexels-photo-2486168.jpeg"
          width={1280}
          height={843}
          alt="Authentication"
          className="block"
        /> */}
      </aside>
      <section className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="flex gap-4 absolute right-4 top-4 md:right-8 md:top-8">
          {pathname === "/signin" && (
            <Link
              to="/signup"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              {t("signup.title")}
            </Link>
          )}
          {(pathname === "/signup" || pathname === "/forgot-password") && (
            <Link
              to="/signin"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              {t("signin.title")}
            </Link>
          )}
          <LanguageSwitcher />
        </div>
        <aside className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
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
    </>
  );
}
