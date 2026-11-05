import SignInArea from "@/components/signin/SignInArea";
import ImageChangeWrapper from "@/components/wrappers/ImageChangeWrapper";

export default async function Signin() {
  return (
    <ImageChangeWrapper>
      <SignInArea />
    </ImageChangeWrapper>
  );
}
