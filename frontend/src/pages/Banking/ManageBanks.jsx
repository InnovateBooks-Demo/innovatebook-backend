import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bankAPI } from "../../utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

const ManageBanks = () => {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [editBank, setEditBank] = useState(null);

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

  const handleEdit = (bank) => {
    setSelectedBank(bank);
    setEditBank({ ...bank });
    setShowEditDialog(true);
  };

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    try {
      await bankAPI.updateAccount(selectedBank.id, editBank);
      toast.success("Bank account updated successfully");
      setShowEditDialog(false);
      loadBanks();
    } catch (error) {
      toast.error("Failed to update bank account");
    }
  };

  const handleDelete = (bank) => {
    setSelectedBank(bank);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await bankAPI.deleteAccount(selectedBank.id);
      toast.success("Bank account deleted successfully");
      setShowDeleteDialog(false);
      loadBanks();
    } catch (error) {
      toast.error("Failed to delete bank account");
    }
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || 0}`;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/banking")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: "Inter", color: "#033F99" }}
            >
              Manage Banks
            </h1>
            <p className="text-gray-600">Edit or delete bank accounts</p>
          </div>
        </div>
      </div>

      <Card className="chart-container">
        <CardHeader>
          <CardTitle style={{ color: "#033F99" }}>Bank Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bank Name</th>
                  <th>Account Type</th>
                  <th>Account Number</th>
                  <th>IFSC Code</th>
                  <th>Branch</th>
                  <th>Current Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((bank) => (
                  <tr key={bank.id}>
                    <td className="font-medium">{bank.bank_name}</td>
                    <td>{bank.account_type}</td>
                    <td>{bank.account_number}</td>
                    <td>{bank.ifsc}</td>
                    <td>{bank.branch || "-"}</td>
                    <td className="font-semibold" style={{ color: "#033F99" }}>
                      {formatCurrency(bank.current_balance)}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(bank)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(bank)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editBank && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Bank Account</DialogTitle>
              <DialogDescription>
                Update bank account information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateBank} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bank Name *</Label>
                  <Input
                    required
                    value={editBank.bank_name}
                    onChange={(e) =>
                      setEditBank({ ...editBank, bank_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Account Type *</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={editBank.account_type}
                    onChange={(e) =>
                      setEditBank({ ...editBank, account_type: e.target.value })
                    }
                  >
                    <option value="Current">Current</option>
                    <option value="Savings">Savings</option>
                    <option value="Overdraft">Overdraft</option>
                  </select>
                </div>
                <div>
                  <Label>IFSC Code *</Label>
                  <Input
                    required
                    value={editBank.ifsc}
                    onChange={(e) =>
                      setEditBank({ ...editBank, ifsc: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Branch</Label>
                  <Input
                    value={editBank.branch || ""}
                    onChange={(e) =>
                      setEditBank({ ...editBank, branch: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Update Bank Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedBank && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <strong>{selectedBank.bank_name}</strong>? This will also delete
                all associated transactions. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageBanks;
