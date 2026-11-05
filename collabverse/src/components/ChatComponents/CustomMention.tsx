// export const CustomMention = Mention.extend({
//   addAttributes() {
//     return {
//       id: { default: null },
//       name: { default: null },
//       avatar: { default: null },
//       userName: { default: null },
//     };
//   },

//   renderHTML({ node }) {
//     return [
//       "span",
//       {
//         class: "text-blue-500 font-medium cursor-pointer",
//         onclick: () => {},
//         "data-id": node.attrs.id,
//       },
//       `${node.attrs.userName}`,
//     ];
//   },

//   renderText({ node }) {
//     return `@${node.attrs.userName}`;
//   },
// });
