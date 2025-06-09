import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json()

    const hashedPassword = bcrypt.hashSync(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: name, // ตรงนี้ใช้ name เป็น username ได้เลย
        role: role || 'user', 
      },
    })

    return new Response(JSON.stringify({ message: 'User created', user }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error creating user:", error)
    return new Response(
      JSON.stringify({ error: error.message ?? 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
