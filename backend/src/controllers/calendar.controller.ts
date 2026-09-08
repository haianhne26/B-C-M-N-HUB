import { Request, Response } from 'express';
import { prisma } from '../db';
import { syncEconomicCalendar, getCachedMacroIndicators, getLastSyncInfo } from '../services/calendar.service';

export async function listEconomicEvents(req: Request, res: Response) {
  try {
    const { impact, currency, dateFilter } = req.query;

    // Nếu database đang trống hoặc ít sự kiện, tự động đồng bộ lần đầu
    const totalCount = await prisma.economicEvent.count();
    if (totalCount < 5) {
      await syncEconomicCalendar().catch(() => {});
    }

    const where: any = {};
    if (impact) {
      where.impact = impact as string;
    }
    if (currency) {
      where.currency = (currency as string).toUpperCase();
    }

    const now = new Date();
    if (dateFilter === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      where.eventTime = { gte: startOfDay, lte: endOfDay };
    } else if (dateFilter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      where.eventTime = { gte: startOfWeek, lte: endOfWeek };
    }

    const events = await prisma.economicEvent.findMany({
      where,
      orderBy: { eventTime: 'asc' },
      take: 100,
    });

    const syncInfo = getLastSyncInfo();
    const macroIndicators = getCachedMacroIndicators();

    return res.json({
      success: true,
      provider: syncInfo.provider || 'Financial Modeling Prep (FMP) & Global Real-time Stream',
      lastSync: syncInfo.syncedAt || new Date().toISOString(),
      macroIndicators,
      data: events,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải dữ liệu lịch kinh tế', error: err.message });
  }
}

// Kích hoạt đồng bộ thủ công ngay lập tức
export async function triggerEconomicSync(req: Request, res: Response) {
  try {
    const result = await syncEconomicCalendar();
    return res.json({
      success: true,
      message: `Đồng bộ thành công ${result.count} sự kiện kinh tế`,
      result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi đồng bộ lịch kinh tế', error: err.message });
  }
}
