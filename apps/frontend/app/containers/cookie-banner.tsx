import { useLocation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Form } from "react-router-dom";

import { Link } from "~/components/atoms/link";
import { Button } from "~/components/ui/button";

const CookieBanner = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <section className="fixed z-50 flex flex-col min-w-[320px] max-w-[480px] bottom-4 left-4 border bg-white p-4 mr-4">
      <h3 className="font-bold mb-2">{t("cookie.title")}</h3>
      <p className="text-sm mb-4">
        {t("cookie.description")}{" "}
        <Link to="/cookie-policy" reversed>
          {t("cookie.link")}
        </Link>
      </p>
      <nav className="flex gap-2 justify-between">
        {/* <Button variant="link" type="submit">
          {t("cookie.customize")}{" "}
        </Button> */}
        <div className="flex flex-1 gap-2 justify-end">
          <Form method="post">
            <input type="hidden" name="currentRoute" value={pathname} />
            <input type="hidden" name="cookieConsent" value="rejected" />
            <Button variant="outline" type="submit">
              {t("cookie.reject")}
            </Button>
          </Form>
          <Form method="post">
            <input type="hidden" name="currentRoute" value={pathname} />
            <input type="hidden" name="cookieConsent" value="accepted" />
            <Button type="submit">{t("cookie.accept")}</Button>
          </Form>
        </div>
      </nav>
    </section>
  );
};

export { CookieBanner };
