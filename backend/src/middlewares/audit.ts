import { prisma } from '../db';

export async function logAudit(
  userId: string | null,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, any>,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        targetType,
        targetId,
        metadataJson: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error('Lỗi khi ghi Audit Log:', err);
  }
}
