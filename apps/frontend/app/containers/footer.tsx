import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t">
      <div className="container flex justify-center py-4 text-sm text-gray-500">
        <p>
          &copy; <span className="font-semibold">{t("website")}</span> -{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export { Footer };
