import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bankAPI } from "../utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { toast } from "sonner";
import { Plus, Landmark, CreditCard } from "lucide-react";

const BankingNew = () => {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBank, setNewBank] = useState({
    bank_name: "",
    account_number: "",
    account_type: "Current",
    ifsc: "",
    branch: "",
    opening_balance: 0,
  });

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const response = await bankAPI.getAccounts();
      setBanks(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load bank accounts");
      setLoading(false);
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      await bankAPI.createAccount(newBank);
      toast.success("Bank account added successfully");
      setShowAddDialog(false);
      loadBanks();
      setNewBank({
        bank_name: "",
        account_number: "",
        account_type: "Current",
        ifsc: "",
        branch: "",
        opening_balance: 0,
      });
    } catch (error) {
      toast.error("Failed to add bank account");
    }
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="banking-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "Inter", color: "#033F99" }}
          >
            Banking
          </h1>
          <p className="text-gray-600">Manage bank accounts and transactions</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-bank-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
              <DialogDescription>Enter bank account details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBank} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bank Name *</Label>
                  <Input
                    required
                    value={newBank.bank_name}
                    onChange={(e) =>
                      setNewBank({ ...newBank, bank_name: e.target.value })
                    }
                    placeholder="HDFC Bank"
                  />
                </div>
                <div>
                  <Label>Account Type *</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={newBank.account_type}
                    onChange={(e) =>
                      setNewBank({ ...newBank, account_type: e.target.value })
                    }
                  >
                    <option value="Current">Current</option>
                    <option value="Savings">Savings</option>
                    <option value="Overdraft">Overdraft</option>
                  </select>
                </div>
                <div>
                  <Label>Account Number *</Label>
                  <Input
                    required
                    value={newBank.account_number}
                    onChange={(e) =>
                      setNewBank({ ...newBank, account_number: e.target.value })
                    }
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <Label>IFSC Code *</Label>
                  <Input
                    required
                    value={newBank.ifsc}
                    onChange={(e) =>
                      setNewBank({ ...newBank, ifsc: e.target.value })
                    }
                    placeholder="HDFC0001234"
                  />
                </div>
                <div>
                  <Label>Branch</Label>
                  <Input
                    value={newBank.branch}
                    onChange={(e) =>
                      setNewBank({ ...newBank, branch: e.target.value })
                    }
                    placeholder="Mumbai Main"
                  />
                </div>
                <div>
                  <Label>Opening Balance *</Label>
                  <Input
                    type="number"
                    required
                    value={newBank.opening_balance}
                    onChange={(e) =>
                      setNewBank({
                        ...newBank,
                        opening_balance: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Add Bank Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {banks.length === 0 ? (
        <Card className="chart-container">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Landmark className="h-16 w-16 text-gray-400 mb-4" />
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: "#033F99" }}
            >
              No Bank Accounts
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first bank account to get started
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {banks.map((bank) => (
            <Card
              key={bank.id}
              className="card-hover cursor-pointer"
              onClick={() => navigate(`/banking/${bank.id}`)}
              data-testid={`bank-card-${bank.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "#EEF4FF" }}
                    >
                      {bank.account_type === "Current" ? (
                        <Landmark
                          className="h-6 w-6"
                          style={{ color: "#033F99" }}
                        />
                      ) : (
                        <CreditCard
                          className="h-6 w-6"
                          style={{ color: "#033F99" }}
                        />
                      )}
                    </div>
                    <div>
                      <CardTitle
                        className="text-lg"
                        style={{ color: "#033F99" }}
                      >
                        {bank.bank_name}
                      </CardTitle>
                      <CardDescription>{bank.account_type}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-medium">
                      •••• {bank.account_number.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p
                      className="text-2xl font-semibold"
                      style={{ color: "#033F99" }}
                    >
                      {formatCurrency(bank.current_balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IFSC Code</p>
                    <p className="font-medium">{bank.ifsc}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/banking/${bank.id}`);
                    }}
                  >
                    View Transactions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BankingNew;
