import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';
import { config } from '../config';

export async function getAdminOverview(req: AuthenticatedRequest, res: Response) {
  try {
    const [
      totalUsers,
      totalIBs,
      activeUsers,
      bannedUsers,
      activeKeys,
      expiredKeys,
      totalAIAnalyses,
      latestVersion
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'IB' } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: { in: ['BANNED', 'SUSPENDED'] } } }),
      prisma.licenseKey.count({ where: { status: 'ACTIVE' } }),
      prisma.licenseKey.count({ where: { status: 'EXPIRED' } }),
      prisma.aIMessage.count({ where: { role: 'ASSISTANT' } }),
      prisma.appVersion.findFirst({ where: { isPublished: true }, orderBy: { createdAt: 'desc' } })
    ]);

    // Calculate user growth for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true }
    });

    const growthMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      growthMap[key] = 0;
    }

    recentUsers.forEach(u => {
      const d = new Date(u.createdAt);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (growthMap[key] !== undefined) {
        growthMap[key]++;
      }
    });

    const userGrowth = Object.entries(growthMap).map(([name, users]) => ({ name, users }));

    return res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalIBs,
          activeUsers,
          bannedUsers,
          activeKeys,
          expiredKeys,
          totalAIAnalyses,
          currentAppVersion: latestVersion?.version || '1.0.0',
        },
        systemStatus: {
          database: 'ONLINE (PostgreSQL)',
          geminiApi: config.geminiApiKey ? 'CONFIGURED' : 'UNCONFIGURED (Using Smart Fallback)',
          mt5Bridge: 'ACTIVE',
          uptime: process.uptime(),
        },
        userGrowth
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy dữ liệu tổng quan Admin' });
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        include: {
          user: { select: { email: true, fullName: true, role: true } }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return res.json({
      success: true,
      data: logs.map(l => ({
        id: l.id,
        userEmail: l.user?.email || 'Hệ thống / Ẩn danh',
        userRole: l.user?.role || 'SYSTEM',
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        metadata: l.metadataJson ? JSON.parse(l.metadataJson) : null,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải Audit Logs' });
  }
}
