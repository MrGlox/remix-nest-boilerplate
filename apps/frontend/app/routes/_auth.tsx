import { useTranslation } from "react-i18next";

import { Link, Outlet } from "@remix-run/react";

import { Brand } from "~/assets";
import { buttonVariants } from "~/components/button";
import { cn } from "~/lib/utils";

export const loader = () => {
  return { date: new Date() };
};

export default function AuthLayout() {
  const { t } = useTranslation("auth");

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
      <section className="container relative hidden min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="flex gap-4 absolute right-4 top-4 md:right-8 md:top-8">
          <Link to={""} className={cn(buttonVariants({ variant: "ghost" }))}>
            {t("signup.title")}
          </Link>
          <Link to={""} className={cn(buttonVariants({ variant: "ghost" }))}>
            {t("login.title")}
          </Link>
        </div>
        <aside className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <nav className="relative z-20">
            <Link to="/" className="flex items-center text-lg font-medium">
              <Brand className="w-10 h-10 min-w-10 mr-2" />
              WatchOver Comments
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