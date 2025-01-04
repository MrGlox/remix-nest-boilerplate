import { Notification } from "@prisma/client";
import { BellIcon, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

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

type NotificationsCardProps = {
  notifications: Notification[];
  newNotifications?: boolean;
};

const notificationTypes = {
  info: "bg-sky-500",
  warning: "bg-yellow-500",
  error: "bg-destructive",
};

export function NotificationsCard({
  notifications,
  newNotifications,
  ...props
}: NotificationsCardProps) {
  const { t } = useTranslation("notifications");

  const [active, setActive] = useState<boolean>(false);
  const [animate, setAnimate] = useState<boolean>(false);

  const activeNotifications = notifications.filter(({ read }) => !read);

  useEffect(() => {
    if (newNotifications) {
      setAnimate(() => true);
    }

    setTimeout(() => {
      setAnimate(() => false);
    }, 500);
  }, [newNotifications]);

  return (
    <DropdownMenu {...props} onOpenChange={(open) => setActive(open)}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative rounded-full w-10 h-10 p-0 transition-transform ",
            animate ? "animate-swing repeat-5" : "",
          )}
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
            {activeNotifications.length > 10
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
        <CardContent className="grid gap-4">
          {/* <div className=" flex items-center space-x-4 rounded-md border p-4">
              <BellRing />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Push Notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  Send notifications to device.
                </p>
              </div>
              <Switch />
            </div> */}
          <ul className="overflow-y-auto max-h-[300px]">
            {notifications.map(({ message, type, read }, index) => (
              <li
                key={index}
                className="mb-4 grid grid-cols-[25px_1fr] items-start last:mb-0 last:pb-0"
              >
                {!read && (
                  <span
                    className={cn(
                      "flex h-2 w-2 translate-y-1 rounded-full",
                      notificationTypes?.[type.toLowerCase()] || "bg-sky-500",
                    )}
                  />
                )}
                <div className="space-y-1">
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
        <CardFooter>
          <Button className="w-full">
            <Check /> Mark all as read
          </Button>
        </CardFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
