import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';

// Lấy danh sách khóa học
export async function listCourses(req: AuthenticatedRequest, res: Response) {
  try {
    const isOwnerOrIb = req.user?.role === 'OWNER' || req.user?.role === 'IB';
    const hasPremiumKey = req.user?.allowedServices?.includes('courses') || false;
    const canAccessPremium = isOwnerOrIb || hasPremiumKey;

    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        chapters: {
          include: { lessons: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      canAccessPremium,
      data: courses.map(c => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        category: c.category,
        isPremium: c.isPremium,
        isLocked: c.isPremium && !canAccessPremium,
        chaptersCount: c.chapters.length,
        lessonsCount: c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
        createdAt: c.createdAt,
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách khóa học' });
  }
}

// Lấy chi tiết khóa học và bài học
export async function getCourseDetail(req: AuthenticatedRequest, res: Response) {
  try {
    const { slug } = req.params;
    const isOwnerOrIb = req.user?.role === 'OWNER' || req.user?.role === 'IB';
    const hasPremiumKey = req.user?.allowedServices?.includes('courses') || false;
    const canAccessPremium = isOwnerOrIb || hasPremiumKey;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        chapters: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { orderBy: { sortOrder: 'asc' } }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    const isLocked = course.isPremium && !canAccessPremium;

    return res.json({
      success: true,
      data: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        category: course.category,
        isPremium: course.isPremium,
        isLocked,
        chapters: course.chapters.map(ch => ({
          id: ch.id,
          title: ch.title,
          lessons: ch.lessons.map(l => ({
            id: l.id,
            title: l.title,
            contentType: l.contentType,
            duration: l.duration,
            isFreePreview: l.isFreePreview,
            // Ẩn video URL nếu nội dung bị khóa và bài học không phải là free preview
            videoUrl: (!isLocked || l.isFreePreview) ? l.videoUrl : null,
          }))
        }))
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải chi tiết khóa học' });
  }
}
