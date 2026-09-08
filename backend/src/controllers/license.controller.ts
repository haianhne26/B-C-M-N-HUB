import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../middlewares/audit';

function generateRandomSegment(length: number = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateBMHKey(): string {
  return `BMH-${generateRandomSegment(4)}-${generateRandomSegment(4)}-${generateRandomSegment(4)}`;
}

// USER kích hoạt License KEY
export async function activateKey(req: AuthenticatedRequest, res: Response) {
  try {
    const { keyCode } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    if (!keyCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập License KEY' });
    }

    const cleanCode = keyCode.trim().toUpperCase();

    const license = await prisma.licenseKey.findUnique({
      where: { keyCode: cleanCode },
    });

    if (!license) {
      return res.status(404).json({ success: false, message: 'License KEY không tồn tại trên hệ thống' });
    }

    if (license.status === 'REVOKED' || license.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'License KEY này đã bị thu hồi hoặc tạm khóa' });
    }

    if (license.status === 'ACTIVE' && license.userId && license.userId !== userId) {
      return res.status(400).json({ success: false, message: 'License KEY này đã được kích hoạt bởi tài khoản khác' });
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      await prisma.licenseKey.update({
        where: { id: license.id },
        data: { status: 'EXPIRED' }
      });
      return res.status(400).json({ success: false, message: 'License KEY này đã hết hạn sử dụng' });
    }

    // Default duration: 1 year from activation if not already set
    let expiresAt = license.expiresAt;
    if (!expiresAt) {
      const oneYear = new Date();
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      expiresAt = oneYear;
    }

    const updatedLicense = await prisma.licenseKey.update({
      where: { id: license.id },
      data: {
        userId,
        status: 'ACTIVE',
        activatedAt: license.activatedAt || new Date(),
        expiresAt,
      }
    });

    await logAudit(userId, 'KEY_ACTIVATED', 'LicenseKey', updatedLicense.id, { keyCode: cleanCode });

    return res.json({
      success: true,
      message: 'Kích hoạt License KEY thành công!',
      data: {
        keyCode: updatedLicense.keyCode,
        status: updatedLicense.status,
        expiresAt: updatedLicense.expiresAt,
        allowedServices: JSON.parse(updatedLicense.allowedServices),
        maxDevices: updatedLicense.maxDevices,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi kích hoạt License KEY', error: err.message });
  }
}

// OWNER / IB tạo License KEY
export async function createKey(req: AuthenticatedRequest, res: Response) {
  try {
    const { count = 1, maxDevices = 1, allowedServices, durationDays = 365, notes, targetUserId } = req.body;
    const creatorId = req.user?.id;

    if (!creatorId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const servicesJson = JSON.stringify(
      Array.isArray(allowedServices) && allowedServices.length > 0
        ? allowedServices
        : ['trading', 'ai', 'courses', 'calendar']
    );

    const createdKeys = [];

    for (let i = 0; i < Math.min(count, 50); i++) {
      let keyCode = generateBMHKey();

      let expiresAt: Date | null = null;
      if (durationDays > 0) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);
      }

      const newKey = await prisma.licenseKey.create({
        data: {
          keyCode,
          status: targetUserId ? 'ACTIVE' : 'UNUSED',
          userId: targetUserId || null,
          createdById: creatorId,
          maxDevices: Math.max(1, maxDevices),
          allowedServices: servicesJson,
          expiresAt,
          notes: notes || null,
        }
      });

      createdKeys.push(newKey);
    }

    await logAudit(creatorId, 'KEYS_CREATED', 'LicenseKey', undefined, { count: createdKeys.length });

    return res.status(201).json({
      success: true,
      message: `Đã tạo thành công ${createdKeys.length} License KEY`,
      data: createdKeys,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo License KEY', error: err.message });
  }
}

// Lấy danh sách License Keys (hỗ trợ tìm kiếm, phân trang)
export async function listKeys(req: AuthenticatedRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const search = (req.query.search as string || '').trim();
    const status = req.query.status as string || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { keyCode: { contains: search } },
        { notes: { contains: search } },
        { user: { email: { contains: search } } }
      ];
    }
    if (status) {
      where.status = status;
    }

    // IB only sees keys they created or assigned
    if (req.user?.role === 'IB') {
      where.createdById = req.user.id;
    }

    const [total, keys] = await Promise.all([
      prisma.licenseKey.count({ where }),
      prisma.licenseKey.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          devices: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    ]);

    return res.json({
      success: true,
      data: keys.map(k => ({
        id: k.id,
        keyCode: k.keyCode,
        status: k.status,
        userId: k.userId,
        userEmail: k.user?.email || null,
        userName: k.user?.fullName || null,
        activatedAt: k.activatedAt,
        expiresAt: k.expiresAt,
        maxDevices: k.maxDevices,
        currentDevicesCount: k.devices.length,
        allowedServices: JSON.parse(k.allowedServices),
        notes: k.notes,
        createdAt: k.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách License KEY' });
  }
}

// Thu hồi License Key
export async function revokeKey(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const updated = await prisma.licenseKey.update({
      where: { id },
      data: { status: 'REVOKED' }
    });

    await logAudit(req.user?.id || null, 'KEY_REVOKED', 'LicenseKey', id);

    return res.json({ success: true, message: 'Đã thu hồi License KEY thành công', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi thu hồi License KEY' });
  }
}

// Reset Thiết bị đăng ký của KEY (cho phép user đăng nhập máy mới)
export async function resetKeyDevices(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.device.deleteMany({ where: { keyId: id } });

    await logAudit(req.user?.id || null, 'KEY_DEVICES_RESET', 'LicenseKey', id);

    return res.json({ success: true, message: 'Đã reset danh sách thiết bị cho License KEY' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi reset thiết bị' });
  }
}
