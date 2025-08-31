// import { prisma } from "@/lib/prisma";
// import { extractIdFromSlug } from "@/lib/slug";
// import { auth } from "@/auth"; // นำเข้า auth จาก next-auth

// interface ProfilePageProps {
//   params: { slug: string };
// }

// export default async function ProfilePage(props: ProfilePageProps) {
//   const session = await auth(); // ดึงข้อมูล session สำหรับ Server Component
//   const { slug } = props.params;

//   // ตรวจสอบว่า session มี userId ตรงกับ slug ที่เข้ามาหรือไม่
//   if (session?.user?.id && slug.endsWith(session.user.id)) {
//     // ถ้าตรงกัน ให้ใช้ userId จาก session
//     const userId = session.user.id;

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       return <div>ไม่พบผู้ใช้ในระบบ</div>;
//     }

//     return (
//       <div className="p-6 text-white">
//         <h1 className="text-3xl font-bold">{user.name}'s Profile</h1>
//         <p>Email: {user.email}</p>
//         <img
//           src={user.image || "/2.jpg"}
//           alt="avatar"
//           className="w-24 h-24 rounded-full mt-4"
//         />
//       </div>
//     );
//   } else {
//     // ถ้าไม่ตรงกัน ให้ใช้ slug เพื่อดึงข้อมูลจาก database
//     const userId = await extractIdFromSlug(slug);

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       return <div>ไม่พบผู้ใช้ในระบบ</div>;
//     }

//     return (
//       <div className="p-6 text-white">
//         <h1 className="text-3xl font-bold">{user.name}'s Profile</h1>
//         <p>Email: {user.email}</p>
//         <img
//           src={user.image || "/2.jpg"}
//           alt="avatar"
//           className="w-24 h-24 rounded-full mt-4"
//         />
//       </div>
//     );
//   }
// }
