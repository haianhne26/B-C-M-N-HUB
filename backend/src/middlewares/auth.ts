import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';
import { UserRole, LicenseServiceType } from '../shared';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  permissions: string[];
  activeLicenseKey?: string | null;
  allowedServices?: LicenseServiceType[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập để truy cập' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        licenses: {
          where: {
            status: 'ACTIVE',
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        userPermissions: {
          where: { granted: true },
          include: { permission: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị tạm khóa' });
    }

    // Get Role Permissions
    const roleRecord = await prisma.role.findUnique({
      where: { name: user.role },
      include: {
        rolePermissions: {
          include: { permission: true }
        }
      }
    });

    const rolePerms = roleRecord ? roleRecord.rolePermissions.map(rp => rp.permission.code) : [];
    const directPerms = user.userPermissions.map(up => up.permission.code);
    const allPermissions = Array.from(new Set([...rolePerms, ...directPerms]));

    // Parse active license services if any
    let activeLicenseKey: string | null = null;
    let allowedServices: LicenseServiceType[] = [];

    if (user.licenses.length > 0) {
      const lic = user.licenses[0];
      activeLicenseKey = lic.keyCode;
      try {
        allowedServices = JSON.parse(lic.allowedServices);
      } catch {
        allowedServices = [];
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.fullName,
      permissions: allPermissions,
      activeLicenseKey,
      allowedServices,
    };

    next();
  } catch (err: any) {
    console.error('Auth verify error:', err.message);
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ', error: err.message });
  }
}

// RBAC: Kiểm tra theo Permission code linh hoạt (không hard-code role)
export function requirePermission(permissionCode: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu cầu xác thực tài khoản' });
    }

    // OWNER luôn có toàn quyền
    if (req.user.role === 'OWNER') {
      return next();
    }

    if (!req.user.permissions.includes(permissionCode)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện thao tác này (${permissionCode})`
      });
    }

    next();
  };
}

// Service-Level Permission: Kiểm tra quyền truy cập theo từng module dịch vụ
export function requireServiceLicense(service: LicenseServiceType) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu cầu xác thực tài khoản' });
    }

    // OWNER & IB được miễn phí truy cập tất cả dịch vụ
    if (req.user.role === 'OWNER' || req.user.role === 'IB') {
      return next();
    }

    // Đối với USER: Bắt buộc phải có KEY active và KEY đó phải cấp phép cho service này
    if (!req.user.activeLicenseKey || !req.user.allowedServices?.includes(service)) {
      return res.status(403).json({
        success: false,
        requiresLicense: true,
        service,
        message: `Dịch vụ '${service}' yêu cầu kích hoạt License KEY hợp lệ.`
      });
    }

    next();
  };
}
