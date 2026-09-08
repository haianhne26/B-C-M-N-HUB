import { Request, Response } from 'express';
import { prisma } from '../db';

export async function listEconomicEvents(req: Request, res: Response) {
  try {
    const { impact, currency, dateFilter } = req.query;

    const where: any = {};
    if (impact) {
      where.impact = impact as string;
    }
    if (currency) {
      where.currency = (currency as string).toUpperCase();
    }

    if (dateFilter === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      where.eventTime = { gte: startOfDay, lte: endOfDay };
    }

    const events = await prisma.economicEvent.findMany({
      where,
      orderBy: { eventTime: 'asc' },
      take: 50,
    });

    return res.json({
      success: true,
      provider: 'Bạc Môn Global Economic Provider v1.0',
      lastSync: new Date().toISOString(),
      data: events,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải dữ liệu lịch kinh tế' });
  }
}
