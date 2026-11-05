import useIsDark from "@/lib/hooks/useIsDark";

export default function MemberSvgDark({
  size,
  fill,
}: {
  size?: string;
  fill?: string;
}) {
  return (
    <svg
      className={`${size ?? "w-5 h-5 lg:w-5.5 lg:h-5.5"}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill={`${fill ?? "currentColor"}`}
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.25-2.095c.478-.86.75-1.85.75-2.905a5.973 5.973 0 0 0-.75-2.906 4 4 0 1 1 0 5.811ZM15.466 20c.34-.588.535-1.271.535-2v-1a5.978 5.978 0 0 0-1.528-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.535Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
export function MemberSvgLight({
  size,
  fill,
}: {
  size?: string;
  fill?: string;
}) {
  return (
    <svg
      className={`${size ?? "w-5 h-5 lg:w-5.5 lg:h-5.5"}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill={`${fill ?? "none"}`}
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
        d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}
export function MemberSvg({
  size,
  lightFill,
  darkFill,
}: {
  size?: string;
  lightFill?: string;
  darkFill?: string;
}) {
  const isDark = useIsDark();
  return isDark ? (
    <MemberSvgDark size={size} fill={darkFill} />
  ) : (
    <MemberSvgLight size={size} fill={lightFill} />
  );
}
