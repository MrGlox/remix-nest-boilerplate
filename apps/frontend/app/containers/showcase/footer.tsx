import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "../language-switcher";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t px-4">
      <div className="flex justify-between items-center p-4">
        <p className="text-sm text-gray-500">
          &copy; <span className="font-semibold">{t("website")}</span> -{" "}
          {new Date().getFullYear()}
        </p>
        <LanguageSwitcher />
      </div>
    </footer>
  );
};

export { Footer };
