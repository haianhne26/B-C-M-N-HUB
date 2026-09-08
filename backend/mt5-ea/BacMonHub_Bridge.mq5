//+------------------------------------------------------------------+
//|                                           BacMonHub_Bridge.mq5   |
//|                        BẠC MÔN HUB — Cầu Nối Dữ Liệu Giao Dịch   |
//|                                      https://bacmonhub.com       |
//+------------------------------------------------------------------+
#property copyright "BẠC MÔN HUB © 2026"
#property link      "https://haianhne26.github.io/B-C-M-N-HUB/"
#property version   "1.00"
#property strict

// Inputs
input string ServerUrl    = "http://localhost:4000/api/mt5/push"; // URL API Bạc Môn Bridge
input string BridgeToken  = "bmh_mt5_secure_bridge_token_2026";   // Mã bảo mật Bridge Token
input string UserId       = "858c37db-7134-46db-b7cd-e481caafc928"; // ID Người dùng trong app
input int    SyncInterval = 5;                                   // Giây giữa các lần đồng bộ

datetime lastSyncTime = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("BẠC MÔN HUB Bridge EA đã khởi động. Đồng bộ mỗi ", SyncInterval, " giây.");
   EventSetTimer(SyncInterval);
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("BẠC MÔN HUB Bridge EA đã dừng.");
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
   SyncAccountData();
}

//+------------------------------------------------------------------+
//| Gửi dữ liệu tài khoản và lệnh về Backend                         |
//+------------------------------------------------------------------+
void SyncAccountData()
{
   long accountNumber = AccountInfoInteger(ACCOUNT_LOGIN);
   string broker      = AccountInfoString(ACCOUNT_COMPANY);
   string serverName  = AccountInfoString(ACCOUNT_SERVER);
   string currency    = AccountInfoString(ACCOUNT_CURRENCY);
   double balance     = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity      = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin      = AccountInfoDouble(ACCOUNT_MARGIN);
   double freeMargin  = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   double marginLevel = AccountInfoDouble(ACCOUNT_MARGIN_LEVEL);
   double profit      = AccountInfoDouble(ACCOUNT_PROFIT);

   // Thu thập danh sách vị thế lệnh đang mở
   string positionsJson = "[";
   int totalPositions = PositionsTotal();
   for(int i = 0; i < totalPositions; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket > 0)
      {
         string symbol      = PositionGetString(POSITION_SYMBOL);
         long type          = PositionGetInteger(POSITION_TYPE);
         double volume      = PositionGetDouble(POSITION_VOLUME);
         double openPrice   = PositionGetDouble(POSITION_PRICE_OPEN);
         double currentPrice= PositionGetDouble(POSITION_PRICE_CURRENT);
         double sl          = PositionGetDouble(POSITION_SL);
         double tp          = PositionGetDouble(POSITION_TP);
         double posProfit   = PositionGetDouble(POSITION_PROFIT);
         datetime openTime  = (datetime)PositionGetInteger(POSITION_TIME);

         string typeStr = (type == POSITION_TYPE_BUY) ? "BUY" : "SELL";

         if(i > 0) positionsJson += ",";
         positionsJson += StringFormat("{\"ticket\":%I64d,\"symbol\":\"%s\",\"type\":\"%s\",\"volume\":%.2f,\"openPrice\":%.5f,\"currentPrice\":%.5f,\"sl\":%.5f,\"tp\":%.5f,\"profit\":%.2f}",
                                       ticket, symbol, typeStr, volume, openPrice, currentPrice, sl, tp, posProfit);
      }
   }
   positionsJson += "]";

   // Đóng gói JSON Payload
   string payload = StringFormat("{\"bridgeToken\":\"%s\",\"accountNumber\":%I64d,\"userId\":\"%s\",\"broker\":\"%s\",\"serverName\":\"%s\",\"currency\":\"%s\",\"balance\":%.2f,\"equity\":%.2f,\"margin\":%.2f,\"freeMargin\":%.2f,\"marginLevel\":%.2f,\"profit\":%.2f,\"positions\":%s}",
                                 BridgeToken, accountNumber, UserId, broker, serverName, currency, balance, equity, margin, freeMargin, marginLevel, profit, positionsJson);

   char postData[];
   char resultData[];
   string resultHeaders;
   StringToCharArray(payload, postData, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(postData, ArraySize(postData) - 1);

   string headers = "Content-Type: application/json\r\n";
   int timeout = 3000;

   int res = WebRequest("POST", ServerUrl, headers, timeout, postData, resultData, resultHeaders);
   if(res == 200)
   {
      // Đồng bộ thành công
   }
   else
   {
      Print("Bạc Môn Bridge Error. Mã lỗi: ", res, ". Hãy chắc chắn đã bật WebRequest trong MT5 Options.");
   }
}
