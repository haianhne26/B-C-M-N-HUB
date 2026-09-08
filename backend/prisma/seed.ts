import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu (Seeding Database)...');

  // 1. Roles
  const ownerRole = await prisma.role.upsert({
    where: { name: 'OWNER' },
    update: {},
    create: { name: 'OWNER', description: 'Toàn quyền quản trị hệ thống' },
  });

  const ibRole = await prisma.role.upsert({
    where: { name: 'IB' },
    update: {},
    create: { name: 'IB', description: 'Đối tác IB: CRM, Landing Page Builder, Free Premium Content' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER', description: 'Người dùng cuối với quyền theo License KEY' },
  });

  // 2. Permissions
  const permissionsList = [
    { code: 'users.view', description: 'Xem danh sách người dùng' },
    { code: 'users.create', description: 'Tạo tài khoản người dùng mới' },
    { code: 'users.edit', description: 'Chỉnh sửa tài khoản người dùng' },
    { code: 'users.delete', description: 'Khóa / Xóa người dùng' },
    { code: 'users.manage_keys', description: 'Gán và thu hồi KEY của người dùng' },
    { code: 'keys.view', description: 'Xem danh sách License KEY' },
    { code: 'keys.create', description: 'Tạo và sinh License KEY mới' },
    { code: 'keys.revoke', description: 'Thu hồi / Khóa License KEY' },
    { code: 'keys.extend', description: 'Gia hạn thời gian License KEY' },
    { code: 'keys.assign', description: 'Gán License KEY cho người dùng' },
    { code: 'trading.view', description: 'Xem Dashboard giao dịch MT5' },
    { code: 'trading.manage', description: 'Quản lý kết nối MT5' },
    { code: 'ai.chat', description: 'Chat hỏi đáp với Bạc Môn AI' },
    { code: 'ai.chart_analysis', description: 'Upload và phân tích ảnh chart bằng AI' },
    { code: 'ai.manage_prompts', description: 'Chỉnh sửa Prompt và Model AI' },
    { code: 'courses.view', description: 'Xem các khóa học cơ bản' },
    { code: 'courses.premium', description: 'Truy cập các khóa học và tài nguyên Premium' },
    { code: 'courses.create', description: 'Tạo khóa học mới' },
    { code: 'courses.edit', description: 'Chỉnh sửa nội dung khóa học' },
    { code: 'courses.delete', description: 'Xóa khóa học' },
    { code: 'calendar.view', description: 'Xem Lịch kinh tế' },
    { code: 'calendar.manage', description: 'Quản lý dữ liệu Lịch kinh tế' },
    { code: 'crm.view', description: 'Xem CRM quản lý khách hàng' },
    { code: 'crm.create', description: 'Thêm Lead mới vào CRM' },
    { code: 'crm.edit', description: 'Cập nhật trạng thái và ghi chú Lead' },
    { code: 'crm.delete', description: 'Xóa Lead trong CRM' },
    { code: 'landing.create', description: 'Tạo Landing Page cá nhân mới' },
    { code: 'landing.edit', description: 'Chỉnh sửa Landing Page' },
    { code: 'landing.publish', description: 'Xuất bản Landing Page' },
    { code: 'landing.delete', description: 'Xóa Landing Page' },
    { code: 'system.update', description: 'Phát hành bản cập nhật phần mềm mới' },
    { code: 'system.settings', description: 'Chỉnh sửa cấu hình toàn hệ thống' },
    { code: 'system.logs', description: 'Xem Audit Logs hệ thống' },
  ];

  for (const p of permissionsList) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { description: p.description },
      create: { code: p.code, description: p.description },
    });
  }

  const allPerms = await prisma.permission.findMany();

  // Assign All Permissions to OWNER
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: ownerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: ownerRole.id, permissionId: perm.id },
    });
  }

  // Assign IB Permissions: All user perms + CRM + Landing Page + Free Premium Courses
  const ibPermCodes = [
    'trading.view', 'trading.manage',
    'ai.chat', 'ai.analysis',
    'courses.view', 'courses.premium',
    'calendar.view',
    'crm.view', 'crm.create', 'crm.edit', 'crm.delete',
    'landing.create', 'landing.edit', 'landing.publish', 'landing.delete'
  ];

  for (const perm of allPerms) {
    if (ibPermCodes.includes(perm.code)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: ibRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: ibRole.id, permissionId: perm.id },
      });
    }
  }

  // Assign Standard USER Permissions
  const userPermCodes = ['trading.view', 'ai.chat', 'ai.chart_analysis', 'courses.view', 'calendar.view'];
  for (const perm of allPerms) {
    if (userPermCodes.includes(perm.code)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: userRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: userRole.id, permissionId: perm.id },
      });
    }
  }

  // 3. Seed Default Accounts
  const salt = await bcrypt.genSalt(10);
  const ownerPassword = await bcrypt.hash('Owner@123456', salt);
  const ibPassword = await bcrypt.hash('Ib@123456', salt);
  const userPassword = await bcrypt.hash('User@123456', salt);

  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@bacmonhub.com' },
    update: {},
    create: {
      email: 'owner@bacmonhub.com',
      passwordHash: ownerPassword,
      fullName: 'Bạc Môn HUB Owner',
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });

  const ibUser = await prisma.user.upsert({
    where: { email: 'ib@bacmonhub.com' },
    update: {},
    create: {
      email: 'ib@bacmonhub.com',
      passwordHash: ibPassword,
      fullName: 'Đối tác IB Mẫu',
      phone: '0901234567',
      role: 'IB',
      status: 'ACTIVE',
    },
  });

  const standardUser = await prisma.user.upsert({
    where: { email: 'user@bacmonhub.com' },
    update: {},
    create: {
      email: 'user@bacmonhub.com',
      passwordHash: userPassword,
      fullName: 'Trader Bạc Môn',
      phone: '0987654321',
      role: 'USER',
      status: 'ACTIVE',
      ibId: ibUser.id,
    },
  });

  // 4. Seed License Keys
  const oneYearExpiry = new Date();
  oneYearExpiry.setFullYear(oneYearExpiry.getFullYear() + 1);

  await prisma.licenseKey.upsert({
    where: { keyCode: 'BMH-GOLD-2026-ACTIVE' },
    update: {},
    create: {
      keyCode: 'BMH-GOLD-2026-ACTIVE',
      status: 'ACTIVE',
      userId: standardUser.id,
      createdById: ownerUser.id,
      activatedAt: new Date(),
      expiresAt: oneYearExpiry,
      maxDevices: 2,
      allowedServices: JSON.stringify(['trading', 'ai', 'courses', 'calendar']),
      notes: 'Key kích hoạt đầy đủ 4 dịch vụ cho Trader Bạc Môn',
    },
  });

  await prisma.licenseKey.upsert({
    where: { keyCode: 'BMH-PRO8-9921-ABCD' },
    update: {},
    create: {
      keyCode: 'BMH-PRO8-9921-ABCD',
      status: 'UNUSED',
      createdById: ownerUser.id,
      maxDevices: 1,
      allowedServices: JSON.stringify(['trading', 'ai', 'courses', 'calendar']),
      notes: 'Key chưa kích hoạt (Unused) để test chức năng nhập KEY',
    },
  });

  // 5. Seed Courses
  const course1 = await prisma.course.upsert({
    where: { slug: 'fibo-matrix-101' },
    update: {},
    create: {
      title: 'Fibo Matrix 101 — Cấu trúc & Tỷ lệ Vàng',
      slug: 'fibo-matrix-101',
      description: 'Phương pháp định vị các điểm thoái lui và mở rộng Fibo thực chiến chuẩn xác.',
      category: 'Technical Analysis',
      isPremium: true,
      isPublished: true,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: 'gold-trading-101' },
    update: {},
    create: {
      title: 'Gold Trading 101 — Bí kíp giao dịch Vàng (XAU/USD)',
      slug: 'gold-trading-101',
      description: 'Đặc tính biến động của Vàng theo các phiên London, New York và bẫy thanh khoản.',
      category: 'Commodities',
      isPremium: false,
      isPublished: true,
    },
  });

  // Add Chapters & Lessons
  const chapter1 = await prisma.courseChapter.create({
    data: {
      courseId: course1.id,
      title: 'Chương 1: Nền tảng Fibonacci',
      sortOrder: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      chapterId: chapter1.id,
      title: 'Bài 1: Xác định Swing High & Swing Low chuẩn',
      contentType: 'VIDEO',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '18:45',
      sortOrder: 1,
      isFreePreview: true,
    },
  });

  // 6. Seed Sample Economic Events
  const sampleTime = new Date();
  sampleTime.setHours(19, 30, 0, 0);

  await prisma.economicEvent.create({
    data: {
      eventTime: sampleTime,
      country: 'US',
      currency: 'USD',
      eventName: 'Chỉ số giá tiêu dùng CPI (MoM)',
      impact: 'HIGH',
      actual: '0.3%',
      forecast: '0.2%',
      previous: '0.2%',
    },
  });

  // 7. Seed Default AI Prompt Setting (GAMBLER HUB AI SYSTEM)
  await prisma.aIPromptSetting.upsert({
    where: { versionTag: 'v1.0' },
    update: {
      systemPrompt: `BẠN LÀ BẠC MÔN Hub AI.
Nhiệm vụ của bạn là phân tích thị trường theo đúng hệ thống BẠC MÔN Hub.
Bạn không được suy đoán.
Bạn chỉ được phép đưa ra tín hiệu khi toàn bộ điều kiện bắt buộc được đáp ứng.
Nếu còn thiếu bất kỳ điều kiện nào phải CẢNH BÁO RỦI RO.
Không được bỏ qua bất kỳ bước nào.`,
      analysisRules: `LUẬT CHO AI BẠC MÔN: GAMBLER HUB AI SYSTEM

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
Nếu thiếu: NÓI RA RỦI RO`,
    },
    create: {
      versionTag: 'v1.0',
      systemPrompt: `BẠN LÀ BẠC MÔN Hub AI.
Nhiệm vụ của bạn là phân tích thị trường theo đúng hệ thống BẠC MÔN Hub.
Bạn không được suy đoán.
Bạn chỉ được phép đưa ra tín hiệu khi toàn bộ điều kiện bắt buộc được đáp ứng.
Nếu còn thiếu bất kỳ điều kiện nào phải CẢNH BÁO RỦI RO.
Không được bỏ qua bất kỳ bước nào.`,
      analysisRules: `LUẬT CHO AI BẠC MÔN: GAMBLER HUB AI SYSTEM

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
Nếu thiếu: NÓI RA RỦI RO`,
      outputSchema: 'JSON: { marketBias, confidence, entry, stopLoss, takeProfit, riskReward, reasoning, keyLevels, marketStructure, signals, invalidation, educationalExplanation }',
      isActive: true,
      temperature: 0.2,
      tokenLimit: 2048,
      createdById: ownerUser.id,
    },
  });

  // 8. Seed App Version
  await prisma.appVersion.upsert({
    where: { version: '1.0.0' },
    update: {},
    create: {
      version: '1.0.0',
      downloadUrl: 'http://localhost:4000/updates/BacMonHub-Setup-1.0.0.exe',
      releaseNotes: 'Bản phát hành chính thức đầu tiên của BẠC MÔN HUB Desktop.',
      isMandatory: false,
      isPublished: true,
    },
  });

  console.log('✅ Khởi tạo dữ liệu thành công!');
  console.log('   - OWNER: owner@bacmonhub.com (Pass: Owner@123456)');
  console.log('   - IB:    ib@bacmonhub.com    (Pass: Ib@123456)');
  console.log('   - USER:  user@bacmonhub.com  (Pass: User@123456)');
  console.log('   - KEY:   BMH-GOLD-2026-ACTIVE (Active) & BMH-PRO8-9921-ABCD (Unused)');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
