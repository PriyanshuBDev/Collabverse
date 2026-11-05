import InviteToWsBtn from "@/components/btns/workspace/invitation/InviteToWsBtn";
import UsersArea from "@/components/users/UsersArea";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";

export default function Members() {
  return (
    <div className="dark:text-white w-full h-full text-gray-900 p-5 ">
      <FlexBtwWrapper>
        <div className="flex flex-col">
          <div className="text-black font-semibold dark:text-gray-100 text-xl md:text-2xl lg:text-3xl">
            Users
          </div>
          <div className="text-gray-600  dark:text-gray-400 text-xs md:text-sm lg:text-base">
            Every user, one click away.
          </div>
        </div>
        <InviteToWsBtn />
      </FlexBtwWrapper>
      <UsersArea></UsersArea>
    </div>
  );
}
