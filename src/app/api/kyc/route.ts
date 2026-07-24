import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers'

async function getHandler(_request: NextRequest, _context: any, user: any) {
  const documents = await db.kYCDocument.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const kycLevel = user.kycLevel || 'LEVEL_0'

  return apiResponse({
    kycLevel,
    documents,
  })
}

async function postHandler(request: NextRequest, _context: any, user: any) {
  const body = await request.json()
  const { type, fileUrl } = body

  if (!type || !fileUrl) {
    return apiError('Document type and image are required', 'MISSING_FIELDS', 400)
  }

  const validDocTypes = ['id_front', 'id_back', 'selfie', 'proof_of_address']
  if (!validDocTypes.includes(type)) {
    return apiError('Invalid document type', 'INVALID_TYPE', 400)
  }

  const pendingDocs = await db.kYCDocument.count({
    where: { userId: user.id, status: 'pending' },
  })

  if (pendingDocs > 0) {
    return apiError('You already have a pending KYC document under review', 'PENDING_EXISTS', 400)
  }

  const document = await db.kYCDocument.create({
    data: {
      userId: user.id,
      type,
      fileUrl,
      status: 'pending',
    },
  })

  await db.notification.create({
    data: {
      userId: user.id,
      type: 'kyc_submitted',
      title: 'KYC Document Submitted',
      message: `Your ${type.replace('_', ' ')} document has been submitted for verification. You will be notified once it is reviewed.`,
    },
  })

  return apiResponse(document, 201)
}

export const GET = requireAuth(getHandler)
export const POST = requireAuth(postHandler)
