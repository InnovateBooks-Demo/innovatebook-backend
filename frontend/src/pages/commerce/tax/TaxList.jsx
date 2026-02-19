import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Download, FileText } from "lucide-react";
import axios from "axios";
import {
  PageWrapper,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  KPICard,
  TableContainer,
  TableHeader,
  TableHeaderCell,
  TableRow,
  StatusBadge,
  SearchBar,
  FilterBar,
  SelectDropdown,
  ActionButtons,
  LoadingSpinner,
  EmptyState,
} from "../CommerceDesignSystem";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TaxListRedesigned = () => {
  const navigate = useNavigate();
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchTaxes();
  }, [statusFilter]);

  const fetchTaxes = async () => {
    try {
      const token = localStorage.getItem("token");
      const url =
        statusFilter === "All"
          ? `${BACKEND_URL}/api/commerce/tax`
          : `${BACKEND_URL}/api/commerce/tax?status=${statusFilter}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaxes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch taxes:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (taxId) => {
    if (window.confirm("Are you sure you want to delete this tax record?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BACKEND_URL}/api/commerce/tax/${taxId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTaxes();
      } catch (error) {
        console.error("Failed to delete tax:", error);
        alert("Failed to delete tax record");
      }
    }
  };

  const filteredTaxes = taxes.filter(
    (tax) =>
      tax.tax_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tax.tax_period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tax.tax_type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate stats
  const stats = {
    total: taxes.length,
    draft: taxes.filter((t) => t.tax_status === "Draft").length,
    calculated: taxes.filter((t) => t.tax_status === "Calculated").length,
    filed: taxes.filter((t) => t.tax_status === "Filed").length,
    paid: taxes.filter((t) => t.tax_status === "Paid").length,
    totalLiability: taxes.reduce((sum, t) => sum + (t.net_tax_payable || 0), 0),
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageWrapper>
      <PageHeader
        title="Tax Compliance & Filing"
        subtitle="Manage GST, TDS, and tax compliance"
        action={
          <PrimaryButton
            icon={Plus}
            onClick={() => navigate("/commerce/tax/new")}
          >
            New Tax Record
          </PrimaryButton>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <KPICard icon={FileText} label="Total" value={stats.total} />
        <KPICard label="Draft" value={stats.draft} />
        <KPICard label="Calculated" value={stats.calculated} />
        <KPICard label="Filed" value={stats.filed} />
        <KPICard label="Paid" value={stats.paid} />
        <KPICard
          label="Total Liability"
          value={`₹${(stats.totalLiability / 100000).toFixed(1)}L`}
        />
      </div>

      {/* Filters */}
      <FilterBar>
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by tax ID, period, or type..."
          icon={Search}
        />
        <SelectDropdown
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "All", label: "All Status" },
            { value: "Draft", label: "Draft" },
            { value: "Calculated", label: "Calculated" },
            { value: "Filed", label: "Filed" },
            { value: "Paid", label: "Paid" },
          ]}
        />
        <SecondaryButton icon={Filter}>More Filters</SecondaryButton>
        <SecondaryButton icon={Download}>Export</SecondaryButton>
      </FilterBar>

      {/* Tax Table */}
      <TableContainer>
        {filteredTaxes.length > 0 ? (
          <table className="w-full">
            <TableHeader>
              <tr>
                <TableHeaderCell>Tax ID</TableHeaderCell>
                <TableHeaderCell>Period</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Taxable Amount</TableHeaderCell>
                <TableHeaderCell>Tax Computed</TableHeaderCell>
                <TableHeaderCell>Net Payable</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Compliance</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <tbody>
              {filteredTaxes.map((tax) => (
                <TableRow key={tax.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-[#033F99]">
                      {tax.tax_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                    {tax.tax_period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-white">
                      {tax.tax_type}
                    </span>
                    {tax.return_type && (
                      <div className="text-xs text-[#033F99]">
                        {tax.return_type}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    ₹{tax.taxable_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    ₹{tax.tax_computed.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                    ₹{tax.net_tax_payable.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={tax.tax_status}>
                      {tax.tax_status}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-emerald-600">
                      {tax.compliance_score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionButtons
                      onView={() => navigate(`/commerce/tax/${tax.tax_id}`)}
                      onEdit={() =>
                        navigate(`/commerce/tax/${tax.tax_id}/edit`)
                      }
                      onDelete={() => handleDelete(tax.tax_id)}
                    />
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={FileText}
            title="No Tax Records Found"
            message="Start by creating your first tax record"
          />
        )}
      </TableContainer>
    </PageWrapper>
  );
};

export default TaxListRedesigned;
