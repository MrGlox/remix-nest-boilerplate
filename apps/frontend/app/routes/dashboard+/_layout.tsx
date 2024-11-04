import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { Brand } from "~/assets";
import { Container } from "~/components/layout/container";
import { Button } from "~/components/ui/button";
import { getOptionalUser } from "~/server/auth.server";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ context });

  if (!user) {
    return redirect("/signin");
  }

  return null;
};

const DashboardLayout = () => {
  const { t } = useTranslation();

  return (
    <>
      <header className="hidden flex-col md:flex border-b">
        <Container size="large">
          <div className="flex h-16 items-center px-4 justify-between">
            <nav>
              <Link
                to="/dashboard"
                className="flex items-center text-lg font-medium"
              >
                <Brand className="w-10 h-10 min-w-10 mr-2" />
                Boilerplate
              </Link>
            </nav>
            <form method="POST" action="/auth/logout">
              <Button type="submit" className="text-xs">
                {t("logout")}
              </Button>
            </form>
          </div>
        </Container>
      </header>
      <Outlet />
    </>
  );
};

export default DashboardLayout;
