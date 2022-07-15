// async function main() {
//   try {
//     const dbEvent = {
//       Records: [
//         {
//           eventName: event.modify,
//           dynamodb: {
//             OldImage: { status: { S: 'inactive' } },
//             NewImage: {
//               status: { S: 'active' },
//               firstName: { S: 'test' },
//               lastName: { S: 'tester' },
//               updatedAt: { S: '2022-07-15T14:02:58.470Z' },
//               email: { S: 'test@testing' }
//             }
//           }
//         }
//       ]
//     };
//     const res = await activation(dbEvent);
//     console.log(res);
//     // console.log(get(dbEvent.Records[0], 'dynamodb.NewImage.firstName.S', 'ERROR'));
//     // console.log(dbEvent.Records.map(mapRecords(paths)));
//   } catch (e){
//     console.error(e);
//   }
// }
// main();