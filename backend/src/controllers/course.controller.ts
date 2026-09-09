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

// Tạo khóa học mới (Dành cho Admin/Owner)
export async function createCourse(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, slug, description, thumbnailUrl, category, isPremium } = req.body;

    if (!title || !slug || !description) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Tiêu đề, Slug và Mô tả' });
    }

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ success: false, message: 'Slug không hợp lệ (chỉ chấp nhận chữ thường, số và dấu gạch ngang)' });
    }

    const existingCourse = await prisma.course.findUnique({ where: { slug } });
    if (existingCourse) {
      return res.status(400).json({ success: false, message: 'Slug khóa học đã tồn tại' });
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        thumbnailUrl: thumbnailUrl || null,
        category: category || 'General',
        isPremium: isPremium || false,
        isPublished: true,
      }
    });

    return res.json({
      success: true,
      message: 'Tạo khóa học thành công',
      data: newCourse
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo khóa học' });
  }
}

// Thêm bài học (chứa link YouTube) vào khóa học
export async function addLesson(req: AuthenticatedRequest, res: Response) {
  try {
    const { courseId } = req.params;
    const { title, videoUrl, isFreePreview } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập Tiêu đề bài học và Link Video' });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { chapters: true }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    // Tự động tạo một chương mặc định nếu khóa học chưa có chương nào
    let chapterId = '';
    if (course.chapters.length === 0) {
      const newChapter = await prisma.courseChapter.create({
        data: {
          courseId,
          title: 'Nội dung khóa học',
          sortOrder: 1
        }
      });
      chapterId = newChapter.id;
    } else {
      chapterId = course.chapters[0].id;
    }

    // Thêm bài học
    const newLesson = await prisma.lesson.create({
      data: {
        chapterId,
        title,
        contentType: 'VIDEO',
        videoUrl,
        isFreePreview: isFreePreview || false,
        sortOrder: 999
      }
    });

    return res.json({
      success: true,
      message: 'Đã thêm bài học thành công',
      data: newLesson
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi thêm bài học' });
  }
}
