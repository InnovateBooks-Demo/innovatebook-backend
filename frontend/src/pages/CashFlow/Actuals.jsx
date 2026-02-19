import React, { useState, useEffect } from "react";
import { cashFlowAPI, bankAPI } from "../../utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

const CashFlowActuals = () => {
  const [summary, setSummary] = useState(null);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, banksRes] = await Promise.all([
        cashFlowAPI.getSummary(),
        bankAPI.getAccounts(),
      ]);
      setSummary(summaryRes.data);
      setBanks(banksRes.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load actuals data");
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    `₹${amount?.toLocaleString("en-IN", { maximumFractionDigits: 0 }) || 0}`;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const totalCash = banks.reduce((sum, b) => sum + (b.current_balance || 0), 0);
  const netCashFlow =
    (summary?.actual_inflow || 0) - (summary?.actual_outflow || 0);
  const burnRate = summary?.actual_outflow || 0;

  return (
    <div className="p-8" data-testid="cashflow-actuals-page">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "Inter", color: "#033F99" }}
        >
          Cash Flow Actuals
        </h1>
        <p className="text-gray-600">
          Real-time cash movements and actual transactions
        </p>
      </div>

      <div className="space-y-6">
        {/* Cash Position Dashboard */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="stat-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">
                Total Cash Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p
                  className="text-2xl font-semibold"
                  style={{ color: "#033F99" }}
                >
                  {formatCurrency(totalCash)}
                </p>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">
                Net Cash Flow (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p
                  className="text-2xl font-semibold"
                  style={{ color: netCashFlow >= 0 ? "#10b981" : "#ef4444" }}
                >
                  {formatCurrency(netCashFlow)}
                </p>
                {netCashFlow >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">
                Cash Burn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold text-orange-600">
                  {formatCurrency(burnRate)}/mo
                </p>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">
                Cash Runway
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p
                  className="text-2xl font-semibold"
                  style={{ color: "#033F99" }}
                >
                  {Math.round(summary?.runway_days || 0)} days
                </p>
                <Activity className="h-8 w-8" style={{ color: "#033F99" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bank Balances */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle style={{ color: "#033F99" }}>
              Bank Balances by Account
            </CardTitle>
            <CardDescription>
              Current cash position across all bank accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {banks.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{bank.bank_name}</p>
                    <p className="text-sm text-gray-600">
                      {bank.account_type} - •••• {bank.account_number.slice(-4)}
                    </p>
                  </div>
                  <p
                    className="text-xl font-semibold"
                    style={{ color: "#033F99" }}
                  >
                    {formatCurrency(bank.current_balance)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Statement */}
        <Card className="chart-container">
          <Tabs defaultValue="operating">
            <CardHeader>
              <CardTitle style={{ color: "#033F99" }}>
                Cash Flow Statement
              </CardTitle>
              <TabsList>
                <TabsTrigger value="operating">
                  Operating Activities
                </TabsTrigger>
                <TabsTrigger value="investing">
                  Investing Activities
                </TabsTrigger>
                <TabsTrigger value="financing">
                  Financing Activities
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="operating">
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Cash from Collections</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(summary?.actual_inflow)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Cash for Payments</span>
                    <span className="font-semibold text-red-600">
                      ({formatCurrency(summary?.actual_outflow)})
                    </span>
                  </div>
                  <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-4">
                    <span
                      className="font-semibold"
                      style={{ color: "#033F99" }}
                    >
                      Net Operating Cash Flow
                    </span>
                    <span
                      className="text-xl font-semibold"
                      style={{
                        color: netCashFlow >= 0 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {formatCurrency(netCashFlow)}
                    </span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="investing">
                <p className="text-gray-500 text-center py-8">
                  No investing activities recorded
                </p>
              </TabsContent>
              <TabsContent value="financing">
                <p className="text-gray-500 text-center py-8">
                  No financing activities recorded
                </p>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Cash Movement Register */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle style={{ color: "#033F99" }}>
              Cash Movement Register
            </CardTitle>
            <CardDescription>
              Transaction-level inflows and outflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              View detailed cash movements in Banking module
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashFlowActuals;
