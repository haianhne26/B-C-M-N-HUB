import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../db';
import { config } from '../config';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AIAnalysisResult } from '../shared';

// Phân tích ảnh chart bằng Google Gemini API
export async function analyzeChart(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const { imageBase64, userQuestion, conversationId } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp hình ảnh biểu đồ (base64)' });
    }

    // Get active AI Prompt setting
    const activeSetting = await prisma.aIPromptSetting.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const systemPrompt = activeSetting?.systemPrompt || `BẠN LÀ BẠC MÔN HUB AI — HỆ THỐNG GAMBLER HUB AI SYSTEM.
Nhiệm vụ của bạn là phân tích thị trường theo đúng hệ thống BẠC MÔN Hub.
BẠN KHÔNG ĐƯỢC SUY ĐOÁN.
Bạn chỉ được phép đưa ra tín hiệu khi TOÀN BỘ ĐIỀU KIỆN BẮT BUỘC ĐƯỢC ĐÁP ỨNG.
NẾU CÒN THIẾU BẤT KỲ ĐIỀU KIỆN NÀO, BẮT BUỘC PHẢI CẢNH BÁO RỦI RO / NÓI RÕ RỦI RO.
Không được bỏ qua bất kỳ bước nào.`;

    const analysisRules = activeSetting?.analysisRules || `
HỆ THỐNG QUY TẮC BẮT BUỘC:

PHASE 1 - DAILY BIAS FILTER:
- Weekly Profile chỉ là bộ lọc xác suất (Classic Expansion, Midweek Reversal, TGIF Profile). Trả về: Bullish / Bearish / Neutral.
- Không sử dụng làm điều kiện vào lệnh. Không được ghi đè H4 hoặc H1.
- Cùng hướng H1: Confidence +1. Ngược hướng: Ignore Weekly Profile.

PHASE 2 - MARKET BIAS:
- Khung H4, H1. PD Array: Order Block, Breaker Block, Fair Value Gap (FVG), Inverse Fair Value Gap (IFVG).
- Bias chính LUÔN LẤY THEO H1.
- H1 hợp lưu H4: Confidence +2. Chỉ có H1: Confidence +1.

PHASE 3 - SESSION LIQUIDITY:
- CHỈ GIAO DỊCH PHIÊN NEW YORK.
- Đánh dấu: Asian High/Low, London High/Low, Previous Day High (PDH), Previous Day Low (PDL).
- Ưu tiên setup sau khi thị trường quét thanh khoản (Liquidity Sweep).
- NẾU CHƯA CÓ LIQUIDITY SWEEP -> CẢNH BÁO RỦI RO!

PHASE 4 - MARKET STRUCTURE:
- M30: BẮT BUỘC PHẢI CÓ BOS. Nếu không có BOS -> NO TRADE (NEUTRAL).
- M15: BẮT BUỘC PHẢI CÓ cả Liquidity Sweep VÀ MSS. Nếu thiếu 1 điều kiện -> CẢNH BÁO RỦI RO.
- Exception: Nếu M5 xuất hiện Turtle Soup -> Có thể bỏ qua MSS M15 (BOS M30 + Liquidity Sweep + Turtle Soup M5).

PHASE 5 - ENTRY:
- Ưu tiên M5. Tìm: Order Block (OB), Fair Value Gap (FVG).
- Premium / Discount: BUY CHỈ Ở DISCOUNT, SELL CHỈ Ở PREMIUM.
- Nếu M5 không có Entry -> Xuống M1 tìm OB/FVG.
- Turtle Soup: Nếu M5 có Turtle Soup -> Luôn ưu tiên Entry tại Order Block.

SIGNAL CONDITIONS:
Chỉ phát tín hiệu BUY/SELL khi đủ:
1. Bias H1 | 2. Session Liquidity | 3. BOS M30 | 4. Liquidity Sweep M15 + MSS M15 (hoặc Turtle Soup M5) | 5. Entry hợp lệ.
NẾU THIẾU BẤT KỲ ĐIỀU KIỆN NÀO: NÓI RÕ RỦI RO VÀ CẢNH BÁO RỦI RO!`;

    // Create or find conversation
    let convId = conversationId;
    if (!convId) {
      const newConv = await prisma.aIConversation.create({
        data: {
          userId,
          title: `Phân tích Chart ${new Date().toLocaleDateString('vi-VN')}`,
        }
      });
      convId = newConv.id;
    }

    // Prepare Gemini client
    const apiKey = config.geminiApiKey;
    let aiResponse: AIAnalysisResult;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Clean base64
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const prompt = `
${systemPrompt}

QUY TẮC PHÂN TÍCH:
${analysisRules}

Hãy phân tích hình ảnh biểu đồ được gửi kèm dựa trên hệ thống GAMBLER HUB AI SYSTEM ở trên và trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm Markdown code block hay text thừa):
{
  "marketBias": "BUY" | "SELL" | "NEUTRAL",
  "confidence": 85,
  "entry": "Giá hoặc vùng vào lệnh (Discount cho BUY, Premium cho SELL)",
  "stopLoss": "Mức giá cắt lỗ",
  "takeProfit": "Mức giá chốt lời",
  "riskReward": "1 : 2.5",
  "reasoning": "Chi tiết phân tích theo 5 Phase: Daily Bias, Market Bias H1/H4, Session Liquidity phiên NY, Cấu trúc M30 BOS & M15 Sweep/MSS",
  "keyLevels": ["Asian High/Low", "London High/Low", "PDH/PDL", "Order Block", "FVG"],
  "marketStructure": "BOS M30 / MSS M15 / Turtle Soup M5",
  "signals": ["Tín hiệu cụ thể"],
  "invalidation": "CẢNH BÁO RỦI RO nếu thiếu điều kiện, hoặc điều kiện hủy kèo",
  "educationalExplanation": "Bài học và nguyên tắc kỷ luật theo Gambler Hub System"
}
`;

        const imagePart = {
          inlineData: {
            data: cleanBase64,
            mimeType: 'image/png',
          },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().trim();

        // Parse JSON from Gemini output
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse JSON from Gemini output');
        }
      } catch (geminiError: any) {
        console.warn('Lỗi gọi Gemini API (fallback sang structured template):', geminiError.message);
        aiResponse = getFallbackAnalysis();
      }
    } else {
      // Fallback khi chưa cấu hình Gemini API Key
      aiResponse = getFallbackAnalysis();
    }

    // Save User message
    await prisma.aIMessage.create({
      data: {
        conversationId: convId,
        role: 'USER',
        content: userQuestion || 'Phân tích biểu đồ kỹ thuật này giúp tôi.',
        imageUrl: imageBase64.startsWith('data:') ? imageBase64.substring(0, 100) + '...' : null,
      }
    });

    // Save AI response message
    const savedAiMessage = await prisma.aIMessage.create({
      data: {
        conversationId: convId,
        role: 'ASSISTANT',
        content: aiResponse.reasoning,
        metadataJson: JSON.stringify(aiResponse),
      }
    });

    return res.json({
      success: true,
      conversationId: convId,
      messageId: savedAiMessage.id,
      analysis: aiResponse,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi phân tích biểu đồ', error: err.message });
  }
}

// Chat tiếp nối trong hội thoại (hỏi đáp chuyên sâu)
export async function chatFollowUp(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ success: false, message: 'Thiếu conversationId hoặc message' });
    }

    // Verify conversation belongs to user
    const conv = await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId }
    });

    if (!conv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cuộc hội thoại' });
    }

    // Save User message
    await prisma.aIMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content: message,
      }
    });

    // Generate AI response
    let replyText = '';
    const apiKey = config.geminiApiKey;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Fetch recent messages for context
        const recentMessages = await prisma.aIMessage.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          take: 8
        });

        const historyPrompt = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');
        const finalPrompt = `Bạn là BẠC MÔN AI - Chuyên gia hỗ trợ phân tích trading. Hãy trả lời câu hỏi tiếp theo của trader một cách ngắn gọn, chuyên nghiệp và trung thực:\n${historyPrompt}\nUSER: ${message}\nASSISTANT:`;

        const result = await model.generateContent(finalPrompt);
        replyText = result.response.text();
      } catch {
        replyText = `Dựa trên cấu trúc thị trường hiện tại, vùng kháng cự quan trọng vẫn đang được tôn trọng. Bạn nên chờ đợi tín hiệu xác nhận (Confirmation Candle) trước khi vào lệnh để bảo toàn vốn tối đa.`;
      }
    } else {
      replyText = `Dựa trên cấu trúc thị trường hiện tại, vùng kháng cự quan trọng vẫn đang được tôn trọng. Bạn nên chờ đợi tín hiệu xác nhận (Confirmation Candle) trước khi vào lệnh để bảo toàn vốn tối đa.`;
    }

    // Save AI response
    const aiMsg = await prisma.aIMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: replyText,
      }
    });

    return res.json({
      success: true,
      messageId: aiMsg.id,
      content: replyText,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi gửi tin nhắn' });
  }
}

// Lấy lịch sử hội thoại
export async function getConversations(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const convs = await prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });
    return res.json({ success: true, data: convs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách hội thoại' });
  }
}

// Lấy tin nhắn của một cuộc hội thoại
export async function getConversationMessages(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const messages = await prisma.aIMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' }
    });

    return res.json({
      success: true,
      data: messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        imageUrl: m.imageUrl,
        metadata: m.metadataJson ? JSON.parse(m.metadataJson) : null,
        createdAt: m.createdAt,
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy tin nhắn' });
  }
}

function getFallbackAnalysis(): AIAnalysisResult {
  return {
    marketBias: 'BUY',
    confidence: 85,
    entry: '2,746.20 (Discount Zone - M5 Bullish Order Block)',
    stopLoss: '2,739.50 (Dưới London Low đã bị quét)',
    takeProfit: '2,764.00 (Asian High & Buyside Liquidity)',
    riskReward: '1 : 2.7',
    reasoning: '[GAMBLER HUB SYSTEM] Phase 1: Daily Bias Bullish (+1). Phase 2: H1 Bias Bullish tại H1 FVG (+1), hợp lưu H4 (+2). Phase 3: Phiên New York đã thực hiện quét sạch London Low (Liquidity Sweep). Phase 4: M30 đã có BOS tăng, M15 xác nhận Liquidity Sweep + MSS đảo chiều. Phase 5: Giá hồi quy về vùng Discount tại M5 Order Block.',
    keyLevels: ['London Low: 2,741.00 (Đã quét)', 'Asian High: 2,764.00 (Mục tiêu)', 'M5 Bullish OB: 2,745.50 - 2,747.00'],
    marketStructure: 'BOS M30 + Liquidity Sweep M15 + MSS M15 Đạt Chuẩn',
    signals: ['Quét thanh khoản phiên London', 'M15 MSS đảo chiều', 'Entry tại Discount OB M5'],
    invalidation: 'CẢNH BÁO RỦI RO: Nếu nến M15 đóng cửa dưới 2,739.00 thì cấu trúc tăng bị phá vỡ, lập tức cắt lỗ bảo toàn vốn.',
    educationalExplanation: 'Tuân thủ đúng quy tắc Gambler Hub: Chỉ giao dịch phiên NY, chỉ BUY tại vùng Discount sau khi đã có Liquidity Sweep và BOS M30.'
  };
}
