import { getTranslations } from "next-intl/server";
import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-heading text-center mb-8">
        {t("registerTitle")}
      </h1>
      <div className="bg-white rounded-xl border border-border p-6">
        <RegisterForm />
      </div>
    </div>
  );
}
