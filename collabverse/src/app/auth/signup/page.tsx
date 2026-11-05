import SignUpArea from "@/components/signup/SignupArea";
import ImageChangeWrapper from "@/components/wrappers/ImageChangeWrapper";

export default async function SignUp() {
  return (
    <ImageChangeWrapper>
      <SignUpArea />
    </ImageChangeWrapper>
  );
}
