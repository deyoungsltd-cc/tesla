import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers'
import { verifyPassword, hashPassword, generateToken } from '@/lib/auth'

async function getHandler(_request: NextRequest, _context: any, user: any) {
  return apiResponse({
    id: user.id,
    email: user.email,
    role: user.adminRecord?.role ?? null,
    referralCode: user.referralCode,
    isDemo: user.activeMode === 'demo',
    isActive: user.status === 'active',
    createdAt: user.createdAt,
    profile: user.profile,
  })
}

async function putHandler(request: NextRequest, _context: any, user: any) {
  const body = await request.json()
  const { firstName, lastName, phone, country, address, city, state, zipCode } = body

  if (!user.profile) {
    return apiError('Profile not found', 'NOT_FOUND', 404)
  }

  const updateData: Record<string, unknown> = {}
  if (firstName !== undefined) updateData.firstName = firstName
  if (lastName !== undefined) updateData.lastName = lastName
  if (phone !== undefined) updateData.phone = phone
  if (country !== undefined) updateData.country = country
  if (address !== undefined) updateData.streetAddress = address
  if (city !== undefined) updateData.city = city
  if (state !== undefined) updateData.state = state
  if (zipCode !== undefined) updateData.postalCode = zipCode

  const updatedProfile = await db.profile.update({
    where: { userId: user.id },
    data: updateData,
  })

  return apiResponse(updatedProfile)
}

async function patchHandler(request: NextRequest, _context: any, user: any) {
  const body = await request.json()
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return apiError('Current password and new password are required', 'MISSING_FIELDS', 400)
  }

  if (newPassword.length < 8) {
    return apiError('New password must be at least 8 characters long', 'WEAK_PASSWORD', 400)
  }

  // Fetch fresh user with passwordHash
  const freshUser = await db.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  })

  if (!freshUser?.passwordHash) {
    return apiError('Account has no password set', 'NO_PASSWORD', 400)
  }

  const isCurrentValid = await verifyPassword(currentPassword, freshUser.passwordHash)
  if (!isCurrentValid) {
    return apiError('Current password is incorrect', 'WRONG_PASSWORD', 401)
  }

  const hashedNewPassword = await hashPassword(newPassword)

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedNewPassword },
  })

  const token = generateToken({ userId: user.id, email: user.email })

  const response = NextResponse.json({ success: true, data: { message: 'Password changed successfully' } })

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}

export const GET = requireAuth(getHandler)
export const PUT = requireAuth(putHandler)
export const PATCH = requireAuth(patchHandler)
