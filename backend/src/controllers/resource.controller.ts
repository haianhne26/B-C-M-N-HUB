import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';

// ---------------------------------------------------------
// BOT RESOURCES
// ---------------------------------------------------------

export async function getBotResources(req: AuthenticatedRequest, res: Response) {
  try {
    const bots = await prisma.botResource.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: bots });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách Bot' });
  }
}

export async function createBotResource(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'IB') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { title, description, downloadUrl, version, isPremium } = req.body;

    if (!title || !downloadUrl) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và link tải Bot' });
    }

    const bot = await prisma.botResource.create({
      data: { title, description, downloadUrl, version, isPremium }
    });

    return res.json({ success: true, data: bot, message: 'Thêm Bot thành công' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi thêm Bot' });
  }
}

export async function deleteBotResource(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'IB') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { id } = req.params;
    await prisma.botResource.delete({ where: { id } });

    return res.json({ success: true, message: 'Xóa Bot thành công' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa Bot' });
  }
}

// ---------------------------------------------------------
// PASSVIEW ACCOUNTS
// ---------------------------------------------------------

export async function getPassviewAccounts(req: AuthenticatedRequest, res: Response) {
  try {
    const accounts = await prisma.passviewAccount.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: accounts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách Passview' });
  }
}

export async function createPassviewAccount(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'IB') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { title, broker, server, accountNumber, password, description, isPremium } = req.body;

    if (!title || !broker || !server || !accountNumber || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin tài khoản' });
    }

    const account = await prisma.passviewAccount.create({
      data: { title, broker, server, accountNumber, password, description, isPremium }
    });

    return res.json({ success: true, data: account, message: 'Thêm Passview thành công' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi thêm Passview' });
  }
}

export async function deletePassviewAccount(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user?.role !== 'OWNER' && req.user?.role !== 'IB') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { id } = req.params;
    await prisma.passviewAccount.delete({ where: { id } });

    return res.json({ success: true, message: 'Xóa Passview thành công' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa Passview' });
  }
}
