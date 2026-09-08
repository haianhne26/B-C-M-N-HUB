import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../middlewares/audit';

export async function listUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '15', 10);
    const search = (req.query.search as string || '').trim();
    const role = req.query.role as string || '';
    const status = req.query.status as string || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { fullName: { contains: search } },
        { phone: { contains: search } }
      ];
    }
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          status: true,
          ibId: true,
          createdAt: true,
          lastLoginAt: true,
          licenses: {
            where: { status: 'ACTIVE' },
            select: { keyCode: true, expiresAt: true, status: true },
            take: 1,
          },
          devices: {
            select: { deviceName: true, osVersion: true, lastActiveAt: true },
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    ]);

    return res.json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        phone: u.phone,
        role: u.role,
        status: u.status,
        ibId: u.ibId,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        activeLicenseKey: u.licenses[0]?.keyCode || null,
        licenseExpiresAt: u.licenses[0]?.expiresAt || null,
        devices: u.devices,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách người dùng' });
  }
}

export async function toggleUserStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE', 'SUSPENDED', 'BANNED'

    if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (target.role === 'OWNER') {
      return res.status(403).json({ success: false, message: 'Không thể khóa tài khoản OWNER' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status }
    });

    // If banned/suspended, invalidate all active sessions
    if (status !== 'ACTIVE') {
      await prisma.session.deleteMany({ where: { userId: id } });
    }

    await logAudit(req.user?.id || null, 'USER_STATUS_CHANGED', 'User', id, { status });

    return res.json({
      success: true,
      message: `Đã cập nhật trạng thái người dùng thành: ${status}`,
      data: updated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái người dùng' });
  }
}

export async function resetUserPassword(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });

    // Reset sessions
    await prisma.session.deleteMany({ where: { userId: id } });

    await logAudit(req.user?.id || null, 'USER_PASSWORD_RESET', 'User', id);

    return res.json({ success: true, message: 'Đã đặt lại mật khẩu cho người dùng thành công' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi đặt lại mật khẩu' });
  }
}
