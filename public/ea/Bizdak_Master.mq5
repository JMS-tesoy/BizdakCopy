#property copyright "Bizdak Copy Trading"
#property link      "https://v0-finbro-dashboard-inky.vercel.app"
#property version   "1.00"
#property strict

//--- Input parameters
input string   ApiUrl        = "https://v0-finbro-dashboard-inky.vercel.app/api/v1";  // API Base URL
input string   AdminSecret   = "oTv6sd7m9Htz2RO0LkhNPFCJM8pgxIfi";                    // Admin Secret Key
input string   MasterPassword = "Tesoy_40";                                            // Master Password (backup)
input int      PollInterval  = 1000;                                                   // Check interval (ms)
input bool     EnableLogging = true;                                                   // Enable logging

//--- Global variables
int      g_lastOrderCount = 0;
ulong    g_knownTickets[];
double   g_knownSL[];
double   g_knownTP[];
double   g_knownLots[];
datetime g_lastCheck = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   if(AdminSecret == "")
   {
      Alert("Bizdak Master: Admin Secret is required!");
      return INIT_PARAMETERS_INCORRECT;
   }
   
   //--- Initialize known positions
   SyncKnownPositions();
   
   //--- Set timer for polling
   EventSetMillisecondTimer(PollInterval);
   
   Log("Bizdak Master EA initialized successfully");
   Log("API URL: " + ApiUrl);
   Log("Admin Secret: " + StringSubstr(AdminSecret, 0, 8) + "...");
   Log("Monitoring " + IntegerToString(ArraySize(g_knownTickets)) + " open positions");
   
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Log("Bizdak Master EA stopped");
}

//+------------------------------------------------------------------+
//| Timer function - Main monitoring loop                              |
//+------------------------------------------------------------------+
void OnTimer()
{
   CheckForChanges();
}

//+------------------------------------------------------------------+
//| Check for new, modified, or closed trades                          |
//+------------------------------------------------------------------+
void CheckForChanges()
{
   int totalPositions = PositionsTotal();
   
   //--- Check for new positions and modifications
   for(int i = 0; i < totalPositions; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      
      if(!PositionSelectByTicket(ticket)) continue;
      
      string symbol = PositionGetString(POSITION_SYMBOL);
      double lots   = PositionGetDouble(POSITION_VOLUME);
      double price  = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl     = PositionGetDouble(POSITION_SL);
      double tp     = PositionGetDouble(POSITION_TP);
      long   type   = PositionGetInteger(POSITION_TYPE);
      string action = (type == POSITION_TYPE_BUY) ? "BUY" : "SELL";
      
      int idx = FindTicketIndex(ticket);
      
      if(idx == -1)
      {
         //--- New position detected
         AddKnownPosition(ticket, sl, tp, lots);
         SendSignal("OPEN", ticket, symbol, action, lots, price, sl, tp);
         Log("NEW TRADE: " + action + " " + symbol + " " + DoubleToString(lots, 2) + " lots @ " + DoubleToString(price, 5));
      }
      else
      {
         //--- Check for modifications
         if(g_knownSL[idx] != sl || g_knownTP[idx] != tp || g_knownLots[idx] != lots)
         {
            g_knownSL[idx] = sl;
            g_knownTP[idx] = tp;
            g_knownLots[idx] = lots;
            SendSignal("MODIFY", ticket, symbol, action, lots, price, sl, tp);
            Log("MODIFIED: " + symbol + " Ticket #" + IntegerToString(ticket) + " SL:" + DoubleToString(sl, 5) + " TP:" + DoubleToString(tp, 5));
         }
      }
   }
   
   //--- Check for closed positions
   CheckForClosedPositions();
}

//+------------------------------------------------------------------+
//| Check for positions that have been closed                          |
//+------------------------------------------------------------------+
void CheckForClosedPositions()
{
   for(int i = ArraySize(g_knownTickets) - 1; i >= 0; i--)
   {
      ulong ticket = g_knownTickets[i];
      
      if(!PositionSelectByTicket(ticket))
      {
         //--- Position no longer exists - it was closed
         //--- Get details from history
         string symbol = "";
         string action = "";
         double lots = 0;
         double closePrice = 0;
         
         if(GetClosedPositionDetails(ticket, symbol, action, lots, closePrice))
         {
            SendSignal("CLOSE", ticket, symbol, action, lots, closePrice, 0, 0);
            Log("CLOSED: " + symbol + " Ticket #" + IntegerToString(ticket) + " @ " + DoubleToString(closePrice, 5));
         }
         else
         {
            //--- Fallback if we can't get history details
            SendCloseSignal(ticket);
            Log("CLOSED: Ticket #" + IntegerToString(ticket));
         }
         
         RemoveKnownPosition(i);
      }
   }
}

//+------------------------------------------------------------------+
//| Get closed position details from history                           |
//+------------------------------------------------------------------+
bool GetClosedPositionDetails(ulong ticket, string &symbol, string &action, double &lots, double &closePrice)
{
   //--- Select history for today
   datetime fromDate = TimeCurrent() - 86400; // Last 24 hours
   datetime toDate = TimeCurrent();
   
   if(!HistorySelect(fromDate, toDate))
      return false;
   
   int totalDeals = HistoryDealsTotal();
   
   for(int i = totalDeals - 1; i >= 0; i--)
   {
      ulong dealTicket = HistoryDealGetTicket(i);
      if(dealTicket == 0) continue;
      
      ulong positionId = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
      
      if(positionId == ticket)
      {
         long dealType = HistoryDealGetInteger(dealTicket, DEAL_TYPE);
         long dealEntry = HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
         
         if(dealEntry == DEAL_ENTRY_OUT || dealEntry == DEAL_ENTRY_OUT_BY)
         {
            symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
            lots = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
            closePrice = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
            action = (dealType == DEAL_TYPE_SELL) ? "BUY" : "SELL"; // Opposite of close deal
            return true;
         }
      }
   }
   
   return false;
}

//+------------------------------------------------------------------+
//| Send signal to API                                                 |
//+------------------------------------------------------------------+
bool SendSignal(string type, ulong ticket, string symbol, string action, 
                double lots, double price, double sl, double tp)
{
   string url = ApiUrl + "/admin/trade";
   
   //--- Build JSON payload
   string json = "{";
   json += "\"type\":\"" + type + "\",";
   json += "\"ticket\":" + IntegerToString(ticket) + ",";
   json += "\"symbol\":\"" + symbol + "\",";
   json += "\"action\":\"" + action + "\",";
   json += "\"lots\":" + DoubleToString(lots, 2) + ",";
   json += "\"price\":" + DoubleToString(price, 5) + ",";
   json += "\"sl\":" + DoubleToString(sl, 5) + ",";
   json += "\"tp\":" + DoubleToString(tp, 5);
   json += "}";
   
   return SendHttpRequest(url, json);
}

//+------------------------------------------------------------------+
//| Send close signal (fallback when no history details available)     |
//+------------------------------------------------------------------+
bool SendCloseSignal(ulong ticket)
{
   string url = ApiUrl + "/admin/trade";
   
   string json = "{";
   json += "\"type\":\"CLOSE\",";
   json += "\"ticket\":" + IntegerToString(ticket) + ",";
   json += "\"symbol\":\"\",";
   json += "\"action\":\"\",";
   json += "\"lots\":0,";
   json += "\"price\":0,";
   json += "\"sl\":0,";
   json += "\"tp\":0";
   json += "}";
   
   return SendHttpRequest(url, json);
}

//+------------------------------------------------------------------+
//| Send HTTP POST request                                             |
//+------------------------------------------------------------------+
bool SendHttpRequest(string url, string json)
{
   char   postData[];
   char   result[];
   string resultHeaders;
   
   string headers = "Content-Type: application/json\r\n";
   headers += "Authorization: Bearer " + AdminSecret + "\r\n";
   headers += "X-Admin-Secret: " + AdminSecret;
   
   StringToCharArray(json, postData, 0, StringLen(json));
   ArrayResize(postData, StringLen(json));
   
   ResetLastError();
   
   Log("Sending to: " + url);
   Log("Headers: Authorization: Bearer " + StringSubstr(AdminSecret, 0, 8) + "...");
   
   int response = WebRequest(
      "POST",
      url,
      headers,
      5000,
      postData,
      result,
      resultHeaders
   );
   
   if(response == -1)
   {
      int error = GetLastError();
      Log("HTTP Error: " + IntegerToString(error) + " - Make sure WebRequest is enabled for: " + ApiUrl);
      
      if(error == 4014)
      {
         Alert("Enable WebRequest in MT5: Tools > Options > Expert Advisors > Allow WebRequest for: " + ApiUrl);
      }
      return false;
   }
   
   string resultStr = CharArrayToString(result);
   Log("HTTP Response: " + IntegerToString(response) + " - " + resultStr);
   
   if(response != 200 && response != 201)
   {
      Log("API Error: HTTP " + IntegerToString(response));
      return false;
   }
   
   Log("Signal sent successfully!");
   return true;
}

//+------------------------------------------------------------------+
//| Sync known positions on startup                                    |
//+------------------------------------------------------------------+
void SyncKnownPositions()
{
   ArrayResize(g_knownTickets, 0);
   ArrayResize(g_knownSL, 0);
   ArrayResize(g_knownTP, 0);
   ArrayResize(g_knownLots, 0);
   
   int total = PositionsTotal();
   
   for(int i = 0; i < total; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      
      if(!PositionSelectByTicket(ticket)) continue;
      
      double sl   = PositionGetDouble(POSITION_SL);
      double tp   = PositionGetDouble(POSITION_TP);
      double lots = PositionGetDouble(POSITION_VOLUME);
      
      AddKnownPosition(ticket, sl, tp, lots);
   }
}

//+------------------------------------------------------------------+
//| Add position to known positions array                              |
//+------------------------------------------------------------------+
void AddKnownPosition(ulong ticket, double sl, double tp, double lots)
{
   int size = ArraySize(g_knownTickets);
   ArrayResize(g_knownTickets, size + 1);
   ArrayResize(g_knownSL, size + 1);
   ArrayResize(g_knownTP, size + 1);
   ArrayResize(g_knownLots, size + 1);
   
   g_knownTickets[size] = ticket;
   g_knownSL[size] = sl;
   g_knownTP[size] = tp;
   g_knownLots[size] = lots;
}

//+------------------------------------------------------------------+
//| Remove position from known positions array                         |
//+------------------------------------------------------------------+
void RemoveKnownPosition(int index)
{
   int size = ArraySize(g_knownTickets);
   
   for(int i = index; i < size - 1; i++)
   {
      g_knownTickets[i] = g_knownTickets[i + 1];
      g_knownSL[i] = g_knownSL[i + 1];
      g_knownTP[i] = g_knownTP[i + 1];
      g_knownLots[i] = g_knownLots[i + 1];
   }
   
   ArrayResize(g_knownTickets, size - 1);
   ArrayResize(g_knownSL, size - 1);
   ArrayResize(g_knownTP, size - 1);
   ArrayResize(g_knownLots, size - 1);
}

//+------------------------------------------------------------------+
//| Find ticket in known positions array                               |
//+------------------------------------------------------------------+
int FindTicketIndex(ulong ticket)
{
   for(int i = 0; i < ArraySize(g_knownTickets); i++)
   {
      if(g_knownTickets[i] == ticket)
         return i;
   }
   return -1;
}

//+------------------------------------------------------------------+
//| Logging function                                                   |
//+------------------------------------------------------------------+
void Log(string message)
{
   if(EnableLogging)
   {
      Print("[Bizdak Master] " + message);
   }
}

//+------------------------------------------------------------------+
//| OnTrade - Called when trade events occur (backup detection)        |
//+------------------------------------------------------------------+
void OnTrade()
{
   //--- Immediate check when trade event occurs
   CheckForChanges();
}

//+------------------------------------------------------------------+
//| OnTradeTransaction - Real-time trade event detection               |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest& request,
                        const MqlTradeResult& result)
{
   //--- Handle deal additions (trade executed)
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
   {
      //--- Small delay to let position update
      Sleep(100);
      CheckForChanges();
   }
}
//+------------------------------------------------------------------+
