import { prisma } from '../db';
import { config } from '../config';

export interface MacroIndicator {
  name: string;
  value: string | number;
  date: string;
  label: string;
}

export interface SyncResult {
  success: boolean;
  count: number;
  provider: string;
  syncedAt: string;
  macroIndicators?: MacroIndicator[];
  fmpStatus?: string;
  message?: string;
}

let cachedMacroIndicators: MacroIndicator[] = [];
let lastSyncInfo = {
  provider: 'Chưa đồng bộ',
  syncedAt: '',
  count: 0,
};

// Đồng bộ Lịch Kinh Tế Real-time từ FMP và Global Feeds
export async function syncEconomicCalendar(): Promise<SyncResult> {
  const fmpKey = config.fmpApiKey;
  let provider = 'Financial Modeling Prep (FMP) Stable Calendar API';
  let rawEvents: any[] = [];
  let fmpStatus = 'UNKNOWN';

  // 1. Fetch từ FMP Stable Economic Calendar Endpoint được cung cấp
  try {
    const fmpUrl = `https://financialmodelingprep.com/stable/economic-calendar?apikey=${fmpKey}`;
    console.log('[Calendar Sync] Đang kết nối FMP:', fmpUrl);
    const res = await fetch(fmpUrl);
    fmpStatus = `HTTP ${res.status}`;

    if (res.status === 200) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        rawEvents = data.map((item: any) => ({
          eventTime: new Date(item.date),
          country: item.country || 'GLOBAL',
          currency: item.currency || 'USD',
          eventName: item.event || 'Sự kiện kinh tế',
          impact: (item.impact || 'LOW').toUpperCase(),
          actual: item.actual !== undefined && item.actual !== null ? String(item.actual) : null,
          forecast: item.estimate !== undefined && item.estimate !== null ? String(item.estimate) : null,
          previous: item.previous !== undefined && item.previous !== null ? String(item.previous) : null,
        }));
        provider = 'Financial Modeling Prep (FMP) Live Real-Time Feed';
      }
    } else {
      console.warn(`[Calendar Sync] FMP trả về status ${res.status}. Kích hoạt Global Live Stream dự phòng.`);
    }
  } catch (err: any) {
    console.error('[Calendar Sync] Lỗi kết nối FMP:', err.message);
  }

  // 2. Nếu FMP gói Free/Starter bị giới hạn (402 Restricted), tự động kích hoạt Global Live Feed (ForexFactory JSON)
  if (rawEvents.length === 0) {
    try {
      console.log('[Calendar Sync] Đang đồng bộ từ Global Real-Time Feed...');
      const ffRes = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
      if (ffRes.status === 200) {
        const ffData = await ffRes.json();
        if (Array.isArray(ffData) && ffData.length > 0) {
          rawEvents = ffData.map((item: any) => {
            let impact = 'LOW';
            if (item.impact === 'High') impact = 'HIGH';
            else if (item.impact === 'Medium') impact = 'MEDIUM';

            return {
              eventTime: new Date(item.date),
              country: item.country,
              currency: item.country,
              eventName: item.title,
              impact,
              actual: item.actual || null,
              forecast: item.forecast || null,
              previous: item.previous || null,
            };
          });
          provider = 'Global Macro Real-Time Feed (ForexFactory & FMP Multi-Source)';
        }
      }
    } catch (ffErr: any) {
      console.error('[Calendar Sync] Lỗi tải Global Feed:', ffErr.message);
    }
  }

  // 3. Đồng thời lấy thêm các chỉ số vĩ mô thời gian thực từ FMP (CPI, GDP, Unemployment, Treasury Rates)
  try {
    const indicators: MacroIndicator[] = [];
    
    // US CPI
    const cpiRes = await fetch(`https://financialmodelingprep.com/stable/economic-indicators?name=CPI&apikey=${fmpKey}`);
    if (cpiRes.status === 200) {
      const cpiData = await cpiRes.json();
      if (Array.isArray(cpiData) && cpiData.length > 0) {
        indicators.push({
          name: 'CPI',
          label: 'Chỉ số CPI Mỹ',
          value: cpiData[0].value,
          date: cpiData[0].date,
        });
      }
    }

    // US GDP
    const gdpRes = await fetch(`https://financialmodelingprep.com/stable/economic-indicators?name=GDP&apikey=${fmpKey}`);
    if (gdpRes.status === 200) {
      const gdpData = await gdpRes.json();
      if (Array.isArray(gdpData) && gdpData.length > 0) {
        indicators.push({
          name: 'GDP',
          label: 'GDP Mỹ (Tỷ USD)',
          value: '$' + Math.round(gdpData[0].value / 1000) + 'K',
          date: gdpData[0].date,
        });
      }
    }

    // US Unemployment Rate
    const unempRes = await fetch(`https://financialmodelingprep.com/stable/economic-indicators?name=unemploymentRate&apikey=${fmpKey}`);
    if (unempRes.status === 200) {
      const unempData = await unempRes.json();
      if (Array.isArray(unempData) && unempData.length > 0) {
        indicators.push({
          name: 'UNEMP',
          label: 'Tỷ lệ thất nghiệp Mỹ',
          value: unempData[0].value + '%',
          date: unempData[0].date,
        });
      }
    }

    // US 10Y Treasury Rate
    const trRes = await fetch(`https://financialmodelingprep.com/stable/treasury-rates?apikey=${fmpKey}`);
    if (trRes.status === 200) {
      const trData = await trRes.json();
      if (Array.isArray(trData) && trData.length > 0) {
        indicators.push({
          name: 'US10Y',
          label: 'Lợi suất Trái phiếu 10 Năm',
          value: (trData[0].year10 || trData[0].month3) + '%',
          date: trData[0].date,
        });
      }
    }

    if (indicators.length > 0) {
      cachedMacroIndicators = indicators;
    }
  } catch (macroErr: any) {
    console.warn('[Calendar Sync] Lỗi tải FMP Macro Indicators:', macroErr.message);
  }

  // 4. Lưu / Cập nhật vào Database (Upsert)
  let savedCount = 0;
  if (rawEvents.length > 0) {
    for (const evt of rawEvents) {
      // Tìm xem sự kiện trùng tên và giờ đã có chưa
      const existing = await prisma.economicEvent.findFirst({
        where: {
          eventName: evt.eventName,
          currency: evt.currency,
          eventTime: evt.eventTime,
        }
      });

      if (existing) {
        await prisma.economicEvent.update({
          where: { id: existing.id },
          data: {
            actual: evt.actual,
            forecast: evt.forecast,
            previous: evt.previous,
            impact: evt.impact,
          }
        });
      } else {
        await prisma.economicEvent.create({
          data: {
            eventTime: evt.eventTime,
            country: evt.country,
            currency: evt.currency,
            eventName: evt.eventName,
            impact: evt.impact,
            actual: evt.actual,
            forecast: evt.forecast,
            previous: evt.previous,
          }
        });
      }
      savedCount++;
    }
  }

  const nowIso = new Date().toISOString();
  lastSyncInfo = {
    provider,
    syncedAt: nowIso,
    count: savedCount,
  };

  console.log(`[Calendar Sync] Thành công: đã cập nhật ${savedCount} sự kiện từ [${provider}]`);

  return {
    success: true,
    count: savedCount,
    provider,
    syncedAt: nowIso,
    fmpStatus,
    macroIndicators: cachedMacroIndicators,
  };
}

export function getCachedMacroIndicators(): MacroIndicator[] {
  return cachedMacroIndicators;
}

export function getLastSyncInfo() {
  return lastSyncInfo;
}
