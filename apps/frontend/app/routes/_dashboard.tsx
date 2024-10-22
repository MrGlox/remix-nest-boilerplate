import { Outlet } from "@remix-run/react";

import { Link } from "~/components/atoms/link";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const DashboardLayout = () => {
  return (
    <>
      <div className="md:hidden"></div>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <Link
              to="/logout"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Logout
            </Link>
            <div className="ml-auto flex items-center space-x-4"></div>
          </div>
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default DashboardLayout;
