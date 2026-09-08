import { Request, Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../middlewares/audit';

// Desktop App gọi kiểm tra cập nhật khi khởi động
export async function getLatestVersion(req: Request, res: Response) {
  try {
    const currentAppVersion = (req.query.currentVersion as string || '1.0.0').trim();

    const latest = await prisma.appVersion.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!latest) {
      return res.json({
        success: true,
        updateAvailable: false,
        message: 'Bạn đang sử dụng phiên bản mới nhất',
      });
    }

    const hasUpdate = latest.version !== currentAppVersion;

    return res.json({
      success: true,
      updateAvailable: hasUpdate,
      data: {
        version: latest.version,
        downloadUrl: latest.downloadUrl,
        releaseNotes: latest.releaseNotes,
        releaseDate: latest.releaseDate,
        isMandatory: latest.isMandatory,
        minSupportedVersion: latest.minSupportedVersion,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi kiểm tra phiên bản mới' });
  }
}

// OWNER phát hành phiên bản cập nhật mới
export async function publishNewVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { version, downloadUrl, releaseNotes, isMandatory, minSupportedVersion } = req.body;

    if (!version || !downloadUrl) {
      return res.status(400).json({ success: false, message: 'Thiếu version hoặc downloadUrl' });
    }

    const newRelease = await prisma.appVersion.create({
      data: {
        version,
        downloadUrl,
        releaseNotes: releaseNotes || 'Bản cập nhật tối ưu hiệu năng và sửa lỗi.',
        isMandatory: !!isMandatory,
        minSupportedVersion: minSupportedVersion || null,
        isPublished: true,
      }
    });

    // Tạo thông báo broadcast hệ thống
    await prisma.notification.create({
      data: {
        title: `Phát hành Bạc Môn HUB v${version}`,
        content: `Phiên bản mới v${version} đã sẵn sàng tải xuống.`,
        type: 'UPDATE',
      }
    });

    await logAudit(req.user?.id || null, 'APP_VERSION_PUBLISHED', 'AppVersion', newRelease.id, { version });

    return res.status(201).json({ success: true, message: 'Phát hành bản cập nhật thành công', data: newRelease });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi phát hành bản cập nhật' });
  }
}
