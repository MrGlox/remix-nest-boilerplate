import { useTranslation } from "react-i18next";
import { Container } from "~/components/layout/container";

const AccountNotifications = () => {
  const { t } = useTranslation("dashboard");

  return (
    <Container className="px-0">
      <header className="flex-1 space-y-4 pt-6 pb-4">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("notifications.title")}
        </h2>
      </header>
    </Container>
  );
};

export default AccountNotifications;
