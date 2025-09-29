import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request: any) {
  const user = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // ถ้า user เป็น customer เข้าหน้า "/"
  if (pathname === "/" && user?.role === "customer") {
    // Redirect ไปที่ "/testui"
    return NextResponse.redirect(new URL("/user", request.url));
  }

  if (pathname === "/" && !user) {
    
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (pathname === "/cashier" && user?.role === "customer") {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  if (pathname === "/cashier/reqorder" && user?.role === "customer") {
    return NextResponse.redirect(new URL("/user", request.url));
  }

    // ถ้า user เป็น customer เข้าหน้า "/"
  if (pathname === "/" && user?.role === "cashier") {
      // Redirect ไปที่ "/testui"
      return NextResponse.redirect(new URL("/cashier", request.url));
  }

  if (pathname === "/" && user?.role === "admin") {
    // Redirect ไปที่ "/testui"
    return NextResponse.redirect(new URL("/admin", request.url));
}

  // ถ้าผู้ใช้เข้าไปที่หน้า "/auth/signin" และมีการล็อกอินแล้ว
  if (pathname.startsWith("/auth/signin") && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ถ้าเป็นหน้า "/admin" และไม่มี user หรือ role ไม่ใช่ admin
  if (pathname.startsWith("/admin") && (!user || user.role !== "admin")) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (pathname.startsWith("/cashier") && (!user)) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // สำหรับหน้า "/order/"
  if (pathname.startsWith("/order/")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const orderId = pathname.split("/").pop(); // ดึง orderId จาก URL

    const orderRes = await fetch(`${process.env.NEXTAUTH_URL}/api/order/${orderId}`, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    });

    if (!orderRes.ok) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    const order = await orderRes.json();

    if (String(order.customerId) !== String(user.id)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}
