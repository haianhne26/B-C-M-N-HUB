import { Request, Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../middlewares/audit';
import { sendNewLeadNotification, sendDiscordLeadNotification } from '../services/email.service';

// -------------------------------------------------------------
// 1. IB Landing Page Builder
// -------------------------------------------------------------
export async function listIBLandingPages(req: AuthenticatedRequest, res: Response) {
  try {
    const ibId = req.user?.id;
    const pages = await prisma.iBLandingPage.findMany({
      where: req.user?.role === 'OWNER' ? {} : { ibId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { leads: true } }
      }
    });

    return res.json({ success: true, data: pages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách Landing Page' });
  }
}

export async function createIBLandingPage(req: AuthenticatedRequest, res: Response) {
  try {
    const ibId = req.user?.id;
    if (!ibId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const { title, slug, seoDescription, themeConfig, sections } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền Tiêu đề và Slug đường dẫn' });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const existing = await prisma.iBLandingPage.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug đường dẫn này đã được sử dụng' });
    }

    const defaultSections = sections || [
      { id: 'hero', type: 'Hero', title: 'Đầu Tư Thông Minh Cùng Bạc Môn', subtitle: 'Hệ thống hỗ trợ giao dịch chuẩn xác' },
      { id: 'countdown', type: 'Countdown' },
      { id: 'topics', type: 'Topics' },
      { id: 'mentor', type: 'MentorProfile' },
      { id: 'benefits', type: 'Benefits', title: 'Tại Sao Chọn Chúng Tôi', items: ['Tín hiệu phân tích chuẩn', 'Hỗ trợ 1-1'] },
      { id: 'lead-form', type: 'LeadForm', title: 'Đăng Ký Nhận Tư Vấn Miễn Phí' }
    ];

    const page = await prisma.iBLandingPage.create({
      data: {
        ibId,
        title,
        slug: cleanSlug,
        seoDescription: seoDescription || null,
        themeConfig: themeConfig ? JSON.stringify(themeConfig) : null,
        sectionsJson: JSON.stringify(defaultSections),
        isPublished: true,
      }
    });

    await logAudit(ibId, 'LANDING_CREATED', 'IBLandingPage', page.id, { slug: cleanSlug });

    return res.status(201).json({ success: true, message: 'Tạo Landing Page thành công', data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo Landing Page', error: err.message });
  }
}

export async function updateIBLandingPage(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const ibId = req.user?.id;
    const { title, seoDescription, themeConfig, sections, isPublished } = req.body;

    const page = await prisma.iBLandingPage.findUnique({ where: { id } });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy trang' });
    }

    // Bảo mật: Chỉ chính IB sở hữu hoặc OWNER mới được sửa
    if (req.user?.role !== 'OWNER' && page.ibId !== ibId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa trang này' });
    }

    const updated = await prisma.iBLandingPage.update({
      where: { id },
      data: {
        title: title !== undefined ? title : page.title,
        seoDescription: seoDescription !== undefined ? seoDescription : page.seoDescription,
        themeConfig: themeConfig ? JSON.stringify(themeConfig) : page.themeConfig,
        sectionsJson: sections ? JSON.stringify(sections) : page.sectionsJson,
        isPublished: isPublished !== undefined ? isPublished : page.isPublished,
      }
    });

    return res.json({ success: true, message: 'Cập nhật trang thành công', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trang' });
  }
}

export async function deleteIBLandingPage(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const ibId = req.user?.id;

    const page = await prisma.iBLandingPage.findUnique({ where: { id } });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy trang' });
    }

    // Bảo mật: Chỉ chính IB sở hữu hoặc OWNER mới được xóa
    if (req.user?.role !== 'OWNER' && page.ibId !== ibId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa trang này' });
    }

    // Xóa tất cả leads liên quan (cần cascade, nhưng prisma có thể chặn nếu chưa bật cascade. Ta xóa leads trước)
    await prisma.lead.deleteMany({ where: { landingPageId: id } });

    await prisma.iBLandingPage.delete({ where: { id } });

    return res.json({ success: true, message: 'Đã xóa trang đích thành công' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa trang' });
  }
}

// Public API: Lấy nội dung Landing Page cho khách xem (/p/:slug)
export async function getPublicLandingPage(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const page = await prisma.iBLandingPage.findUnique({
      where: { slug },
      include: {
        ib: { select: { id: true, fullName: true, email: true, phone: true } }
      }
    });

    if (!page || !page.isPublished) {
      return res.status(404).json({ success: false, message: 'Trang không tồn tại hoặc đã bị ẩn' });
    }

    return res.json({
      success: true,
      data: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        seoDescription: page.seoDescription,
        themeConfig: page.themeConfig ? JSON.parse(page.themeConfig) : null,
        sections: JSON.parse(page.sectionsJson),
        ib: page.ib,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải trang' });
  }
}

// -------------------------------------------------------------
// 2. Lead Form Public Submission
// -------------------------------------------------------------
export async function submitLeadForm(req: Request, res: Response) {
  try {
    const { pageSlug, fullName, phone, email, notes } = req.body;

    if (!pageSlug || !fullName || !phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Họ tên và Số điện thoại' });
    }

    const page = await prisma.iBLandingPage.findUnique({ where: { slug: pageSlug } });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Landing page không tồn tại' });
    }

    const lead = await prisma.lead.create({
      data: {
        ibId: page.ibId,
        landingPageId: page.id,
        fullName,
        phone,
        email: email || null,
        notes: notes || `Đăng ký từ Landing Page: ${page.title}`,
        status: 'NEW',
      }
    });

    await logAudit(null, 'LEAD_SUBMITTED', 'Lead', lead.id, { ibId: page.ibId, phone });

    // Gửi thông báo cho IB (bất đồng bộ - không chặn response)
    prisma.user.findUnique({ where: { id: page.ibId }, select: { email: true, fullName: true } })
      .then(ib => {
        if (!ib) return;
        // Gửi Gmail
        if (ib.email) {
          sendNewLeadNotification({
            toEmail: ib.email,
            ibName: ib.fullName || 'IB',
            leadName: fullName,
            leadPhone: phone,
            leadEmail: email || null,
            landingPageTitle: page.title,
            notes: notes || null,
          });
        }
        // Gửi Discord
        sendDiscordLeadNotification({
          ibName: ib.fullName || 'IB',
          leadName: fullName,
          leadPhone: phone,
          landingPageTitle: page.title,
        });
      })
      .catch(err => console.error('[Notify] Lỗi truy vấn IB:', err));

    return res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã để lại thông tin! Chuyên viên hỗ trợ sẽ liên hệ với bạn sớm nhất.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi gửi thông tin', error: err.message });
  }
}

// -------------------------------------------------------------
// 3. IB CRM Kanban Leads Management
// -------------------------------------------------------------
export async function listIBLeads(req: AuthenticatedRequest, res: Response) {
  try {
    const ibId = req.user?.id;
    if (!ibId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    // STRICT ISOLATION: IB chỉ xem được Leads của chính mình
    const where: any = req.user.role === 'OWNER' ? {} : { ibId };

    const leads = await prisma.lead.findMany({
      where,
      include: {
        landingPage: { select: { title: true, slug: true } },
        leadTags: { include: { tag: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Grouping by status for Kanban Board
    const kanban = {
      NEW: leads.filter(l => l.status === 'NEW'),
      CONTACTED: leads.filter(l => l.status === 'CONTACTED'),
      CONSULTING: leads.filter(l => l.status === 'CONSULTING'),
      CONVERTED: leads.filter(l => l.status === 'CONVERTED'),
      REJECTED: leads.filter(l => l.status === 'REJECTED'),
    };

    return res.json({
      success: true,
      total: leads.length,
      kanban,
      leads: leads.map(l => ({
        id: l.id,
        fullName: l.fullName,
        phone: l.phone,
        email: l.email,
        status: l.status,
        notes: l.notes,
        landingPageTitle: l.landingPage?.title || 'Trực tiếp',
        tags: l.leadTags.map(lt => ({ id: lt.tag.id, name: lt.tag.name, color: lt.tag.color })),
        createdAt: l.createdAt,
        lastContactAt: l.lastContactAt,
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách CRM Leads' });
  }
}

export async function updateLeadStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const ibId = req.user?.id;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Lead' });
    }

    // STRICT ISOLATION CHECK
    if (req.user?.role !== 'OWNER' && lead.ibId !== ibId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền quản lý Lead này' });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: status || lead.status,
        notes: notes !== undefined ? notes : lead.notes,
        lastContactAt: new Date(),
      }
    });

    return res.json({ success: true, message: 'Cập nhật Lead thành công', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật Lead' });
  }
}

export async function updateLeadTags(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { tags } = req.body; // array of { name: string, color: string }
    const ibId = req.user?.id;

    if (!ibId) return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Lead' });
    }

    if (req.user?.role !== 'OWNER' && lead.ibId !== ibId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền quản lý Lead này' });
    }

    const tagIds = [];
    if (Array.isArray(tags)) {
      for (const t of tags) {
        let tagRecord = await prisma.tag.findUnique({
          where: { ibId_name: { ibId: lead.ibId, name: t.name } }
        });
        if (!tagRecord) {
          tagRecord = await prisma.tag.create({
            data: { ibId: lead.ibId, name: t.name, color: t.color || '#7C3AED' }
          });
        }
        tagIds.push(tagRecord.id);
      }
    }

    // Xoá tag cũ của lead
    await prisma.leadTag.deleteMany({ where: { leadId: id } });

    // Gán tag mới
    const uniqueTagIds = Array.from(new Set(tagIds));
    if (uniqueTagIds.length > 0) {
      await prisma.leadTag.createMany({
        data: uniqueTagIds.map(tagId => ({ leadId: id, tagId })),
        skipDuplicates: true,
      });
    }

    const updatedLeadTags = await prisma.leadTag.findMany({
      where: { leadId: id },
      include: { tag: true }
    });

    const mappedTags = updatedLeadTags.map(lt => ({ id: lt.tag.id, name: lt.tag.name, color: lt.tag.color }));

    return res.json({ success: true, message: 'Cập nhật thẻ thành công', data: mappedTags });
  } catch (err: any) {
    console.error('Update Tags Error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật thẻ' });
  }
}

// -------------------------------------------------------------
// Public Stats: Tổng số Lead toàn hệ thống
// -------------------------------------------------------------
export async function getTotalLeadCount(req: Request, res: Response) {
  try {
    const totalLeads = await prisma.lead.count();
    return res.json({ success: true, data: { total: totalLeads } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê' });
  }
}

