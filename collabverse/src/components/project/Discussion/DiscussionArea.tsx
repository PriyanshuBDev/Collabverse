// "use client";

// import {
//   useCallback,
//   useEffect,
//   useLayoutEffect,
//   useRef,
//   useState,
// } from "react";
// import CommentsDateIndicatorFormatter from "@/lib/functions/date/commentsDateIndicatorFormatter";
// import {
//   commentReplyProps,
//   mentionedUserProps,
//   ProjectMembersProps,
//   taskCommentProps,
// } from "@/app/interfaces";
// import CommentChatBubble from "@/components/ChatComponents/CommentChatBubble";
// import InputEditor from "@/components/ChatComponents/InputEditor";
// import PinBar from "@/components/ChatComponents/PinBar";
// import DeleteSelected from "@/components/ChatComponents/DeleteSelected";
// import { useOpenUser } from "@/lib/stateMangement/useOpenUser";
// import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
// import Xbtn from "@/components/btns/Xbtn";
// import { useIsAllowedToCommentProject } from "@/lib/hooks/useIsAllowedProject";

// interface commentMentionProps {
//   id: string;
//   mentions: mentionedUserProps[];
//   date: Date;
// }
// interface commentPerm {
//   contriCanComment: boolean;
//   viewerCanComment: boolean;
// }

// export default function DiscussionArea() {
//   const currentUserId = "u2";
//   const canComment = useIsAllowedToCommentProject();
//   const users: ProjectMembersProps[] = [
//     {
//       id: "u1",
//       name: "Alice Johnson",
//       username: "@alice",
//       role: "Manager",
//       avatar: "https://picsum.photos/200?random=11",
//     },
//     {
//       id: "u2",
//       name: "Bob Smith",
//       username: "@bob",
//       role: "Contributor",
//       avatar: "https://picsum.photos/200?random=12",
//     },
//     {
//       id: "u3",
//       name: "Carol Lee",
//       username: "@carol",
//       role: "Viewer",
//       avatar: "https://picsum.photos/200?random=13",
//     },
//     {
//       id: "u4",
//       name: "Daniel Green",
//       username: "@daniel",
//       role: "Manager",
//       avatar: "https://picsum.photos/200?random=14",
//     },
//     {
//       id: "u5",
//       name: "Evelyn Brown",
//       username: "@evelyn",
//       role: "Contributor",
//       avatar: "https://picsum.photos/200?random=15",
//     },
//     {
//       id: "u6",
//       name: "Frank White",
//       username: "@frank",
//       role: "Viewer",
//       avatar: "https://picsum.photos/200?random=16",
//     },
//     {
//       id: "u8",
//       name: "Henry Wilson",
//       username: "@henry",
//       role: "Contributor",
//       avatar: "https://picsum.photos/200?random=18",
//     },
//     {
//       id: "u11",
//       name: "Kate Parker",
//       username: "@kate",
//       role: "Contributor",
//       avatar: "https://picsum.photos/200?random=21",
//     },
//     {
//       id: "u9",
//       name: "Ivy Chen",
//       username: "@ivy",
//       role: "Viewer",
//       avatar: "https://picsum.photos/200?random=19",
//     },
//   ];
//   const { showUserId, setShowUserId } = useOpenUser();
//   const [comments, setComments] = useState<taskCommentProps[]>([
//     {
//       id: "1",
//       commentedBy: {
//         name: "Aarav Mehta",
//         id: "u1",
//         username: "@alice",
//         avatar: "https://picsum.photos/200?random=1",
//       },
//       comment: "Just finished setting up the project structure!",
//       createdAt: new Date("2025-10-29T09:12:00Z"),
//       readBy: ["u1", "u2"],
//       reactions: [
//         {
//           emoji: "👍",
//           count: 2,
//           reactedBy: [
//             {
//               id: "1",
//               name: "Alice",
//               avatar: "https://picsum.photos/200?random=1",
//               username: "@alice",
//             },
//             {
//               id: "2",
//               name: "Bob",
//               avatar: "https://picsum.photos/200?random=2",
//               username: "@alice",
//             },
//           ],
//         },
//         {
//           emoji: "❤️",
//           count: 2,
//           reactedBy: [
//             {
//               id: "4",
//               name: "Diana",
//               avatar: "https://picsum.photos/200?random=4",
//               username: "@alice",
//             },
//             {
//               id: "5",
//               name: "Ethan",
//               avatar: "https://picsum.photos/200?random=5",
//               username: "@alice",
//             },
//           ],
//         },
//       ],
//       pinIdx: 3,
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "212",
//       commentedBy: {
//         name: "Priya Sharma",
//         id: "u2",
//         avatar: "https://picsum.photos/200?random=2",
//         username: "@alice",
//       },
//       comment: `<p>Hello i think i am letting <span class="mention text-blue-500 font-medium cursor-pointer" data-id="u2" data-name="Bob Smith" data-avatar="https://picsum.photos/200?random=12" data-username="@bob">@bob</span> go and promoting <span class="mention text-blue-500 font-medium cursor-pointer" data-id="u3" data-name="Carol Lee" data-avatar="https://picsum.photos/200?random=13" data-username="@carol">@carol</span> </p>`,
//       createdAt: new Date("2025-10-11T09:13:30Z"),
//       mentions: [
//         { id: "u2", name: "Bob Smith", seen: false },
//         { id: "u1", name: "Alice Johnson", seen: true },
//       ],
//       pinIdx: 1,
//       readBy: ["u1", "u2"],
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "2",
//       commentedBy: {
//         name: "Priya Sharma",
//         id: "u2",
//         avatar: "https://picsum.photos/200?random=2",
//         username: "@alice",
//       },
//       comment: `Nice work! I'll handle the UI setup next.`,
//       createdAt: new Date("2025-10-29T09:13:30Z"),
//       reactions: [
//         {
//           emoji: "😂",
//           count: 4,
//           reactedBy: [
//             {
//               id: "6",
//               name: "Fiona",
//               avatar: "https://picsum.photos/200?random=6",
//               username: "@alice",
//             },
//             {
//               id: "7",
//               name: "George",
//               avatar: "https://picsum.photos/200?random=7",
//               username: "@alice",
//             },
//             {
//               id: "8",
//               name: "Hannah",
//               avatar: "https://picsum.photos/200?random=8",
//               username: "@alice",
//             },
//             {
//               id: "9",
//               name: "Ian",
//               avatar: "https://picsum.photos/200?random=9",
//               username: "@alice",
//             },
//           ],
//         },
//       ],
//       replyTo: {
//         commentId: "1",
//         comment: "Just finished setting up the project structure!",
//         commentedBy: {
//           name: "Aarav Mehta",
//           id: "u1",
//           avatar: "https://picsum.photos/200?random=1",
//           username: "@alice",
//         },
//         isDeleted: false,
//         isDeletedForMe: false,
//       },
//       readBy: ["u1", "u2"],
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "3",
//       commentedBy: {
//         name: "Rahul Verma",
//         id: "u3",
//         avatar: "https://picsum.photos/200?random=3",
//         username: "@alice",
//       },
//       comment: "Can we integrate Zustand for state management?",
//       createdAt: new Date("2025-10-30T09:15:45Z"),
//       readBy: ["u1"],
//       pinIdx: 6,
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "4",
//       commentedBy: {
//         name: "Aarav Mehta",
//         id: "u1",
//         avatar: "https://picsum.photos/200?random=1",
//         username: "@alice",
//       },
//       comment: "Yes, Zustand is perfect for this setup!",
//       createdAt: new Date("2025-10-29T09:17:10Z"),
//       pinIdx: 2,
//       reactions: [
//         {
//           emoji: "👏",
//           count: 2,
//           reactedBy: [
//             {
//               id: "11",
//               name: "Kate",
//               avatar: "https://picsum.photos/200?random=11",
//               username: "@alice",
//             },
//             {
//               id: "12",
//               name: "Leo",
//               avatar: "https://picsum.photos/200?random=12",
//               username: "@alice",
//             },
//           ],
//         },
//         {
//           emoji: "😮",
//           count: 3,
//           reactedBy: [
//             {
//               id: "13",
//               name: "Mia",
//               avatar: "https://picsum.photos/200?random=13",
//               username: "@alice",
//             },
//             {
//               id: "14",
//               name: "Nina",
//               avatar: "https://picsum.photos/200?random=14",
//               username: "@alice",
//             },
//             {
//               id: "15",
//               name: "Oscar",
//               avatar: "https://picsum.photos/200?random=15",
//               username: "@alice",
//             },
//           ],
//         },
//       ],
//       replyTo: {
//         commentId: "3",
//         comment: "Can we integrate Zustand for state management?",
//         commentedBy: {
//           name: "Rahul Verma",
//           id: "u3",
//           avatar: "https://picsum.photos/200?random=3",
//           username: "@alice",
//         },
//         isDeletedForMe: false,
//         isDeleted: false,
//       },
//       mentions: [
//         { id: "u2", name: "Bob Smith", seen: false },
//         { id: "u1", name: "Alice Johnson", seen: true },
//       ],
//       readBy: ["u1"],
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "5",
//       commentedBy: {
//         name: "Simran Kaur",
//         id: "u4",
//         avatar: "https://picsum.photos/200?random=4",
//         username: "@alice",
//       },
//       comment: "I’ll start working on the comment component styling.",
//       createdAt: new Date("2025-10-29T09:18:30Z"),
//       reactions: [
//         {
//           emoji: "👏",
//           count: 2,
//           reactedBy: [
//             {
//               id: "13",
//               name: "Mia",
//               avatar: "https://picsum.photos/200?random=13",
//               username: "@alice",
//             },
//             {
//               id: "14",
//               name: "Noah",
//               avatar: "https://picsum.photos/200?random=14",
//               username: "@alice",
//             },
//           ],
//         },
//       ],
//       replyTo: {
//         commentId: "212",
//         comment: `<p>Hello i think i am letting <span class="text-blue-500 font-medium cursor-pointer" data-id="mem-2">@bob</span> go and promoting <span class="text-blue-500 font-medium cursor-pointer" data-id="mem-1">@alice</span> </p>`,
//         commentedBy: {
//           name: "Priya Sharma",
//           id: "u2",
//           avatar: "https://picsum.photos/200?random=2",
//           username: "@alice",
//         },
//         isDeletedForMe: false,
//         isDeleted: false,
//       },
//       mentions: [
//         { id: "u2", name: "Bob Smith", seen: false },
//         { id: "u1", name: "Alice Johnson", seen: true },
//       ],
//       pinIdx: 4,
//       readBy: ["u1"],
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "6",
//       commentedBy: {
//         name: "Rahul Verma",
//         id: "u3",
//         avatar: "https://picsum.photos/200?random=3",
//         username: "@alice",
//       },
//       comment: "Make sure the comment bubbles support replies and reactions.",
//       createdAt: new Date("2025-10-30T09:20:00Z"),
//       reactions: [
//         {
//           emoji: "🤔",
//           count: 1,
//           reactedBy: [
//             {
//               id: "18",
//               name: "Rose",
//               avatar: "https://picsum.photos/200?random=18",
//               username: "@alice",
//             },
//           ],
//         },
//         {
//           emoji: "💀",
//           count: 2,
//           reactedBy: [
//             {
//               id: "19",
//               name: "Sam",
//               avatar: "https://picsum.photos/200?random=19",
//               username: "@alice",
//             },
//             {
//               id: "20",
//               name: "Tina",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=20",
//             },
//           ],
//         },
//       ],
//       replyTo: {
//         commentId: "5",
//         comment: "I'll start working on the comment component styling.",
//         commentedBy: {
//           name: "Simran Kaur",
//           id: "u4",
//           username: "@alice",
//           avatar: "https://picsum.photos/200?random=4",
//         },
//         isDeletedForMe: false,
//         isDeleted: false,
//       },
//       mentions: [
//         { id: "u2", name: "Bob Smith", seen: true },
//         { id: "u1", name: "Alice Johnson", seen: false },
//       ],
//       readBy: ["u1"],
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "7",
//       commentedBy: {
//         name: "Aarav Mehta",
//         id: "u1",
//         username: "@alice",
//         avatar: "https://picsum.photos/200?random=1",
//       },
//       comment: "We should also group comments by date for better readability.",
//       createdAt: new Date("2025-10-30T07:10:00Z"),
//       readBy: [],
//       mentions: [
//         { id: "u2", name: "Bob Smith", seen: false },
//         { id: "u1", name: "Alice Johnson", seen: true },
//       ],
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "8",
//       commentedBy: {
//         name: "Priya Sharma",
//         id: "u2",
//         username: "@alice",
//         avatar: "https://picsum.photos/200?random=2",
//       },
//       comment: "Agreed. I’ll handle that in the frontend logic.",
//       createdAt: new Date("2025-10-30T07:12:00Z"),
//       replyTo: {
//         commentId: "7",
//         comment:
//           "We should also group comments by date for better readability.",
//         commentedBy: {
//           name: "Aarav Mehta",
//           id: "u1",
//           username: "@alice",
//           avatar: "https://picsum.photos/200?random=1",
//         },
//         isDeletedForMe: false,
//         isDeleted: false,
//       },
//       readBy: ["u1"],
//       mentions: [
//         { id: "u2", name: "Bob Smith", seen: false },
//         { id: "u1", name: "Alice Johnson", seen: true },
//       ],
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "9",
//       commentedBy: {
//         name: "Simran Kaur",
//         id: "u4",
//         username: "@alice",
//         avatar: "https://picsum.photos/200?random=4",
//       },
//       comment: "Can we make the scroll smoother when jumping to replies?",
//       createdAt: new Date("2025-10-30T07:15:00Z"),
//       reactions: [
//         {
//           emoji: "🥳",
//           count: 3,
//           reactedBy: [
//             {
//               id: "22",
//               name: "Vera",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=22",
//             },
//             {
//               id: "23",
//               name: "Will",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=23",
//             },
//             {
//               id: "24",
//               name: "Xena",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=24",
//             },
//           ],
//         },
//         {
//           emoji: "💀",
//           count: 2,
//           reactedBy: [
//             {
//               id: "25",
//               name: "Yara",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=25",
//             },
//             {
//               id: "26",
//               name: "Zack",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=26",
//             },
//           ],
//         },
//         {
//           emoji: "💯",
//           count: 3,
//           reactedBy: [
//             {
//               id: "27",
//               name: "Aaron",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=27",
//             },
//             {
//               id: "28",
//               name: "Bella",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=28",
//             },
//             {
//               id: "29",
//               name: "Chris",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=29",
//             },
//           ],
//         },
//       ],
//       pinIdx: 5,
//       readBy: ["u1"],
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "10",
//       commentedBy: {
//         name: "Rahul Verma",
//         id: "u3",
//         username: "@alice",
//         avatar: "https://picsum.photos/200?random=3",
//       },
//       comment: "Yes, we can use `scrollIntoView({ behavior: 'smooth' })`.",
//       createdAt: new Date("2025-10-30T07:16:30Z"),
//       reactions: [
//         {
//           emoji: "😎",
//           count: 3,
//           reactedBy: [
//             {
//               id: "26",
//               name: "Zane",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=26",
//             },
//             {
//               id: "27",
//               name: "Bella",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=27",
//             },
//             {
//               id: "28",
//               name: "Chris",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=28",
//             },
//             {
//               id: "30",
//               name: "pb",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=3",
//             },
//           ],
//         },
//       ],
//       replyTo: {
//         commentId: "9",
//         comment: "Can we make the scroll smoother when jumping to replies?",
//         commentedBy: {
//           name: "Simran Kaur",
//           id: "u4",
//           username: "@alice",
//           avatar: "https://picsum.photos/200?random=4",
//         },
//         isDeletedForMe: false,
//         isDeleted: false,
//       },
//       readBy: ["u1"],
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "11",
//       commentedBy: {
//         name: "Priya Sharma",
//         id: "u2",
//         username: "@alice",
//         avatar: "https://picsum.photos/200?random=2",
//       },
//       comment: "Love how this is turning out 🔥",
//       createdAt: new Date("2025-10-30T07:20:00Z"),
//       reactions: [
//         {
//           emoji: "😂",
//           count: 2,
//           reactedBy: [
//             {
//               id: "8",
//               name: "Hannah",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=8",
//             },
//             {
//               id: "9",
//               name: "Ivan",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=9",
//             },
//           ],
//         },
//       ],
//       readBy: ["u1"],
//       isDeletedForMe: false,
//       isDeleted: false,
//     },
//     {
//       id: "12",
//       commentedBy: {
//         name: "Aarav Mehta",
//         id: "u2",
//         username: "@alice",
//         avatar: "https://picsum.photos/200?random=1",
//       },
//       comment: "Thanks everyone for the feedback! 🚀",
//       createdAt: new Date("2025-10-30T07:22:00Z"),
//       reactions: [
//         {
//           emoji: "👍",
//           count: 3,
//           reactedBy: [
//             {
//               id: "1",
//               name: "Alice",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=1",
//             },
//             {
//               id: "2",
//               name: "Bob",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=2",
//             },
//             {
//               id: "3",
//               name: "Charlie",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=3",
//             },
//           ],
//         },
//         {
//           emoji: "❤️",
//           count: 2,
//           reactedBy: [
//             {
//               id: "4",
//               name: "Diana",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=4",
//             },
//             {
//               id: "5",
//               name: "Ethan",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=5",
//             },
//           ],
//         },
//         {
//           emoji: "😂",
//           count: 4,
//           reactedBy: [
//             {
//               id: "6",
//               name: "Fiona",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=6",
//             },
//             {
//               id: "7",
//               name: "George",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=7",
//             },
//             {
//               id: "8",
//               name: "Hannah",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=8",
//             },
//             {
//               id: "9",
//               name: "Ian",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=9",
//             },
//           ],
//         },
//         {
//           emoji: "🔥",
//           count: 1,
//           reactedBy: [
//             {
//               id: "10",
//               name: "Jack",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=10",
//             },
//           ],
//         },
//         {
//           emoji: "👏",
//           count: 2,
//           reactedBy: [
//             {
//               id: "11",
//               name: "Kate",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=11",
//             },
//             {
//               id: "12",
//               name: "Leo",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=12",
//             },
//           ],
//         },
//         {
//           emoji: "😮",
//           count: 3,
//           reactedBy: [
//             {
//               id: "13",
//               name: "Mia",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=13",
//             },
//             {
//               id: "14",
//               name: "Nina",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=14",
//             },
//             {
//               id: "15",
//               name: "Oscar",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=15",
//             },
//           ],
//         },
//         {
//           emoji: "😢",
//           count: 2,
//           reactedBy: [
//             {
//               id: "16",
//               name: "Paul",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=16",
//             },
//             {
//               id: "17",
//               name: "Quinn",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=17",
//             },
//           ],
//         },
//         {
//           emoji: "🤔",
//           count: 1,
//           reactedBy: [
//             {
//               id: "18",
//               name: "Rose",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=18",
//             },
//           ],
//         },
//         {
//           emoji: "💀",
//           count: 2,
//           reactedBy: [
//             {
//               id: "19",
//               name: "Sam",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=19",
//             },
//             {
//               id: "20",
//               name: "Tina",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=20",
//             },
//           ],
//         },
//         {
//           emoji: "🥳",
//           count: 3,
//           reactedBy: [
//             {
//               id: "21",
//               name: "Uma",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=21",
//             },
//             {
//               id: "22",
//               name: "Vince",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=22",
//             },
//             {
//               id: "23",
//               name: "Wade",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=23",
//             },
//           ],
//         },
//         {
//           emoji: "💯",
//           count: 2,
//           reactedBy: [
//             {
//               id: "24",
//               name: "Xander",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=24",
//             },
//             {
//               id: "25",
//               name: "Yara",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=25",
//             },
//           ],
//         },
//         {
//           emoji: "😎",
//           count: 3,
//           reactedBy: [
//             {
//               id: "26",
//               name: "Zane",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=26",
//             },
//             {
//               id: "27",
//               name: "Bella",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=27",
//             },
//             {
//               id: "28",
//               name: "Chris",
//               username: "@alice",
//               avatar: "https://picsum.photos/200?random=28",
//             },
//           ],
//         },
//       ],
//       replyTo: {
//         commentId: "3",
//         comment: "Can we integrate Zustand for state management?",
//         commentedBy: {
//           name: "Rahul Verma",
//           id: "u3",
//           username: "@alice",
//           avatar: "https://picsum.photos/200?random=3",
//         },
//         isDeletedForMe: false,
//         isDeleted: true,
//       },
//       readBy: [],
//       isDeletedForMe: true,
//       isDeleted: false,
//     },
//   ]);
//   const [reply, setReply] = useState<commentReplyProps | null>(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showUnreadBar, setShowUnreadBar] = useState<boolean>(unreadCount > 0);
//   const [firstUnread, setFirstUnread] = useState<string>();
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const [currentDate, setCurrentDate] = useState<string | null>(null);
//   const [ready, setReady] = useState(false);
//   const [showDate, setShowDate] = useState(false);
//   const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
//   const chatContainerRef = useRef<HTMLDivElement | null>(null);
//   const [highlightId, setHighlightId] = useState<string | null>(null);
//   const [mentions, setMentions] = useState<commentMentionProps[]>([]);
//   const [pins, setPins] = useState<taskCommentProps[]>([]);
//   const [showPinBar, setShowPinBar] = useState(false);
//   const [showMention, setShowMention] = useState(false);
//   const [localSeenMentions, setLocalSeenMentions] = useState<Set<string>>(
//     new Set(),
//   );
//   const [selectedComments, setSelectedComments] = useState<string[]>([]);
//   const [showDelete, setShowDelete] = useState(false);
//   const isUserNearBottomRef = useRef(true);
//   const isAutoScrollingRef = useRef(false);
//   const imagesPendingRef = useRef(0);
//   const prevCountRef = useRef(comments?.length);
//   const hasInitialScrollRef = useRef(false);
//   const pendingScrollToRef = useRef<string | null>(null);
//   const isHandlingMentionRef = useRef<boolean>(false);
//   const isDeletingRef = useRef(false);
//   const permissions: commentPerm = {
//     contriCanComment: true,
//     viewerCanComment: false,
//   };
//   const [mentionIndex, setMentionIndex] = useState(0);
//   const remainingMentions = Math.max(
//     mentions.filter((m) => !localSeenMentions.has(m.id)).length,
//     0,
//   );
//   const handleScrollTo = (targetId: string) => {
//     const element = document.getElementById(`message-${targetId}`);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth", block: "center" });

//       setHighlightId(targetId);
//       setTimeout(() => setHighlightId(null), 2000);
//     }
//   };
//   const handleScrollToLatestMention = () => {
//     if (!mentions.length) return;
//     const target = mentions[mentionIndex];

//     setLocalSeenMentions((prev) => new Set(prev).add(target.id));
//     pendingScrollToRef.current = target.id;
//     isHandlingMentionRef.current = true;
//     // axios.post for making the mention.seen to true
//     setMentionIndex((i) => Math.min(i + 1, Math.max(0, mentions.length)));
//   };
//   useEffect(() => {
//     if (mentions.length) {
//       setMentionIndex(0);
//     }
//   }, [mentions]);
//   useEffect(() => {
//     const allMentions: commentMentionProps[] = [];
//     comments.map((c: taskCommentProps) => {
//       if (c.mentions) {
//         allMentions.push({
//           id: c.id,
//           mentions: c.mentions!,
//           date: c.createdAt,
//         });
//       }
//     });
//     const filterd = allMentions
//       .filter((m: commentMentionProps) =>
//         m.mentions.some(
//           (mention: mentionedUserProps) =>
//             mention.id === currentUserId &&
//             mention.seen === false &&
//             !localSeenMentions.has(m.id),
//         ),
//       )
//       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//     setMentions(filterd);

//     // Show/hide button based on actual filterd mentions
//     setShowMention(filterd.length > 0);

//     if (isHandlingMentionRef.current && pendingScrollToRef.current) {
//       const id = pendingScrollToRef.current;
//       requestAnimationFrame(() => {
//         const el = document.getElementById(`message-${id}`);
//         if (el) {
//           el.scrollIntoView({ behavior: "smooth", block: "center" });
//           setHighlightId(id);
//           setTimeout(() => setHighlightId(null), 2000);
//         }
//       });
//       pendingScrollToRef.current = null;
//       isHandlingMentionRef.current = false;
//     }
//   }, [comments, localSeenMentions]);

//   useEffect(() => {
//     const filterd = comments.filter(
//       (c: taskCommentProps) => c.pinIdx && !c.isDeleted && !c.isDeletedForMe,
//     );

//     if (filterd.length > 0) {
//       setPins(filterd.sort((a, b) => b.pinIdx! - a.pinIdx!));
//       setShowPinBar(true);
//     }
//   }, [comments]);
//   const groupedCommentsByDate = comments?.reduce<
//     Record<string, taskCommentProps[]>
//   >((acc, comment) => {
//     const date = new Date(comment.createdAt).toISOString().split("T")[0];
//     if (!acc[date]) acc[date] = [];
//     acc[date].push(comment);
//     return acc;
//   }, {});

//   const sortedGroupedComments = Object.entries(
//     groupedCommentsByDate ?? {},
//   ).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());

//   useEffect(() => {
//     const unReads = comments.filter(
//       (c: taskCommentProps) => !c.readBy.includes(currentUserId),
//     ).length;
//     setUnreadCount(unReads);
//     const firstUnreadGlobal = sortedGroupedComments
//       .flatMap(([, comments]) => comments)
//       .find((c: taskCommentProps) => !c.readBy.includes(currentUserId))?.id;
//     setFirstUnread(firstUnreadGlobal);
//   }, [sortedGroupedComments, comments]);

//   const markAsRead = async (commentId: string) => {
//     //   await fetch("/api/comments/mark-read", {
//     //   method: "POST",
//     //   body: JSON.stringify({ commentId }),
//     // });
//   };

//   useEffect(() => {
//     setShowUnreadBar(unreadCount > 0);
//   }, [unreadCount]);

//   // Floating Date Logic start
//   const rafRef = useRef<number | null>(null);

//   function scrollToBottom({ smooth = true } = {}) {
//     const c = chatContainerRef.current;
//     if (!c) return;
//     isAutoScrollingRef.current = true;
//     c.scrollTo({ top: c.scrollHeight, behavior: smooth ? "smooth" : "auto" });
//     // give the browser time to complete.
//     window.setTimeout(() => {
//       isAutoScrollingRef.current = false;
//     }, 300);
//   }

//   const scrollToFirstUnread = useCallback(() => {
//     if (!firstUnread) return;
//     const el = document.getElementById(`message-${firstUnread}`);
//     if (!el) return;
//     isAutoScrollingRef.current = true;
//     el.scrollIntoView({ behavior: "auto", block: "center" });
//     setTimeout(() => (isAutoScrollingRef.current = false), 300);
//   }, [firstUnread]);

//   // update floating date based on visible date headings
//   const updateCurrentDateFromScroll = () => {
//     const container = chatContainerRef.current;
//     if (!container) return;
//     const dateEls = Array.from(
//       container.querySelectorAll<HTMLElement>("[id^='date-']"),
//     );
//     if (dateEls.length === 0) {
//       setCurrentDate(null);
//       return;
//     }
//     const containerRect = container.getBoundingClientRect();
//     const anchorY = containerRect.top + 8;
//     let activeDate: string | null = null;
//     for (const el of dateEls) {
//       const r = el.getBoundingClientRect();
//       if (r.top <= anchorY) activeDate = el.id.replace("date-", "");
//       else break;
//     }
//     if (!activeDate) {
//       const firstVisible = dateEls.find((el) => {
//         const r = el.getBoundingClientRect();
//         return r.top < containerRect.bottom && r.bottom > containerRect.top;
//       });
//       activeDate = firstVisible ? firstVisible.id.replace("date-", "") : null;
//     }
//     setCurrentDate((prev) => (prev === activeDate ? prev : activeDate));
//   };

//   const handleScroll = () => {
//     if (isAutoScrollingRef.current) return;
//     if (!showDate) setShowDate(true);
//     if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
//     scrollTimeout.current = setTimeout(() => setShowDate(false), 1200);
//     if (rafRef.current) cancelAnimationFrame(rafRef.current);
//     rafRef.current = requestAnimationFrame(() => updateCurrentDateFromScroll());
//   };

//   // keep track if user is near bottom
//   useEffect(() => {
//     const c = chatContainerRef.current;
//     if (!c) return;
//     const onScroll = () => {
//       const nearBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 10;
//       isUserNearBottomRef.current = nearBottom;
//       setShowScrollButton(!nearBottom);
//     };
//     c.addEventListener("scroll", onScroll, { passive: true });
//     onScroll();
//     return () => c.removeEventListener("scroll", onScroll);
//   }, []);

//   // ---------- initial mount: scroll after images loaded ----------
//   // Wait for images in the container to load (prevents layout jump) and then scroll to bottom once.
//   useEffect(() => {
//     const c = chatContainerRef.current;
//     if (!c || hasInitialScrollRef.current) return;

//     const tryScrollAfterImages = () => {
//       const imgs = Array.from(c.querySelectorAll<HTMLImageElement>("img"));
//       const pending = imgs.filter((i) => !i.complete);
//       if (pending.length === 0) {
//         // direct scroll
//         requestAnimationFrame(() => {
//           if (firstUnread) {
//             scrollToFirstUnread();
//           } else {
//             scrollToBottom({ smooth: false });
//           }
//         });
//         hasInitialScrollRef.current = true;
//         return;
//       }

//       // attach listeners (once)
//       let remaining = pending.length;
//       const onDone = () => {
//         remaining--;
//         if (remaining <= 0) {
//           requestAnimationFrame(() => {
//             if (firstUnread) {
//               scrollToFirstUnread();
//             } else {
//               scrollToBottom({ smooth: false });
//             }
//           });
//           hasInitialScrollRef.current = true;
//         }
//       };
//       pending.forEach((img) => {
//         img.addEventListener("load", onDone, { once: true });
//         img.addEventListener("error", onDone, { once: true });
//       });

//       // fallback timeout in case loads take too long
//       setTimeout(() => {
//         if (!hasInitialScrollRef.current) {
//           requestAnimationFrame(() => {
//             if (firstUnread) {
//               scrollToFirstUnread();
//             } else {
//               scrollToBottom({ smooth: false });
//             }
//           });
//           hasInitialScrollRef.current = true;
//           setReady(true);
//         }
//       }, 1000);
//     };

//     // do on next paint
//     requestAnimationFrame(tryScrollAfterImages);
//   }, [firstUnread, scrollToFirstUnread]); // run once

//   // ---------- preserve scroll / auto-scroll on new comments ----------
//   // Only watch comments.length to avoid re-trigger on reference changes.
//   useLayoutEffect(() => {
//     const c = chatContainerRef.current;
//     if (!c || !comments) {
//       prevCountRef.current = comments?.length ?? 0;
//       return;
//     }

//     const prevCount = prevCountRef.current ?? 0;
//     const newCount = comments.length;

//     // snapshot before DOM update
//     const prevScrollTop = c.scrollTop;
//     const prevScrollHeight = c.scrollHeight;

//     // wait for DOM update (paint)
//     requestAnimationFrame(() => {
//       const newScrollHeight = c.scrollHeight;
//       const heightDiff = newScrollHeight - prevScrollHeight;

//       if (isUserNearBottomRef.current && !isDeletingRef.current) {
//         // if user was at bottom, keep it at bottom

//         if (firstUnread) {
//           scrollToFirstUnread();
//         } else {
//           scrollToBottom({ smooth: false });
//         }
//       } else if (heightDiff > 0) {
//         // user read older messages: maintain relative position
//         c.scrollTop = prevScrollTop + heightDiff;
//       }

//       // if count increased AND user is near bottom, ensure bottom (covers fast adds)
//       if (
//         newCount > prevCount &&
//         isUserNearBottomRef.current &&
//         !isDeletingRef.current
//       ) {
//         if (firstUnread) {
//           scrollToFirstUnread();
//         } else {
//           scrollToBottom({ smooth: false });
//         }
//       }

//       prevCountRef.current = newCount;
//     });
//   }, [comments, scrollToFirstUnread, firstUnread]);

//   // Cleanup
//   useEffect(() => {
//     return () => {
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//       if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
//       imagesPendingRef.current = 0;
//     };
//   }, []);
//   useEffect(() => {
//     if (selectedComments && selectedComments.length > 0) {
//       setShowDelete(true);
//     } else {
//       setShowDelete(false);
//     }
//   }, [selectedComments]);
//   const handleMarkingAllRead = () => {
//     if (unreadCount <= 0) return;
//     setComments((prev) =>
//       prev.map((p) =>
//         p.readBy.includes(currentUserId)
//           ? p
//           : { ...p, readBy: [...p.readBy, currentUserId] },
//       ),
//     );
//     setShowUnreadBar(false);
//   };

//   if (!groupedCommentsByDate) {
//     return (
//       <div className=" flex flex-col flex-1 min-h-0 items-center justify-center text-sm md:text-lg text-gray-700 dark:text-gray-300 ">
//         No Comments Yet
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col flex-1 min-h-0 border rounded-xl border-gray-300 dark:border-gray-700 ">
//       <div
//         className={`transition-all duration-300 ${
//           showDelete ? "opacity-100 max-h-13" : "opacity-0 max-h-0"
//         }`}
//       >
//         <DeleteSelected
//           selectedComments={selectedComments}
//           setSelectedComments={setSelectedComments}
//           setComments={setComments}
//           isDeletingRef={isDeletingRef}
//         />
//       </div>

//       <div
//         className={`transition-all duration-300  ${
//           showPinBar && !showDelete
//             ? "opacity-100 max-h-13 "
//             : " opacity-0 max-h-0 "
//         }`}
//       >
//         <PinBar pins={pins} handleScrollTo={handleScrollTo} />
//       </div>

//       <div className=" flex flex-col flex-1 min-h-0 relative">
//         <div
//           className={`absolute top-2 left-1/2 -translate-x-1/2  bg-gray-800  text-white text-xs px-3 py-1 rounded-full shadow transition-all duration-300 pointer-events-none ${
//             showDate ? "opacity-80 translate-y-0" : "opacity-0 -translate-y-2"
//           }`}
//           aria-hidden
//         >
//           {currentDate && CommentsDateIndicatorFormatter(new Date(currentDate))}
//         </div>

//         <div
//           ref={chatContainerRef}
//           className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden thinScrollbar"
//           onScroll={handleScroll}
//         >
//           {sortedGroupedComments.map(([date, comments]) => {
//             const readComments = comments.filter((c) =>
//               c.readBy.includes(currentUserId),
//             );

//             const unreadComments = comments.filter(
//               (c) => !c.readBy.includes(currentUserId),
//             );

//             return (
//               <div key={date}>
//                 <div id={`date-${date}`} className="flex justify-center">
//                   <div
//                     className={`bg-gray-300 dark:bg-blk7 text-gray-700 dark:text-gray-200
//                         text-xs px-3 py-1 ml-4 rounded-full shadow my-2 ${
//                           ready ? "opacity-100" : "opacity-0"
//                         }`}
//                   >
//                     {CommentsDateIndicatorFormatter(new Date(date))}
//                   </div>
//                 </div>

//                 {readComments.map((comment) => (
//                   <CommentChatBubble
//                     key={comment.id}
//                     comment={comment}
//                     handleScrollTo={handleScrollTo}
//                     highlightId={highlightId}
//                     setReply={setReply}
//                     chatContainerRef={chatContainerRef}
//                     // setSelectedComments={setSelectedComments}
//                     // selectedComments={selectedComments}
//                     setComments={setComments}
//                     isDeletingRef={isDeletingRef}
//                     setPins={setPins}
//                     pins={pins}
//                   />
//                 ))}
//                 {showUnreadBar &&
//                   unreadComments.length > 0 &&
//                   unreadComments[0].id === firstUnread && (
//                     <div
//                       className="bg-gray-100 dark:bg-blk4 shadow-md lg:text-sm text-xs
//                   text-gray-800 dark:text-gray-200 flex justify-center py-1"
//                     >
//                       {unreadCount} comments unread
//                     </div>
//                   )}

//                 {unreadComments.map((comment) => (
//                   <CommentChatBubble
//                     key={comment.id}
//                     comment={comment}
//                     handleScrollTo={handleScrollTo}
//                     highlightId={highlightId}
//                     setReply={setReply}
//                     markAsRead={markAsRead}
//                     chatContainerRef={chatContainerRef}
//                     // setSelectedComments={setSelectedComments}
//                     // selectedComments={selectedComments}
//                     setComments={setComments}
//                     isDeletingRef={isDeletingRef}
//                     setPins={setPins}
//                     pins={pins}
//                   />
//                 ))}
//               </div>
//             );
//           })}
//         </div>

//         <div className="absolute bottom-3 right-4 flex flex-col items-center gap-4">
//           {showMention && (
//             <button
//               onClick={handleScrollToLatestMention}
//               className={`relative cursor-pointer  bg-gray-200 text-gray-800 dark:text-gray-200 dark:bg-blk5 dark:hover:bg-blk7 hover:bg-gray-300 rounded-full p-2 shadow-lg transition-all duration-300 ${
//                 showMention
//                   ? "opacity-100 scale-100"
//                   : "opacity-0 scale-75 pointer-events-none"
//               }`}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//                 className="size-4 lg:size-5"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M17.834 6.166a8.25 8.25 0 1 0 0 11.668.75.75 0 0 1 1.06 1.06c-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788 3.807-3.808 9.98-3.808 13.788 0A9.722 9.722 0 0 1 21.75 12c0 .975-.296 1.887-.809 2.571-.514.685-1.28 1.179-2.191 1.179-.904 0-1.666-.487-2.18-1.164a5.25 5.25 0 1 1-.82-6.26V8.25a.75.75 0 0 1 1.5 0V12c0 .682.208 1.27.509 1.671.3.401.659.579.991.579.332 0 .69-.178.991-.579.3-.4.509-.99.509-1.671a8.222 8.222 0 0 0-2.416-5.834ZM15.75 12a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0Z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               <div className="absolute bottom-7 bg-blue-500 text-white text-xs py-1 px-2 rounded-full">
//                 <div className="transition-opacity duration-150">
//                   {remainingMentions}
//                 </div>
//               </div>
//             </button>
//           )}
//           {showScrollButton && (
//             <button
//               onClick={() => {
//                 scrollToBottom({ smooth: true });
//                 handleMarkingAllRead();
//               }}
//               className={` cursor-pointer  bg-gray-200 text-gray-800 dark:text-gray-200 dark:bg-blk5 dark:hover:bg-blk7 hover:bg-gray-300 rounded-full p-2 shadow-lg transition-all duration-300 ${
//                 showScrollButton
//                   ? "opacity-100 scale-100"
//                   : "opacity-0 scale-75 pointer-events-none"
//               }`}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//                 className="size-4 lg:size-5"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>
//       <div className="shrink-0">
//         {canComment ? (
//           <InputEditor
//             users={users ?? []}
//             reply={reply}
//             setReply={setReply}
//             handleMarkingAllRead={handleMarkingAllRead}
//             setComments={setComments}
//             scrollToBottom={scrollToBottom}
//           />
//         ) : (
//           <div
//             className={`shrink-0 h-12 flex items-center justify-center border-t border-gray-300 bg-gray-50 dark:bg-blk2
//               dark:border-gray-600 rounded-xl text-sm lg:text-base `}
//           >
//             You are not allowed to comment
//           </div>
//         )}{" "}
//       </div>
//       <OverlayWrapper active={showUserId !== null}>
//         <Xbtn
//           onClick={() => {
//             setShowUserId(null);
//           }}
//         ></Xbtn>
//       </OverlayWrapper>
//     </div>
//   );
// }
