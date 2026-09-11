import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendNewLeadNotification(params: {
  toEmail: string;
  ibName: string;
  leadName: string;
  leadPhone: string;
  leadEmail?: string | null;
  landingPageTitle: string;
  notes?: string | null;
}) {
  const { toEmail, ibName, leadName, leadPhone, leadEmail, landingPageTitle, notes } = params;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[Email] GMAIL_USER hoặc GMAIL_APP_PASSWORD chưa được cấu hình. Bỏ qua gửi email.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f6fb;">
      <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#7C3AED,#4F46E5);padding:32px 36px;">
          <div style="color:#fff;">
            <div style="font-size:13px;opacity:0.8;margin-bottom:4px;">Bạc Môn Hub CRM</div>
            <h1 style="margin:0;font-size:24px;font-weight:800;">🔔 Có Khách Hàng Mới!</h1>
          </div>
        </div>

        <!-- Body -->
        <div style="padding:32px 36px;">
          <p style="color:#374151;font-size:15px;margin:0 0 24px;">
            Xin chào <strong>${ibName}</strong>, bạn vừa có một khách hàng mới đăng ký tư vấn qua Landing Page của bạn. Hãy liên hệ sớm để tăng tỷ lệ chốt!
          </p>

          <!-- Lead Info Card -->
          <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:24px;margin-bottom:24px;">
            <h2 style="margin:0 0 16px;font-size:16px;color:#1F2937;font-weight:700;">📋 Thông tin khách hàng</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#6B7280;font-size:14px;width:140px;">👤 Họ và tên</td>
                <td style="padding:8px 0;color:#1F2937;font-weight:600;font-size:14px;">${leadName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6B7280;font-size:14px;">📞 Số điện thoại</td>
                <td style="padding:8px 0;font-size:14px;">
                  <a href="tel:${leadPhone}" style="color:#059669;font-weight:700;text-decoration:none;">${leadPhone}</a>
                </td>
              </tr>
              ${leadEmail ? `<tr>
                <td style="padding:8px 0;color:#6B7280;font-size:14px;">📧 Email</td>
                <td style="padding:8px 0;color:#1F2937;font-size:14px;">${leadEmail}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:8px 0;color:#6B7280;font-size:14px;">🌐 Nguồn</td>
                <td style="padding:8px 0;font-size:14px;"><span style="background:#EDE9FE;color:#7C3AED;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${landingPageTitle}</span></td>
              </tr>
              ${notes ? `<tr>
                <td style="padding:8px 0;color:#6B7280;font-size:14px;vertical-align:top;">📝 Ghi chú</td>
                <td style="padding:8px 0;color:#374151;font-size:14px;">${notes}</td>
              </tr>` : ''}
            </table>
          </div>

          <!-- CTA -->
          <div style="text-align:center;">
            <p style="color:#6B7280;font-size:13px;margin:0 0 16px;">Đăng nhập hệ thống để xem và xử lý ngay:</p>
            <a href="http://localhost:5174" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#4F46E5);color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">
              Mở Bạc Môn Hub →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#F9FAFB;padding:20px 36px;border-top:1px solid #E5E7EB;text-align:center;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">Email tự động từ hệ thống Bạc Môn Hub CRM • ${new Date().toLocaleString('vi-VN')}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Bạc Môn Hub CRM" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `🔔 Khách hàng mới: ${leadName} (${leadPhone}) — ${landingPageTitle}`,
      html,
    });
    console.log(`[Email] Đã gửi thông báo lead mới đến ${toEmail}`);
  } catch (err) {
    console.error('[Email] Lỗi gửi email:', err);
  }
}

export async function sendDiscordLeadNotification(params: {
  ibName: string;
  leadName: string;
  leadPhone: string;
  landingPageTitle: string;
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[Discord] DISCORD_WEBHOOK_URL chưa được cấu hình. Bỏ qua.');
    return;
  }

  const { ibName, leadName, leadPhone, landingPageTitle } = params;
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const payload = {
    username: 'Bạc Môn Hub',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    embeds: [
      {
        title: '🎉 LEAD MỚI VỪA ĐĂNG KÝ!',
        color: 0x7C3AED,
        description: `🥳 Chúc mừng **${ibName}** có LEAD mới đăng ký qua kênh **${landingPageTitle}**!\n\n📋 Đăng nhập hệ thống để xem chi tiết và liên hệ ngay nhé!`,
        fields: [
          {
            name: '🌐 Kênh Landing Page',
            value: landingPageTitle,
            inline: false,
          },
          {
            name: '⚡ Hành động',
            value: '👉 Mở Bạc Môn Hub để xem thông tin khách hàng',
            inline: false,
          },
        ],
        footer: {
          text: `⏰ ${now} • Bạc Môn Hub CRM`,
        },
        thumbnail: {
          url: 'https://cdn-icons-png.flaticon.com/512/9068/9068085.png',
        },
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('[Discord] Đã gửi thông báo lead mới thành công!');
  } catch (err) {
    console.error('[Discord] Lỗi gửi webhook:', err);
  }
}
