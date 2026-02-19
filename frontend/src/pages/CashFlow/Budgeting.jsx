import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Plus, Upload } from "lucide-react";

const CashFlowBudgeting = () => {
  const [budgetData, setBudgetData] = useState({
    revenue: 0,
    expenses: 0,
    capex: 0,
    period: "monthly",
  });

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;

  return (
    <div className="p-8" data-testid="cashflow-budgeting-page">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "Inter", color: "#033F99" }}
        >
          Cash Flow Budgeting
        </h1>
        <p className="text-gray-600">
          Plan and allocate expected cash inflows and outflows
        </p>
      </div>

      <div className="space-y-6">
        {/* Budget Setup Wizard */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle style={{ color: "#033F99" }}>Budget Setup</CardTitle>
            <CardDescription>
              Create annual/quarterly/monthly budgets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Fiscal Year Start</Label>
                  <Input type="month" defaultValue="2025-04" />
                </div>
                <div>
                  <Label>Budget Period</Label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div>
                  <Label>Budget Type</Label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="manual">Manual Entry</option>
                    <option value="ai">AI-Assisted (12-month avg)</option>
                    <option value="excel">Excel Upload</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Dimension</Label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="company">Company-wide</option>
                    <option value="department">By Department</option>
                    <option value="project">By Project</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Excel
                  </Button>
                  <Button className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inflows Planning */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="chart-container">
            <CardHeader>
              <CardTitle style={{ color: "#033F99" }}>
                Inflows Planning
              </CardTitle>
              <CardDescription>Expected receipts and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Sales Revenue</p>
                    <p className="text-sm text-gray-600">Monthly recurring</p>
                  </div>
                  <Input type="number" className="w-32" placeholder="0" />
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Collections</p>
                    <p className="text-sm text-gray-600">AR receipts</p>
                  </div>
                  <Input type="number" className="w-32" placeholder="0" />
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inflow Category
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Outflows Planning */}
          <Card className="chart-container">
            <CardHeader>
              <CardTitle style={{ color: "#033F99" }}>
                Outflows Planning
              </CardTitle>
              <CardDescription>Planned expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Payroll</p>
                    <p className="text-sm text-gray-600">Monthly</p>
                  </div>
                  <Input type="number" className="w-32" placeholder="0" />
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Rent & Utilities</p>
                    <p className="text-sm text-gray-600">Monthly</p>
                  </div>
                  <Input type="number" className="w-32" placeholder="0" />
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense Category
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Summary */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle style={{ color: "#033F99" }}>Budget Summary</CardTitle>
            <CardDescription>Overall budget allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total Planned Inflows</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total Planned Outflows</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-4">
                <span className="font-semibold" style={{ color: "#033F99" }}>
                  Net Budget
                </span>
                <span
                  className="text-xl font-semibold"
                  style={{ color: "#033F99" }}
                >
                  {formatCurrency(0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Workflow */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle style={{ color: "#033F99" }}>
              Approval Workflow
            </CardTitle>
            <CardDescription>
              Budget review and approval process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12 text-gray-500">
              <p>Budget approval workflow coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashFlowBudgeting;
