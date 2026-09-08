import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../middlewares/audit';
import { UserRole } from '../shared';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, phone, ibCode } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ email, mật khẩu và họ tên' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
    }

    let assignedIbId: string | null = null;
    if (ibCode) {
      const ibUser = await prisma.user.findFirst({
        where: { OR: [{ id: ibCode }, { email: ibCode }], role: 'IB' }
      });
      if (ibUser) {
        assignedIbId = ibUser.id;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        phone: phone || null,
        role: 'USER',
        status: 'ACTIVE',
        ibId: assignedIbId,
      }
    });

    await logAudit(newUser.id, 'USER_REGISTER', 'User', newUser.id, { email: newUser.email }, req.ip);

    // Auto issue token
    const token = jwt.sign({ userId: newUser.id }, config.jwtSecret, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ userId: newUser.id }, config.jwtRefreshSecret, { expiresIn: '7d' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        userId: newUser.id,
        refreshToken,
        ipAddress: req.ip,
        expiresAt,
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: {
        token,
        refreshToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
          status: newUser.status,
          permissions: ['trading.view', 'courses.view', 'calendar.view', 'ai.chat', 'ai.chart_analysis'],
          activeLicenseKey: null,
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký', error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password, deviceIdentifier, deviceName, osVersion } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        licenses: {
          where: {
            status: 'ACTIVE',
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          include: { devices: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        userPermissions: {
          where: { granted: true },
          include: { permission: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ Admin.' });
    }

    // Role permissions
    const roleRecord = await prisma.role.findUnique({
      where: { name: user.role },
      include: { rolePermissions: { include: { permission: true } } }
    });

    const rolePerms = roleRecord ? roleRecord.rolePermissions.map(rp => rp.permission.code) : [];
    const directPerms = user.userPermissions.map(up => up.permission.code);
    const allPermissions = Array.from(new Set([...rolePerms, ...directPerms]));

    // Device Management & License Check
    let activeLicenseKey: string | null = null;
    let allowedServices: string[] = [];

    if (user.licenses.length > 0) {
      const activeLicense = user.licenses[0];
      activeLicenseKey = activeLicense.keyCode;
      try {
        allowedServices = JSON.parse(activeLicense.allowedServices);
      } catch {
        allowedServices = [];
      }

      // Check device limit if deviceIdentifier is provided
      if (deviceIdentifier) {
        const existingDevice = activeLicense.devices.find(d => d.deviceIdentifier === deviceIdentifier);

        if (!existingDevice) {
          if (activeLicense.devices.length >= activeLicense.maxDevices) {
            return res.status(403).json({
              success: false,
              deviceLimitReached: true,
              message: `KEY của bạn đã đạt giới hạn thiết bị tối đa (${activeLicense.maxDevices} thiết bị). Vui lòng liên hệ Admin để reset.`
            });
          }

          // Register new device
          await prisma.device.create({
            data: {
              keyId: activeLicense.id,
              userId: user.id,
              deviceIdentifier,
              deviceName: deviceName || 'Windows PC',
              osVersion: osVersion || 'Windows',
            }
          });
        } else {
          // Update device activity
          await prisma.device.update({
            where: { id: existingDevice.id },
            data: { lastActiveAt: new Date() }
          });
        }
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Create session tokens
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ userId: user.id }, config.jwtRefreshSecret, { expiresIn: '7d' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        deviceFingerprint: deviceIdentifier || null,
        ipAddress: req.ip,
        expiresAt,
      }
    });

    await logAudit(user.id, 'USER_LOGIN', 'User', user.id, { ip: req.ip, deviceName }, req.ip);

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role as UserRole,
          status: user.status,
          permissions: allPermissions,
          activeLicenseKey,
          allowedServices,
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi server khi đăng nhập', error: err.message });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        licenses: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        permissions: req.user.permissions,
        activeLicenseKey: req.user.activeLicenseKey,
        allowedServices: req.user.allowedServices,
        createdAt: user.createdAt,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin người dùng', error: err.message });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { refreshToken } });
    }
    if (req.user) {
      await logAudit(req.user.id, 'USER_LOGOUT', 'User', req.user.id, {}, req.ip);
    }
    return res.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi đăng xuất' });
  }
}
