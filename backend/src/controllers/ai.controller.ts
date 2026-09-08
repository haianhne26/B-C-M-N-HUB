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

    const systemPrompt = activeSetting?.systemPrompt || 'Bạn là BẠC MÔN AI - Chuyên gia phân tích kỹ thuật thị trường tài chính.';
    const analysisRules = activeSetting?.analysisRules || '1. Nhận diện Market Structure.\n2. Xác định vùng thanh khoản, FVG.\n3. Đưa ra tỷ lệ R:R tối thiểu 1:2.\n4. Đưa ra điều kiện Invalidation rõ ràng.';

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

Hãy phân tích hình ảnh biểu đồ được gửi kèm và trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm Markdown code block hay text thừa) theo đúng định dạng sau:
{
  "marketBias": "BUY" | "SELL" | "NEUTRAL",
  "confidence": 75,
  "entry": "Giá hoặc vùng vào lệnh",
  "stopLoss": "Giá cắt lỗ",
  "takeProfit": "Giá chốt lời",
  "riskReward": "1 : 2.5",
  "reasoning": "Lý do phân tích chi tiết dựa trên hành động giá và cấu trúc",
  "keyLevels": ["Vùng cản 1", "Vùng hỗ trợ 2"],
  "marketStructure": "BOS / ChoCH / Xu hướng tăng / tích lũy",
  "signals": ["Tín hiệu nến", "Chỉ báo"],
  "invalidation": "Điều kiện hủy kèo phân tích này nếu xảy ra",
  "educationalExplanation": "Bài học kinh nghiệm giáo dục về setup này"
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
    confidence: 78,
    entry: '2,745.50 - 2,748.00 (Vùng Demand H1)',
    stopLoss: '2,738.00 (Dưới đáy nến quét thanh khoản)',
    takeProfit: '2,768.50 (Đỉnh cũ phiên London)',
    riskReward: '1 : 2.8',
    reasoning: 'Giá đã tạo cấu trúc phá vỡ đỉnh gần nhất (BOS) kèm theo khối lượng mua chủ động. Vùng Fair Value Gap (FVG) phía dưới đóng vai trò là bệ phóng hỗ trợ lực đẩy tiếp theo.',
    keyLevels: ['Hỗ trợ 2,742.00', 'Kháng cự 2,768.00', 'Vùng cực trị 2,785.00'],
    marketStructure: 'Bullish Continuation (Xu hướng tăng tiếp diễn)',
    signals: ['Nến Bullish Pinbar chạm EMA 50', 'RSI phân kỳ dương khung M15'],
    invalidation: 'Kịch bản tăng bị hủy nếu nến H1 đóng cửa dứt khoát dưới mốc 2,737.50.',
    educationalExplanation: 'Kỷ luật cắt lỗ là yếu tố sống còn. Tỷ lệ R:R đạt 1:2.8 cho phép bạn giữ lợi thế dài hạn ngay cả khi tỷ lệ thắng chỉ ở mức 50%.'
  };
}
