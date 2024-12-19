import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Brand } from "~/assets";
import { Container } from "~/components/layout/container";
import { Button } from "~/components/ui/button";

export const ShowcaseHeader = ({ isAuth }) => {
  const { t } = useTranslation();

  return (
    <header className="border-b sticky z-50 top-0 w-full">
      <Container
        size="large"
        className="flex h-16 items-center px-4 justify-between"
      >
        <Link to="/" className="flex items-center text-lg font-medium">
          <Brand className="w-10 h-10 min-w-10 mr-2" />
          {t("website")}
        </Link>
        {isAuth && (
          <Button asChild variant="ghost">
            <Link to="/dashboard">{t("title", { ns: "dashboard" })}</Link>
          </Button>
        )}
        {!isAuth && (
          <nav>
            <ul className="flex gap-2">
              <li>
                <Button asChild variant="ghost">
                  <Link to="/signup">{t("signup.title", { ns: "auth" })}</Link>
                </Button>
              </li>
              <li>
                <Button asChild>
                  <Link to="/signin">{t("signin.title", { ns: "auth" })}</Link>
                </Button>
              </li>
            </ul>
          </nav>
        )}
      </Container>
    </header>
  );
};
