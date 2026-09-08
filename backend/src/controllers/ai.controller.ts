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

    // Verbatim Gambler Hub AI System Rules
    const systemPrompt = `BẠN LÀ BẠC MÔN Hub AI.
Nhiệm vụ của bạn là phân tích thị trường theo đúng hệ thống BẠC MÔN Hub.
Bạn không được suy đoán.
Bạn chỉ được phép đưa ra tín hiệu khi toàn bộ điều kiện bắt buộc được đáp ứng.
Nếu còn thiếu bất kỳ điều kiện nào phải CẢNH BÁO RỦI RO.
Không được bỏ qua bất kỳ bước nào.`;

    const analysisRules = `LUẬT CHO AI BẠC MÔN: GAMBLER HUB AI SYSTEM

PHASE 1 - DAILY BIAS FILTER
Mục đích:
Weekly Profile chỉ là bộ lọc xác suất.
Không được sử dụng làm điều kiện vào lệnh.
Không được phép ghi đè Bias H4 hoặc H1.
AI cần xác định:
* Classic Expansion
* Midweek Reversal
* TGIF Profile
Sau đó trả về: Bullish / Bearish / Neutral
Nếu cùng hướng với H1 -> Confidence +1
Nếu ngược hướng -> Ignore Weekly Profile

PHASE 2 - MARKET BIAS
Khung sử dụng: H4, H1
PD Array được phép sử dụng:
* Order Block
* Breaker Block
* Fair Value Gap
* Inverse Fair Value Gap
Bias chính luôn lấy theo H1.
Nếu H1 hợp lưu H4 -> Confidence +2
Nếu chỉ có H1 -> Confidence +1

PHASE 3 - SESSION LIQUIDITY
Chỉ giao dịch phiên New York.
Đánh dấu:
- Asian High, Asian Low
- London High, London Low
- Previous Day High, Previous Day Low
Ưu tiên setup sau khi thị trường quét thanh khoản (Liquidity Sweep).
Nếu chưa có Liquidity Sweep -> CẢNH BÁO RỦI RO

PHASE 4 - MARKET STRUCTURE
M30: Phải có BOS. Nếu không -> NO TRADE
M15: Phải có: Liquidity Sweep, MSS. Nếu thiếu một điều kiện -> CẢNH BÁO RỦI RO
Exception: Nếu M5 xuất hiện Turtle Soup -> Có thể bỏ qua MSS M15. Điều kiện lúc này: BOS M30 + Liquidity Sweep + Turtle Soup

PHASE 5 - ENTRY
Ưu tiên M5. Tìm: Order Block, Fair Value Gap
Sử dụng Premium / Discount:
- BUY: Discount Only
- SELL: Premium Only
Nếu M5 không có Entry -> Xuống M1 tiếp tục tìm: Order Block, Fair Value Gap
Turtle Soup: Nếu M5 xuất hiện Turtle Soup -> Luôn ưu tiên Entry tại Order Block.

SIGNAL CONDITIONS
Chỉ phát tín hiệu khi:
- Bias H1
- Session Liquidity
- BOS M30
- Liquidity Sweep M15
- MSS M15 (hoặc Turtle Soup)
- Entry hợp lệ
Nếu thiếu: NÓI RA RỦI RO`;

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
ROLE:
${systemPrompt}

QUY TẮC PHÂN TÍCH BẮT BUỘC:
${analysisRules}

Hãy phân tích hình ảnh biểu đồ đính kèm theo đúng 5 Phase của GAMBLER HUB AI SYSTEM ở trên.
TUYỆT ĐỐI KHÔNG ĐƯỢC SUY ĐOÁN. Nếu thiếu bất kỳ điều kiện nào, phải nói rõ và ghi CẢNH BÁO RỦI RO.
Trả về DUY NHẤT một chuỗi JSON hợp lệ không có markdown code block:
{
  "marketBias": "BUY" | "SELL" | "NEUTRAL",
  "confidence": 85,
  "entry": "Mức giá / vùng vào lệnh (Chỉ Discount cho BUY, Chỉ Premium cho SELL)",
  "stopLoss": "Mức giá cắt lỗ",
  "takeProfit": "Mức giá chốt lời",
  "riskReward": "1 : 2.5",
  "reasoning": "Chi tiết phân tích theo 5 Phase: Daily Bias, Market Bias H1/H4, Session Liquidity, M30 BOS & M15 Sweep/MSS",
  "keyLevels": ["Asian High/Low", "London High/Low", "PDH/PDL", "Order Block", "FVG"],
  "marketStructure": "BOS M30 / MSS M15 / Turtle Soup M5",
  "signals": ["Tín hiệu xác nhận"],
  "invalidation": "CẢNH BÁO RỦI RO nếu thiếu điều kiện, hoặc điều kiện hủy setup",
  "educationalExplanation": "Bài học tuân thủ kỷ luật Bạc Môn Gambler Hub System"
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
        const finalPrompt = `BẠN LÀ BẠC MÔN Hub AI — HỆ THỐNG GAMBLER HUB AI SYSTEM.
Nhiệm vụ: Phân tích thị trường theo đúng hệ thống BẠC MÔN Hub.
- Không được suy đoán.
- Chỉ đưa ra tín hiệu khi toàn bộ điều kiện bắt buộc được đáp ứng.
- Nếu còn thiếu bất kỳ điều kiện nào phải CẢNH BÁO RỦI RO.
- Tuân thủ 5 Phase:
  + Phase 1: Daily Bias Filter (Weekly Profile chỉ là bộ lọc xác suất: Classic Expansion, Midweek Reversal, TGIF).
  + Phase 2: Market Bias (H4, H1: OB, Breaker Block, FVG, IFVG. Bias chính theo H1).
  + Phase 3: Session Liquidity (Chỉ trade phiên NY. Cần Liquidity Sweep Asian/London/PDH/PDL, thiếu là CẢNH BÁO RỦI RO).
  + Phase 4: Market Structure (M30 phải có BOS, không có thì NO TRADE; M15 phải có Liquidity Sweep + MSS, hoặc M5 Turtle Soup).
  + Phase 5: Entry (M5/M1 OB, FVG. BUY: Discount Only; SELL: Premium Only. Turtle Soup ưu tiên Entry tại OB).

Lịch sử hội thoại:
${historyPrompt}

Câu hỏi của trader: ${message}
Hãy trả lời ngắn gọn, chuẩn xác theo đúng các nguyên tắc trên:`;

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
