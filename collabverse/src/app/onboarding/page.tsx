import OnboardingArea from "@/components/onboarding/OnboardingArea";
import ImageChangeWrapper from "@/components/wrappers/ImageChangeWrapper";
import { redirect } from "next/navigation";
import getProfileCompleted from "@/lib/api/auth/getProfileCompleted";

export default async function Page() {
  const profileCompleted = await getProfileCompleted();
  if (!profileCompleted) {
    redirect("/auth/signin");
  }

  if (profileCompleted.profileCompleted) {
    redirect("/app");
  }
  return (
    <ImageChangeWrapper>
      <OnboardingArea />
    </ImageChangeWrapper>
  );
}
