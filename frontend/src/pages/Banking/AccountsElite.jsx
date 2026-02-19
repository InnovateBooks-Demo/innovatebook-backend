import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Plus,
  Building2,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BankingAccountsElite = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/finance/banking/accounts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAccounts(response.data.accounts || []);
    } catch (error) {
      toast.error("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.balance || 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading accounts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#022E75] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              Bank Accounts
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              Manage your bank accounts and balances
            </p>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#033F99] to-[#022E75] text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
            <Plus className="h-6 w-6" />
            <span className="text-lg">Add Account</span>
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#033F99]/50 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#033F99]/10 to-transparent rounded-full -mr-32 -mt-32"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-2">
              Total Bank Balance
            </p>
            <p className="text-5xl font-black text-[#033F99]">
              ₹{(totalBalance / 10000000).toFixed(2)}Cr
            </p>
            <p className="text-sm text-blue-700 mt-2">Across all accounts</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-[#033F99] to-[#022E75] rounded-3xl shadow-2xl">
            <Building2 className="h-16 w-16 text-white" />
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-[#033F99]/50">
            <AlertCircle className="h-16 w-16 text-[#033F99]/30 mx-auto mb-4" />
            <p className="text-[#033F99] text-lg">No bank accounts found</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl hover:shadow-2xl hover:border-[#033F99] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-[#033F99] to-[#022E75] rounded-2xl shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${account.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                    }`}
                >
                  {account.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#033F99] mb-2">
                {account.bank_name}
              </h3>
              <p className="text-sm text-[#033F99]/70 mb-4">
                {account.account_number}
              </p>
              <div className="pt-4 border-t border-[#033F99]/20">
                <p className="text-xs text-[#033F99]/70 mb-1">
                  Current Balance
                </p>
                <p className="text-2xl font-black text-[#033F99]">
                  ₹{(account.balance / 100000).toFixed(2)}L
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BankingAccountsElite;
