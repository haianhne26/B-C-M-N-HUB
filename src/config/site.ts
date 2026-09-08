export interface FeatureItem {
  id: string;
  number: string;
  title: string;
  description: string;
  iconName: 'chart' | 'shield' | 'tools' | 'interface' | 'realtime' | 'update';
}

export interface StatItem {
  number: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PlatformDownload {
  name: string;
  icon: 'windows' | 'apple' | 'android';
  badge?: string;
  description: string;
  url: string;
  available: boolean;
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  heroHeading: string;
  heroHighlight: string;
  description: string;
  downloadUrl: string;
  version: string;
  releaseDate?: string;
  statsTitle: string;
  stats: StatItem[];
  featuresTitle: string;
  featuresSubtitle: string;
  features: FeatureItem[];
  showcaseTitle: string;
  showcaseSubtitle: string;
  showcaseTabs: {
    id: string;
    label: string;
    title: string;
    description: string;
    previewType: 'dashboard' | 'chart' | 'trading-panel';
  }[];
  downloadSection: {
    heading: string;
    description: string;
    buttonText: string;
    platforms: PlatformDownload[];
  };
  faqTitle: string;
  faqSubtitle: string;
  faqList: FaqItem[];
  finalCta: {
    heading: string;
    subheading: string;
    buttonText: string;
  };
  socialLinks: {
    telegramUrl: string;
    facebookUrl: string;
    tiktokUrl: string;
    youtubeUrl?: string;
  };
  contact: {
    email: string;
    supportUrl: string;
  };
  footer: {
    tagline: string;
    copyright: string;
    disclaimer: string;
  };
}

export const siteConfig: SiteConfig = {
  siteName: "BẠC MÔN HUB",
  tagline: "Trading Tools. Simplified.",
  heroHeading: "Công cụ hỗ trợ giao dịch",
  heroHighlight: "đơn giản và hiệu quả.",
  description: "Một nền tảng hỗ trợ trader quản lý giao dịch, theo dõi thị trường và sử dụng các công cụ cần thiết trong một giao diện trực quan.",
  
  // Link tải phần mềm chính (thay đổi link file cài đặt tại đây)
  downloadUrl: "#download",
  version: "1.0.0",
  releaseDate: "2026",

  // Section 6: Trust / Quick Stats (Không số liệu giả)
  statsTitle: "Một công cụ. Những gì trader cần.",
  stats: [
    {
      number: "01",
      title: "Giao diện trực quan",
      description: "Tối ưu hiển thị, tập trung vào thao tác nhanh chóng và chính xác."
    },
    {
      number: "02",
      title: "Công cụ mạnh mẽ",
      description: "Tích hợp đầy đủ các tiện ích theo dõi thị trường và hỗ trợ ra quyết định."
    },
    {
      number: "03",
      title: "Tối ưu cho trader",
      description: "Được nghiên cứu và thiết kế dựa trên trải nghiệm thực chiến của người dùng."
    },
    {
      number: "04",
      title: "Cập nhật liên tục",
      description: "Luôn hoàn thiện tính năng và tối ưu hiệu suất theo phản hồi."
    }
  ],

  // Section 7: Features
  featuresTitle: "Mọi công cụ cần thiết, trong một nơi.",
  featuresSubtitle: "BẠC MÔN HUB được thiết kế để giúp trader tập trung vào điều quan trọng nhất: giao dịch.",
  features: [
    {
      id: "market-analysis",
      number: "01",
      title: "Market Analysis",
      description: "Theo dõi và phân tích thị trường trực quan với dữ liệu chuẩn xác, rõ ràng.",
      iconName: "chart"
    },
    {
      id: "risk-management",
      number: "02",
      title: "Risk Management",
      description: "Hỗ trợ quản lý rủi ro và kiểm soát kỷ luật giao dịch cho mỗi vị thế.",
      iconName: "shield"
    },
    {
      id: "trading-tools",
      number: "03",
      title: "Trading Tools",
      description: "Tập hợp các công cụ hỗ trợ giao dịch cần thiết trong một giao diện hợp nhất.",
      iconName: "tools"
    },
    {
      id: "smart-interface",
      number: "04",
      title: "Smart Interface",
      description: "Thiết kế đơn giản, thanh lịch, dễ làm quen ngay từ lần đầu mở phần mềm.",
      iconName: "interface"
    },
    {
      id: "realtime-info",
      number: "05",
      title: "Realtime Information",
      description: "Theo dõi biến động giá và thông tin thị trường một cách tức thì và mượt mà.",
      iconName: "realtime"
    },
    {
      id: "continuous-updates",
      number: "06",
      title: "Continuous Updates",
      description: "Hệ thống liên tục cập nhật, sửa lỗi và bổ sung tính năng tự động.",
      iconName: "update"
    }
  ],

  // Section 8: Product Showcase
  showcaseTitle: "Tất cả những gì bạn cần.",
  showcaseSubtitle: "Trải nghiệm không gian làm việc chuyên nghiệp, loại bỏ sự lộn xộn để tập trung phân tích thị trường.",
  showcaseTabs: [
    {
      id: "dashboard",
      label: "Bảng điều khiển tổng quan",
      title: "Giao diện BẠC MÔN HUB Dashboard",
      description: "Xem nhanh trạng thái thị trường, danh mục theo dõi và bảng lệnh tức thời.",
      previewType: "dashboard"
    },
    {
      id: "chart",
      label: "Biểu đồ & Phân tích",
      title: "Công cụ phân tích kỹ thuật",
      description: "Biểu đồ sắc nét với các mốc biến động, hỗ trợ vẽ và đặt cảnh báo nhanh.",
      previewType: "chart"
    },
    {
      id: "panel",
      label: "Quản lý rủi ro (Risk Panel)",
      title: "Kiểm soát rủi ro thông minh",
      description: "Tính toán khối lượng, mức cắt lỗ và chốt lời tự động theo tỷ lệ an toàn.",
      previewType: "trading-panel"
    }
  ],

  // Section 9: Download
  downloadSection: {
    heading: "Sẵn sàng bắt đầu?",
    description: "Tải BẠC MÔN HUB và trải nghiệm bộ công cụ hỗ trợ giao dịch trong một giao diện đơn giản, trực quan.",
    buttonText: "Tải BẠC MÔN HUB",
    platforms: [
      {
        name: "Windows",
        icon: "windows",
        badge: "Khuyên dùng (v1.0.0)",
        description: "Hỗ trợ Windows 10, 11 (64-bit)",
        url: "#", // Thay link file .exe hoặc .zip tại đây
        available: true
      },
      {
        name: "macOS",
        icon: "apple",
        badge: "Sắp ra mắt",
        description: "Hỗ trợ Apple Silicon & Intel",
        url: "#",
        available: false
      },
      {
        name: "Mobile App",
        icon: "android",
        badge: "Đang phát triển",
        description: "Theo dõi dữ liệu mọi lúc mọi nơi",
        url: "#",
        available: false
      }
    ]
  },

  // Section 10: FAQ
  faqTitle: "Câu hỏi thường gặp",
  faqSubtitle: "Một số thông tin cơ bản giải đáp thắc mắc về BẠC MÔN HUB.",
  faqList: [
    {
      question: "BẠC MÔN HUB là gì?",
      answer: "BẠC MÔN HUB là một bộ công cụ hỗ trợ trader trong quá trình theo dõi, phân tích và quản lý giao dịch thị trường một cách tinh gọn và hiệu quả."
    },
    {
      question: "Phần mềm có miễn phí không?",
      answer: "BẠC MÔN HUB hiện tại cho phép người dùng tải xuống và trải nghiệm các tính năng cốt lõi. Mọi thông tin chi tiết về chính sách sử dụng sẽ được cập nhật công khai tại website."
    },
    {
      question: "Hỗ trợ hệ điều hành nào?",
      answer: "Hiện tại phần mềm hỗ trợ tốt nhất trên hệ điều hành Windows (Windows 10 và 11 64-bit). Các phiên bản dành cho macOS và thiết bị di động đang được nghiên cứu và phát triển."
    },
    {
      question: "Làm thế nào để tải phần mềm?",
      answer: "Bạn chỉ cần nhấn nút 'Tải BẠC MÔN HUB' trên website, tải file cài đặt về máy tính và tiến hành mở lên để sử dụng theo hướng dẫn."
    }
  ],

  // Section 11: Final CTA
  finalCta: {
    heading: "BẠC MÔN HUB",
    subheading: "Trade smarter. Stay focused.",
    buttonText: "Tải phần mềm ngay"
  },

  // Social URLs (Nếu để chuỗi rỗng "" thì icon sẽ tự động ẩn hoặc chỉ hiển thị khi có link)
  socialLinks: {
    telegramUrl: "", // Điền link nếu có, vd: "https://t.me/bacmonhub"
    facebookUrl: "", // Điền link nếu có, vd: "https://facebook.com/bacmonhub"
    tiktokUrl: "",   // Điền link nếu có, vd: "https://tiktok.com/@bacmonhub"
  },

  // Liên hệ
  contact: {
    email: "support@bacmonhub.com",
    supportUrl: "#"
  },

  // Footer
  footer: {
    tagline: "Trading tools designed for simplicity and efficiency.",
    copyright: "© 2026 BẠC MÔN HUB. All rights reserved.",
    disclaimer: "Giao dịch tài chính luôn tiềm ẩn rủi ro. Phần mềm cung cấp các công cụ hỗ trợ phân tích và quản lý, người dùng tự chịu trách nhiệm về các quyết định đầu tư của mình."
  }
};
