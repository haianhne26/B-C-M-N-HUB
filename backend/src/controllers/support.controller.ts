import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';

// ---------------------------------------------------------
// ZOOM BOOKING
// ---------------------------------------------------------

export async function createZoomBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { topic, bookingDate, notes } = req.body;

    if (!topic || !bookingDate) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập chủ đề và thời gian booking.' });
    }

    const booking = await prisma.zoomBooking.create({
      data: {
        userId,
        topic,
        bookingDate: new Date(bookingDate),
        notes,
        status: 'PENDING'
      }
    });

    return res.json({ success: true, data: booking, message: 'Đặt lịch thành công. Vui lòng chờ admin xác nhận.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi đặt lịch Zoom' });
  }
}

export async function getUserBookings(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const bookings = await prisma.zoomBooking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: bookings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải lịch sử booking' });
  }
}

// Admin
export async function getAllBookings(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'IB') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const bookings = await prisma.zoomBooking.findMany({
      include: { user: { select: { fullName: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: bookings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách booking' });
  }
}

export async function updateBookingStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'IB') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { id } = req.params;
    const { status, zoomLink } = req.body;

    const booking = await prisma.zoomBooking.update({
      where: { id },
      data: { status, zoomLink }
    });

    return res.json({ success: true, data: booking, message: 'Cập nhật trạng thái booking thành công' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật booking' });
  }
}

// ---------------------------------------------------------
// SUPPORT TICKETS
// ---------------------------------------------------------

export async function createTicket(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tiêu đề, loại và mô tả.' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        title,
        category,
        description,
        status: 'OPEN'
      }
    });

    return res.json({ success: true, data: ticket, message: 'Đã gửi ticket hỗ trợ thành công.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo ticket' });
  }
}

export async function getUserTickets(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: tickets });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải lịch sử ticket' });
  }
}

// Admin
export async function getAllTickets(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'IB') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const tickets = await prisma.supportTicket.findMany({
      include: { user: { select: { fullName: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: tickets });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách ticket' });
  }
}

export async function replyTicket(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'IB') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { id } = req.params;
    const { adminReply, status } = req.body;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { adminReply, status: status || 'RESOLVED' }
    });

    return res.json({ success: true, data: ticket, message: 'Đã phản hồi ticket thành công' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi phản hồi ticket' });
  }
}
