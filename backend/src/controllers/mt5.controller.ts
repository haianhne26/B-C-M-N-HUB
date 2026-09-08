import { Request, Response } from 'express';
import { prisma } from '../db';
import { config } from '../config';
import { AuthenticatedRequest } from '../middlewares/auth';

// Endpoint dành riêng cho MT5 EA đẩy dữ liệu về Bridge
export async function pushFromEA(req: Request, res: Response) {
  try {
    const bridgeToken = req.headers['x-bridge-token'] || req.body.bridgeToken;

    if (bridgeToken !== config.mt5BridgeToken) {
      return res.status(401).json({ success: false, message: 'Invalid Bridge Token' });
    }

    const {
      accountNumber,
      userId,
      broker = 'Unknown Broker',
      serverName = 'MT5 Server',
      currency = 'USD',
      balance = 0,
      equity = 0,
      margin = 0,
      freeMargin = 0,
      marginLevel = 0,
      profit = 0,
      positions = [],
      historyTrades = [],
    } = req.body;

    if (!accountNumber || !userId) {
      return res.status(400).json({ success: false, message: 'Thiếu accountNumber hoặc userId' });
    }

    // Upsert MT5 Account
    const account = await prisma.mT5Account.upsert({
      where: { accountNumber: parseInt(accountNumber, 10) },
      update: {
        broker,
        serverName,
        currency,
        balance: parseFloat(balance),
        equity: parseFloat(equity),
        margin: parseFloat(margin),
        freeMargin: parseFloat(freeMargin),
        marginLevel: parseFloat(marginLevel),
        profit: parseFloat(profit),
        isConnected: true,
        lastPingAt: new Date(),
      },
      create: {
        userId,
        accountNumber: parseInt(accountNumber, 10),
        broker,
        serverName,
        currency,
        balance: parseFloat(balance),
        equity: parseFloat(equity),
        margin: parseFloat(margin),
        freeMargin: parseFloat(freeMargin),
        marginLevel: parseFloat(marginLevel),
        profit: parseFloat(profit),
        isConnected: true,
      }
    });

    // Sync Open Positions (Delete old & recreate to reflect exact MT5 state)
    await prisma.mT5Position.deleteMany({ where: { accountId: account.id } });

    if (Array.isArray(positions) && positions.length > 0) {
      for (const pos of positions) {
        await prisma.mT5Position.create({
          data: {
            accountId: account.id,
            ticket: pos.ticket,
            symbol: pos.symbol,
            type: pos.type, // 'BUY' | 'SELL'
            volume: parseFloat(pos.volume),
            openPrice: parseFloat(pos.openPrice),
            currentPrice: parseFloat(pos.currentPrice),
            sl: parseFloat(pos.sl || 0),
            tp: parseFloat(pos.tp || 0),
            profit: parseFloat(pos.profit || 0),
            openTime: new Date(pos.openTime || Date.now()),
          }
        });
      }
    }

    // Upsert recent trade history
    if (Array.isArray(historyTrades) && historyTrades.length > 0) {
      for (const trade of historyTrades) {
        await prisma.mT5HistoryTrade.upsert({
          where: { ticket: trade.ticket },
          update: {
            profit: parseFloat(trade.profit),
            closePrice: parseFloat(trade.closePrice),
            closeTime: new Date(trade.closeTime || Date.now()),
          },
          create: {
            accountId: account.id,
            ticket: trade.ticket,
            symbol: trade.symbol,
            type: trade.type,
            volume: parseFloat(trade.volume),
            openPrice: parseFloat(trade.openPrice),
            closePrice: parseFloat(trade.closePrice),
            profit: parseFloat(trade.profit),
            closeTime: new Date(trade.closeTime || Date.now()),
          }
        });
      }
    }

    return res.json({ success: true, message: 'Sync MT5 data successful', accountId: account.id });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi MT5 Bridge', error: err.message });
  }
}

// Lấy thông tin tài khoản MT5 cho Desktop Client
export async function getAccountSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const account = await prisma.mT5Account.findFirst({
      where: { userId },
      orderBy: { lastPingAt: 'desc' }
    });

    if (!account) {
      return res.json({
        success: true,
        connected: false,
        message: 'Chưa kết nối MT5',
        data: null
      });
    }

    // Check if disconnected (if last ping is older than 60 seconds)
    const isActuallyConnected = (Date.now() - new Date(account.lastPingAt).getTime()) < 60000;

    return res.json({
      success: true,
      connected: isActuallyConnected,
      data: {
        ...account,
        isConnected: isActuallyConnected,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải thông tin MT5' });
  }
}

// Lấy danh sách lệnh mở cho Desktop Client
export async function getPositions(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const account = await prisma.mT5Account.findFirst({
      where: { userId },
      include: { positions: { orderBy: { openTime: 'desc' } } }
    });

    if (!account) {
      return res.json({ success: true, data: [] });
    }

    return res.json({ success: true, data: account.positions });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách lệnh' });
  }
}

// Lấy lịch sử giao dịch
export async function getTradeHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const account = await prisma.mT5Account.findFirst({
      where: { userId },
      include: { historyTrades: { orderBy: { closeTime: 'desc' }, take: 50 } }
    });

    if (!account) {
      return res.json({ success: true, data: [] });
    }

    return res.json({ success: true, data: account.historyTrades });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải lịch sử lệnh' });
  }
}
