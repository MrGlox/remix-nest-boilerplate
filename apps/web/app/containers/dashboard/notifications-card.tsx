import { Notification } from "@repo/database";
import { BellIcon, Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { Form } from "react-router";
import { useRemixForm } from "remix-hook-form";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Loader } from "~/components/ui/loader";

type NotificationsCardProps = {
  notifications: Notification[];
};

const notificationTypes = {
  info: "bg-sky-500",
  warning: "bg-yellow-500",
  error: "bg-destructive",
};

export function NotificationsCard({
  notifications,
  ...props
}: NotificationsCardProps) {
  const { t } = useTranslation("notifications");

  const { handleSubmit, formState } = useRemixForm({
    defaultValues: {
      notifications,
    },
    submitConfig: {
      method: "POST",
      action: "/dashboard",
    },
  });

  const [active, setActive] = useState<boolean>(false);
  const activeNotifications = notifications.filter(({ read }) => !read);

  return (
    <DropdownMenu
      {...props}
      onOpenChange={(open) => setActive(open)}
      open={active}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={"relative rounded-full w-10 h-10 p-0 transition-transform"}
        >
          <span
            className={cn(
              "absolute origin-center inline-flex justify-center items-center",
              "top-1/4 right-1/4 w-2 h-2 translate-0 bg-destructive rounded-full scale-100 transition-all duration-700",
              activeNotifications.length !== 0
                ? "scale-75 w-6 h-6 top-1/4 right-1/4 text-white text-xs translate-x-1/3 -translate-y-1/2"
                : "scale-0",
              active ? "scale-0 w-4 h-4 top-1/2 right-1/2" : "",
            )}
          >
            {activeNotifications.length > 9
              ? "9+"
              : activeNotifications.length !== 0 && activeNotifications.length}
          </span>
          <BellIcon className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[380px]" align="end">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("description", {
              count: activeNotifications.length,
            })}
          </CardDescription>
        </CardHeader>
        {notifications?.length !== 0 && (
          <CardContent className="grid gap-4">
            <ul className="overflow-y-auto max-h-[300px]">
              {notifications.map(({ message, type, read }, index) => (
                <li
                  key={index}
                  className={cn(
                    "mb-4 items-start last:mb-0 last:pb-0 grid grid-cols-[25px_1fr]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-2 w-2 translate-y-1 rounded-full",
                      read
                        ? "bg-gray-300"
                        : notificationTypes?.[type?.toLowerCase()] ||
                            "bg-sky-500",
                    )}
                  />
                  <div className={cn("space-y-1")}>
                    <p className="text-sm font-medium leading-none">
                      {t(`${message}.title`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`${message}.description`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        )}

        {activeNotifications.length !== 0 && (
          <CardFooter>
            <Form
              onSubmit={() => {
                setTimeout(() => {
                  setActive(false);
                }, 100);

                return handleSubmit();
              }}
              className="w-full"
            >
              <Button className="w-full" disabled={formState.isSubmitting}>
                {!formState.isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Check /> Mark all as read
                  </div>
                ) : (
                  <Loader />
                )}
              </Button>
            </Form>
          </CardFooter>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
