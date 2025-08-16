export function generateUserSlug(user: { id: string; username: string }) {
  const safeUsername = user.username
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // แทนที่ space/ตัวอักษรพิเศษด้วย "-"
    .replace(/(^-|-$)+/g, "");   // ตัด "-" หน้า/ท้าย

  return `${safeUsername}-${user.id}`;
}

export function extractIdFromSlug(slug: string) {
  const parts = slug.split("-");
  return parts[parts.length - 1]; // ดึง id จากท้ายสุด
}
