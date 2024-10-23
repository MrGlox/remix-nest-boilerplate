import { Link, Outlet } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { Brand } from "~/assets";
import { Button } from "~/components/ui/button";

const DashboardLayout = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="md:hidden"></div>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
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
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default DashboardLayout;
