#property copyright "Copyright 2024, Bizdak Copy Trading"
#property link      "https://v0-finbro-dashboard-inky.vercel.app"
#property version   "1.00"
#property strict

//--- Input parameters
input string   ApiKey = "";                    // Your API Key
input string   ApiUrl = "https://v0-finbro-dashboard-inky.vercel.app/api/v1"; // API Server URL
input double   LotMultiplier = 1.0;            // Lot Size Multiplier
input double   MaxLotSize = 1.0;               // Maximum Lot Size
input int      Slippage = 30;                  // Slippage (points)
input int      PollInterval = 5;               // Poll Interval (seconds)
input int      MagicNumberBase = 100000;       // Magic Number Base

//--- Global variables
datetime lastSignalTime = 0;
string lastProcessedSignalId = "";
int connectionRetries = 0;
const int MAX_RETRIES = 3;

//+------------------------------------------------------------------+
//| Expert initialization function                                    |
//+------------------------------------------------------------------+
int OnInit()
{
   if(ApiKey == "")
   {
      Print("ERROR: API Key is required. Get your key from the dashboard.");
      return(INIT_PARAMETERS_INCORRECT);
   }
   
   Print("Bizdak Copier initialized");
   Print("API URL: ", ApiUrl);
   Print("Lot Multiplier: ", LotMultiplier);
   Print("Poll Interval: ", PollInterval, " seconds");
   
   // Test connection
   if(!TestConnection())
   {
      Print("WARNING: Initial connection failed. Will retry...");
   }
   
   // Sync with master account on startup
   SyncOpenTrades();
   
   // Set timer for polling
   EventSetTimer(PollInterval);
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                  |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("Bizdak Copier stopped. Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Timer function - polls for new signals                           |
//+------------------------------------------------------------------+
void OnTimer()
{
   PollSignals();
}

//+------------------------------------------------------------------+
//| Test API connection                                               |
//+------------------------------------------------------------------+
bool TestConnection()
{
   string url = ApiUrl + "/heartbeat";
   string headers = "X-API-Key: " + ApiKey + "\r\nContent-Type: application/json\r\n";
   char postData[];
   char result[];
   string resultHeaders;
   
   int timeout = 5000;
   int res = WebRequest("GET", url, headers, timeout, postData, result, resultHeaders);
   
   if(res == -1)
   {
      int error = GetLastError();
      Print("Connection error: ", error);
      Print("Make sure to add ", ApiUrl, " to allowed URLs in Tools > Options > Expert Advisors");
      return false;
   }
   
   string response = CharArrayToString(result);
   
   if(StringFind(response, "\"success\":true") >= 0)
   {
      Print("Connected to Bizdak Copy API successfully");
      connectionRetries = 0;
      return true;
   }
   
   Print("Connection failed: ", response);
   return false;
}

//+------------------------------------------------------------------+
//| Sync open trades from master on startup                          |
//+------------------------------------------------------------------+
void SyncOpenTrades()
{
   string url = ApiUrl + "/trades";
   string headers = "X-API-Key: " + ApiKey + "\r\nContent-Type: application/json\r\n";
   char postData[];
   char result[];
   string resultHeaders;
   
   int timeout = 10000;
   int res = WebRequest("GET", url, headers, timeout, postData, result, resultHeaders);
   
   if(res == -1)
   {
      Print("Failed to sync trades: ", GetLastError());
      return;
   }
   
   string response = CharArrayToString(result);
   
   if(StringFind(response, "\"success\":true") < 0)
   {
      Print("Sync failed: ", response);
      return;
   }
   
   // Parse trades and open missing positions
   int tradesStart = StringFind(response, "\"trades\":[");
   if(tradesStart < 0) return;
   
   int tradesEnd = StringFind(response, "]", tradesStart);
   string tradesJson = StringSubstr(response, tradesStart, tradesEnd - tradesStart + 1);
   
   Print("Syncing open trades...");
   ParseAndProcessTrades(tradesJson);
}

//+------------------------------------------------------------------+
//| Poll for new signals                                              |
//+------------------------------------------------------------------+
void PollSignals()
{
   string sinceParam = "";
   if(lastSignalTime > 0)
   {
      sinceParam = "?since=" + TimeToString(lastSignalTime, TIME_DATE|TIME_SECONDS);
      StringReplace(sinceParam, ".", "-");
      StringReplace(sinceParam, " ", "T");
      sinceParam += "Z";
   }
   
   string url = ApiUrl + "/signals" + sinceParam;
   string headers = "X-API-Key: " + ApiKey + "\r\nContent-Type: application/json\r\n";
   char postData[];
   char result[];
   string resultHeaders;
   
   int timeout = 5000;
   int res = WebRequest("GET", url, headers, timeout, postData, result, resultHeaders);
   
   if(res == -1)
   {
      connectionRetries++;
      if(connectionRetries >= MAX_RETRIES)
      {
         Print("Lost connection to API. Retrying...");
         connectionRetries = 0;
      }
      return;
   }
   
   connectionRetries = 0;
   string response = CharArrayToString(result);
   
   if(StringFind(response, "\"success\":true") < 0)
   {
      return;
   }
   
   // Check if there are signals
   if(StringFind(response, "\"count\":0") >= 0)
   {
      return; // No new signals
   }
   
   ProcessSignals(response);
}

//+------------------------------------------------------------------+
//| Process received signals                                          |
//+------------------------------------------------------------------+
void ProcessSignals(string response)
{
   int signalsStart = StringFind(response, "\"signals\":[");
   if(signalsStart < 0) return;
   
   // Find each signal object
   int searchStart = signalsStart;
   
   while(true)
   {
      int sigStart = StringFind(response, "{\"id\":", searchStart);
      if(sigStart < 0) break;
      
      int sigEnd = StringFind(response, "}", sigStart);
      if(sigEnd < 0) break;
      
      string signalJson = StringSubstr(response, sigStart, sigEnd - sigStart + 1);
      ProcessSingleSignal(signalJson);
      
      searchStart = sigEnd + 1;
   }
   
   lastSignalTime = TimeCurrent();
}

//+------------------------------------------------------------------+
//| Process a single signal                                           |
//+------------------------------------------------------------------+
void ProcessSingleSignal(string signalJson)
{
   // Extract signal ID
   string signalId = ExtractJsonString(signalJson, "id");
   if(signalId == lastProcessedSignalId)
   {
      return; // Already processed
   }
   
   // Extract signal details
   string action = ExtractJsonString(signalJson, "action");
   string symbol = ExtractJsonString(signalJson, "symbol");
   string type = ExtractJsonString(signalJson, "type");
   double lotSize = ExtractJsonDouble(signalJson, "lotSize");
   double entryPrice = ExtractJsonDouble(signalJson, "entryPrice");
   double stopLoss = ExtractJsonDouble(signalJson, "stopLoss");
   double takeProfit = ExtractJsonDouble(signalJson, "takeProfit");
   int magicNumber = (int)ExtractJsonDouble(signalJson, "magicNumber");
   string tradeId = ExtractJsonString(signalJson, "tradeId");
   
   Print("Processing signal: ", action, " ", symbol, " ", type);
   
   // Calculate adjusted lot size
   double adjustedLot = NormalizeDouble(lotSize * LotMultiplier, 2);
   if(adjustedLot > MaxLotSize) adjustedLot = MaxLotSize;
   if(adjustedLot < 0.01) adjustedLot = 0.01;
   
   // Execute based on action
   if(action == "OPEN")
   {
      OpenTrade(symbol, type, adjustedLot, stopLoss, takeProfit, magicNumber);
   }
   else if(action == "CLOSE")
   {
      CloseTrade(symbol, magicNumber);
   }
   else if(action == "MODIFY")
   {
      ModifyTrade(symbol, magicNumber, stopLoss, takeProfit);
   }
   
   lastProcessedSignalId = signalId;
}

//+------------------------------------------------------------------+
//| Open a new trade                                                  |
//+------------------------------------------------------------------+
void OpenTrade(string symbol, string type, double lots, double sl, double tp, int magic)
{
   MqlTradeRequest request = {};
   MqlTradeResult result = {};
   
   request.action = TRADE_ACTION_DEAL;
   request.symbol = symbol;
   request.volume = lots;
   request.deviation = Slippage;
   request.magic = MagicNumberBase + magic;
   request.comment = "Bizdak Copy";
   
   if(type == "BUY")
   {
      request.type = ORDER_TYPE_BUY;
      request.price = SymbolInfoDouble(symbol, SYMBOL_ASK);
   }
   else
   {
      request.type = ORDER_TYPE_SELL;
      request.price = SymbolInfoDouble(symbol, SYMBOL_BID);
   }
   
   if(sl > 0) request.sl = sl;
   if(tp > 0) request.tp = tp;
   
   if(!OrderSend(request, result))
   {
      Print("OrderSend failed: ", GetLastError(), " - ", result.comment);
      return;
   }
   
   if(result.retcode == TRADE_RETCODE_DONE)
   {
      Print("Trade opened: ", symbol, " ", type, " ", lots, " lots. Ticket: ", result.order);
   }
   else
   {
      Print("Trade failed: ", result.retcode, " - ", result.comment);
   }
}

//+------------------------------------------------------------------+
//| Close a trade by magic number                                     |
//+------------------------------------------------------------------+
void CloseTrade(string symbol, int magic)
{
   int targetMagic = MagicNumberBase + magic;
   
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket <= 0) continue;
      
      if(PositionGetInteger(POSITION_MAGIC) == targetMagic && 
         PositionGetString(POSITION_SYMBOL) == symbol)
      {
         MqlTradeRequest request = {};
         MqlTradeResult result = {};
         
         request.action = TRADE_ACTION_DEAL;
         request.position = ticket;
         request.symbol = symbol;
         request.volume = PositionGetDouble(POSITION_VOLUME);
         request.deviation = Slippage;
         
         if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
         {
            request.type = ORDER_TYPE_SELL;
            request.price = SymbolInfoDouble(symbol, SYMBOL_BID);
         }
         else
         {
            request.type = ORDER_TYPE_BUY;
            request.price = SymbolInfoDouble(symbol, SYMBOL_ASK);
         }
         
         if(OrderSend(request, result))
         {
            Print("Trade closed: ", symbol, " Ticket: ", ticket);
         }
         else
         {
            Print("Close failed: ", GetLastError());
         }
         
         break;
      }
   }
}

//+------------------------------------------------------------------+
//| Modify trade SL/TP                                                |
//+------------------------------------------------------------------+
void ModifyTrade(string symbol, int magic, double sl, double tp)
{
   int targetMagic = MagicNumberBase + magic;
   
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket <= 0) continue;
      
      if(PositionGetInteger(POSITION_MAGIC) == targetMagic && 
         PositionGetString(POSITION_SYMBOL) == symbol)
      {
         MqlTradeRequest request = {};
         MqlTradeResult result = {};
         
         request.action = TRADE_ACTION_SLTP;
         request.position = ticket;
         request.symbol = symbol;
         request.sl = sl > 0 ? sl : PositionGetDouble(POSITION_SL);
         request.tp = tp > 0 ? tp : PositionGetDouble(POSITION_TP);
         
         if(OrderSend(request, result))
         {
            Print("Trade modified: ", symbol, " SL: ", sl, " TP: ", tp);
         }
         else
         {
            Print("Modify failed: ", GetLastError());
         }
         
         break;
      }
   }
}

//+------------------------------------------------------------------+
//| Parse and process trades JSON                                     |
//+------------------------------------------------------------------+
void ParseAndProcessTrades(string tradesJson)
{
   int searchStart = 0;
   
   while(true)
   {
      int tradeStart = StringFind(tradesJson, "{\"id\":", searchStart);
      if(tradeStart < 0) break;
      
      int tradeEnd = StringFind(tradesJson, "}", tradeStart);
      if(tradeEnd < 0) break;
      
      string tradeJson = StringSubstr(tradesJson, tradeStart, tradeEnd - tradeStart + 1);
      
      string symbol = ExtractJsonString(tradeJson, "symbol");
      string type = ExtractJsonString(tradeJson, "type");
      double lotSize = ExtractJsonDouble(tradeJson, "lotSize");
      double stopLoss = ExtractJsonDouble(tradeJson, "stopLoss");
      double takeProfit = ExtractJsonDouble(tradeJson, "takeProfit");
      int magicNumber = (int)ExtractJsonDouble(tradeJson, "magicNumber");
      string status = ExtractJsonString(tradeJson, "status");
      
      if(status == "OPEN")
      {
         // Check if we already have this trade
         if(!HasTradeWithMagic(symbol, MagicNumberBase + magicNumber))
         {
            double adjustedLot = NormalizeDouble(lotSize * LotMultiplier, 2);
            if(adjustedLot > MaxLotSize) adjustedLot = MaxLotSize;
            if(adjustedLot < 0.01) adjustedLot = 0.01;
            
            Print("Syncing trade: ", symbol, " ", type);
            OpenTrade(symbol, type, adjustedLot, stopLoss, takeProfit, magicNumber);
         }
      }
      
      searchStart = tradeEnd + 1;
   }
}

//+------------------------------------------------------------------+
//| Check if we have a trade with specific magic number               |
//+------------------------------------------------------------------+
bool HasTradeWithMagic(string symbol, int magic)
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket <= 0) continue;
      
      if(PositionGetInteger(POSITION_MAGIC) == magic && 
         PositionGetString(POSITION_SYMBOL) == symbol)
      {
         return true;
      }
   }
   return false;
}

//+------------------------------------------------------------------+
//| Extract string value from JSON                                    |
//+------------------------------------------------------------------+
string ExtractJsonString(string json, string key)
{
   string searchKey = "\"" + key + "\":\"";
   int start = StringFind(json, searchKey);
   if(start < 0) return "";
   
   start += StringLen(searchKey);
   int end = StringFind(json, "\"", start);
   if(end < 0) return "";
   
   return StringSubstr(json, start, end - start);
}

//+------------------------------------------------------------------+
//| Extract double value from JSON                                    |
//+------------------------------------------------------------------+
double ExtractJsonDouble(string json, string key)
{
   string searchKey = "\"" + key + "\":";
   int start = StringFind(json, searchKey);
   if(start < 0) return 0;
   
   start += StringLen(searchKey);
   
   // Skip whitespace
   while(start < StringLen(json) && (StringGetCharacter(json, start) == ' ' || StringGetCharacter(json, start) == '"'))
      start++;
   
   // Find end of number
   int end = start;
   while(end < StringLen(json))
   {
      ushort c = StringGetCharacter(json, end);
      if((c < '0' || c > '9') && c != '.' && c != '-')
         break;
      end++;
   }
   
   string numStr = StringSubstr(json, start, end - start);
   return StringToDouble(numStr);
}

//+------------------------------------------------------------------+
//| OnTick function                                                   |
//+------------------------------------------------------------------+
void OnTick()
{
   // Main logic runs on timer, but you can add tick-based logic here
}
//+------------------------------------------------------------------+
