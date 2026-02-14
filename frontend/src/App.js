import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WebRTCProvider } from './context/WebRTCContext';
import { FinanceNotificationProvider } from './context/FinanceNotificationContext';
import './App.css';
import AcceptInvite from "./pages/AcceptInvite";

import { authService } from './utils/auth';
import { Toaster } from './components/ui/sonner';
import LandingPage from './pages/LandingPage';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/DashboardRedesigned';
import CashFlowActuals from './pages/CashFlow/ActualsElite';
import CashFlowBudgeting from './pages/CashFlow/BudgetingElite';
import CashFlowForecasting from './pages/CashFlow/ForecastingElite';
import CashFlowVariance from './pages/CashFlow/VarianceElite';
import Customers from './pages/CustomersElite';
import Vendors from './pages/VendorsElite';
import Invoices from './pages/InvoicesElite';
import Bills from './pages/BillsElite';
import AgingDSO from './pages/AgingDSORedesigned';
import CreateInvoice from './pages/CreateInvoiceElite';
import InvoiceDetail from './pages/InvoiceDetailElite';
import CustomerDetail from './pages/CustomerDetailElite';
import FinancialReporting from './pages/FinancialReporting';
import ProfitLoss from './pages/ProfitLoss';
import BalanceSheet from './pages/BalanceSheet';
import CashFlowStatementReport from './pages/CashFlowStatement';
import TrialBalance from './pages/TrialBalance';
import GeneralLedger from './pages/GeneralLedger';
import Collections from './pages/CollectionsElite';
import VendorDetail from './pages/VendorDetailRedesigned';
import CreateBill from './pages/CreateBillNew';
import BillDetail from './pages/BillDetailRedesigned';
import AgingDPO from './pages/AgingDPORedesigned';
import Payments from './pages/PaymentsElite';
import EditCustomerPage from './pages/EditCustomerPage';
import EditVendorPage from './pages/EditVendorPage';
import AddCustomerPage from './pages/AddCustomerPage';
import AddVendorPage from './pages/AddVendorPage';
import BankingAccounts from './pages/Banking/AccountsElite';
import BankingTransactions from './pages/Banking/TransactionsElite';
import BankingMatching from './pages/Banking/MatchingRedesigned';
import ManageBanks from './pages/Banking/ManageBanks';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AdjustmentEntries from './pages/AdjustmentEntries';
import CreateAdjustmentEntry from './pages/CreateAdjustmentEntry';
import AdjustmentEntryDetail from './pages/AdjustmentEntryDetail';
// Public Website Pages
import Home from './pages/HomeNew';
import MainPricingPage from './pages/PricingPage';
import SolutionsIndex from './pages/SolutionsIndex';
import CommerceSolution from './pages/CommerceSolutionElite';
import WorkspaceOverview from './pages/WorkspaceOverview';
import IntelligenceOverview from './pages/IntelligenceOverview';
// IB Commerce Solutions
import IBCommerceSolution from './pages/IBCommerceSolution';
import IBCommerceOverview from './pages/commerce-solutions/IBCommerceOverview';
// IB Workforce Solutions
import IBWorkforceOverview from './pages/workforce-solutions/IBWorkforceOverview';
import WorkforceEmployeesPage from './pages/workforce-solutions/EmployeesPage';
import WorkforcePayrollPage from './pages/workforce-solutions/PayrollPage';
import WorkforceBenefitsPage from './pages/workforce-solutions/BenefitsPage';
import WorkforcePerformancePage from './pages/workforce-solutions/PerformancePage';
import WorkforceLearningPage from './pages/workforce-solutions/LearningPage';
// IB Operations Solutions
import IBOperationsOverview from './pages/operations-solutions/IBOperationsOverview';
import OperationsProjectsPage from './pages/operations-solutions/ProjectsPage';
import OperationsAssetsPage from './pages/operations-solutions/AssetsPage';
import OperationsInventoryPage from './pages/operations-solutions/InventoryPage';
import OperationsProcurementPage from './pages/operations-solutions/ProcurementPage';
import OperationsProductionPage from './pages/operations-solutions/ProductionPage';
// IB Capital Solutions
import IBCapitalOverview from './pages/capital-solutions/IBCapitalOverview';
import CapitalBanksPage from './pages/capital-solutions/BanksPage';
import CapitalTreasuryPage from './pages/capital-solutions/TreasuryPage';
import CapitalCreditPage from './pages/capital-solutions/CreditPage';
import CapitalForecastingPage from './pages/capital-solutions/ForecastingPage';
import CapitalOptimizationPage from './pages/capital-solutions/OptimizationPage';
// IB Finance Solutions
import IBFinanceOverview from './pages/finance-solutions/IBFinanceOverview';
import FinanceAccountingPage from './pages/finance-solutions/AccountingPage';
import FinanceReportingPage from './pages/finance-solutions/ReportingPage';
import FinanceBudgetingPage from './pages/finance-solutions/BudgetingPage';
import FinanceReconciliationPage from './pages/finance-solutions/ReconciliationPage';
import FinanceCompliancePage from './pages/finance-solutions/CompliancePage';
import PartiesModule from './pages/commerce-solutions/PartiesModule';
import CustomersPage from './pages/commerce-solutions/parties/CustomersPage';
import VendorsPage from './pages/commerce-solutions/parties/VendorsPage';
import PartnersPage from './pages/commerce-solutions/parties/PartnersPage';
import ChannelsPage from './pages/commerce-solutions/parties/ChannelsPage';
import ProfilesPage from './pages/commerce-solutions/parties/ProfilesPage';
import CatalogModule from './pages/commerce-solutions/CatalogModule';
import ItemsPage from './pages/commerce-solutions/catalog/ItemsPage';
import PricingPage from './pages/commerce-solutions/catalog/PricingPage';
import CostingPage from './pages/commerce-solutions/catalog/CostingPage';
import PackagesPage from './pages/commerce-solutions/catalog/PackagesPage';
import RulesPage from './pages/commerce-solutions/catalog/RulesPage';
import LeadPage from './pages/commerce-solutions/revenue/LeadPage';
import RevenueEvaluatePage from './pages/commerce-solutions/revenue/EvaluatePage';
import RevenueCommitPage from './pages/commerce-solutions/revenue/CommitPage';
import RevenueContractPage from './pages/commerce-solutions/revenue/ContractPage';
import ProcurePage from './pages/commerce-solutions/procurement/ProcurePage';
import ProcurementEvaluatePage from './pages/commerce-solutions/procurement/EvaluatePage';
import ProcurementCommitPage from './pages/commerce-solutions/procurement/CommitPage';
import ProcurementContractPage from './pages/commerce-solutions/procurement/ContractPage';
import PoliciesPage from './pages/commerce-solutions/governance/PoliciesPage';
import AuthorityPage from './pages/commerce-solutions/governance/AuthorityPage';
import LimitsPage from './pages/commerce-solutions/governance/LimitsPage';
import RiskPage from './pages/commerce-solutions/governance/RiskPage';
import AuditPage from './pages/commerce-solutions/governance/AuditPage';
import RevenueModule from './pages/commerce-solutions/RevenueModule';
import ProcurementModule from './pages/commerce-solutions/ProcurementModule';
import GovernanceModule from './pages/commerce-solutions/GovernanceModule';
import WorkforceSolution from './pages/WorkforceSolution';
import CapitalSolution from './pages/CapitalSolution';
import OperationsSolution from './pages/OperationsSolution';
import FinanceSolution from './pages/FinanceSolution';
import InsightsIndex from './pages/InsightsIndex';
import IntelligencePage from './pages/IntelligencePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
// IB Commerce Module
import CommerceLayout from './pages/commerce/CommerceLayout';
import CommerceDashboard from './pages/commerce/CommerceDashboardPremium';
import CommerceLogin from './pages/commerce/CommerceLogin';
import CommerceProfile from './pages/commerce/CommerceProfile';
// IB Finance Module
import FinanceLayout from './pages/finance/FinanceLayout';
import FinanceDashboard from './pages/finance/FinanceDashboard';
// Lead Module - Commerce Dashboard Style
import LeadList from './pages/commerce/lead/LeadListFinal';
import LeadCreate from './pages/commerce/lead/LeadCreate';
import LeadDetail from './pages/commerce/lead/LeadDetail';
import LeadAutomationPage from './pages/commerce/lead/LeadAutomationPage';
import LeadEdit from './pages/commerce/lead/LeadEditZoho';
import LeadEngagement from './pages/commerce/lead/LeadEngagement';

// Parties Module
import PartiesDashboard from './pages/commerce/parties/PartiesDashboard';
import CustomersList from './pages/commerce/parties/CustomersList';
import CustomersCreate from './pages/commerce/parties/CustomersCreate';
import CustomersDetail from './pages/commerce/parties/CustomersDetail';
import CustomersEdit from './pages/commerce/parties/CustomersEdit';
import VendorsList from './pages/commerce/parties/VendorsList';
import VendorsCreate from './pages/commerce/parties/VendorsCreate';
import VendorsDetail from './pages/commerce/parties/VendorsDetail';
import VendorsEdit from './pages/commerce/parties/VendorsEdit';
import PartnersList from './pages/commerce/parties/PartnersList';
import PartnersCreate from './pages/commerce/parties/PartnersCreate';
import PartnersDetail from './pages/commerce/parties/PartnersDetail';
import PartnersEdit from './pages/commerce/parties/PartnersEdit';
import ChannelsList from './pages/commerce/parties/ChannelsList';
import ChannelsCreate from './pages/commerce/parties/ChannelsCreate';
import ChannelsDetail from './pages/commerce/parties/ChannelsDetail';
import ChannelsEdit from './pages/commerce/parties/ChannelsEdit';
import ProfilesList from './pages/commerce/parties/ProfilesList';
import ProfilesCreate from './pages/commerce/parties/ProfilesCreate';
import ProfilesDetail from './pages/commerce/parties/ProfilesDetail';
import ProfilesEdit from './pages/commerce/parties/ProfilesEdit';
// Catalog Module - Dashboard & List
import CatalogDashboard from './pages/commerce/catalog/CatalogDashboard';
import CatalogItemsList from './pages/commerce/catalog/ItemsList';
import CatalogPricingList from './pages/commerce/catalog/PricingList';
import CatalogCostingList from './pages/commerce/catalog/CostingList';
import CatalogRulesList from './pages/commerce/catalog/RulesList';
import CatalogPackagesList from './pages/commerce/catalog/PackagesList';
// Catalog Module - CRUD
import CatalogItemsCreate from './pages/commerce/catalog/ItemsCreate';
import CatalogItemsDetail from './pages/commerce/catalog/ItemsDetail';
import CatalogItemsEdit from './pages/commerce/catalog/ItemsEdit';
import CatalogPricingCreate from './pages/commerce/catalog/PricingCreate';
import CatalogPricingDetail from './pages/commerce/catalog/PricingDetail';
import CatalogPricingEdit from './pages/commerce/catalog/PricingEdit';
import CatalogCostingCreate from './pages/commerce/catalog/CostingCreate';
import CatalogCostingDetail from './pages/commerce/catalog/CostingDetail';
import CatalogCostingEdit from './pages/commerce/catalog/CostingEdit';
import CatalogRulesCreate from './pages/commerce/catalog/RulesCreate';
import CatalogRulesDetail from './pages/commerce/catalog/RulesDetail';
import CatalogRulesEdit from './pages/commerce/catalog/RulesEdit';
import CatalogPackagesCreate from './pages/commerce/catalog/PackagesCreate';
import CatalogPackagesDetail from './pages/commerce/catalog/PackagesDetail';
import CatalogPackagesEdit from './pages/commerce/catalog/PackagesEdit';
// Governance Module - Dashboard & List
import GovernanceDashboard from './pages/commerce/govern/GovernanceDashboard';
import GovernPoliciesList from './pages/commerce/govern/PoliciesList';
import GovernLimitsList from './pages/commerce/govern/LimitsList';
import GovernAuthorityList from './pages/commerce/govern/AuthorityList';
import GovernRiskList from './pages/commerce/govern/RiskList';
import GovernAuditList from './pages/commerce/govern/AuditList';
// Governance Module - CRUD
import GovernPoliciesCreate from './pages/commerce/govern/PoliciesCreate';
import GovernPoliciesDetail from './pages/commerce/govern/PoliciesDetail';
import GovernPoliciesEdit from './pages/commerce/govern/PoliciesEdit';
import GovernLimitsCreate from './pages/commerce/govern/LimitsCreate';
import GovernLimitsDetail from './pages/commerce/govern/LimitsDetail';
import GovernLimitsEdit from './pages/commerce/govern/LimitsEdit';
import GovernAuthorityCreate from './pages/commerce/govern/AuthorityCreate';
import GovernAuthorityDetail from './pages/commerce/govern/AuthorityDetail';
import GovernAuthorityEdit from './pages/commerce/govern/AuthorityEdit';
import GovernRiskCreate from './pages/commerce/govern/RiskCreate';
import GovernRiskDetail from './pages/commerce/govern/RiskDetail';
import GovernRiskEdit from './pages/commerce/govern/RiskEdit';
import GovernAuditCreate from './pages/commerce/govern/AuditCreate';
import GovernAuditDetail from './pages/commerce/govern/AuditDetail';
import GovernAuditEdit from './pages/commerce/govern/AuditEdit';
// Procurement Module - CRUD (Requests)
import ProcurementCreate from './pages/commerce/procure/ProcurementCreate';
import ProcurementDetail from './pages/commerce/procure/ProcurementDetail';
import ProcurementEdit from './pages/commerce/procure/ProcurementEdit';
// Procurement Module - CRUD (Orders)
import OrdersList from './pages/commerce/procure/OrdersList';
import OrdersCreate from './pages/commerce/procure/OrdersCreate';
import OrdersDetail from './pages/commerce/procure/OrdersDetail';
import OrdersEdit from './pages/commerce/procure/OrdersEdit';
// Procurement Module - CRUD (Evaluations)
import ProcureEvaluationsList from './pages/commerce/procure/EvaluationsList';
import ProcureEvaluationsCreate from './pages/commerce/procure/EvaluationsCreate';
import ProcureEvaluationsDetail from './pages/commerce/procure/EvaluationsDetail';
import ProcureEvaluationsEdit from './pages/commerce/procure/EvaluationsEdit';
// Procurement Module - CRUD (Commits)
import ProcureCommitsList from './pages/commerce/procure/CommitsList';
import ProcureCommitsCreate from './pages/commerce/procure/CommitsCreate';
import ProcureCommitsDetail from './pages/commerce/procure/CommitsDetail';
import ProcureCommitsEdit from './pages/commerce/procure/CommitsEdit';
// Procurement Module - CRUD (Contracts)
import ProcureContractsList from './pages/commerce/procure/ContractsList';
import ProcureContractsCreate from './pages/commerce/procure/ContractsCreate';
import ProcureContractsDetail from './pages/commerce/procure/ContractsDetail';
import ProcureContractsEdit from './pages/commerce/procure/ContractsEdit';
// Procurement Dashboard
import ProcurementDashboard from './pages/commerce/procure/ProcurementDashboard';
// Revenue Module - Dashboard
import RevenueDashboard from './pages/commerce/revenue/RevenueDashboard';
// Revenue Module - Evaluations
import RevenueEvaluationsList from './pages/commerce/revenue/EvaluationsList';
import RevenueEvaluationsCreate from './pages/commerce/revenue/EvaluationsCreate';
import RevenueEvaluationsDetail from './pages/commerce/revenue/EvaluationsDetail';
import RevenueEvaluationsEdit from './pages/commerce/revenue/EvaluationsEdit';
// Revenue Module - Commits
import RevenueCommitsList from './pages/commerce/revenue/CommitsList';
import RevenueCommitsCreate from './pages/commerce/revenue/CommitsCreate';
import RevenueCommitsDetail from './pages/commerce/revenue/CommitsDetail';
import RevenueCommitsEdit from './pages/commerce/revenue/CommitsEdit';
// Revenue Module - Contracts
import RevenueContractsList from './pages/commerce/revenue/ContractsList';
import RevenueContractsCreate from './pages/commerce/revenue/ContractsCreate';
import RevenueContractsDetail from './pages/commerce/revenue/ContractsDetail';
import RevenueContractsEdit from './pages/commerce/revenue/ContractsEdit';
// Manufacturing Masters
import MasterDashboard from './pages/manufacturing/masters/MasterDashboard';
import MasterList from './pages/manufacturing/masters/MasterList';
import AnalyticsDashboard from './pages/manufacturing/analytics/AnalyticsDashboard';
import MasterDataView from './pages/manufacturing/MasterDataView';
// Auth Pages
import LoginPage from './pages/auth/LoginPage';
// Super Admin Pages
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminOrganizations from './pages/superadmin/SuperAdminOrganizations';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import SuperAdminLoginNew from './pages/super-admin/SuperAdminLoginNew';
import SuperAdminOrgsPage from './pages/super-admin/OrganizationsPage';
import SuperAdminUsersPage from './pages/super-admin/UsersPage';
import SignupPage from './pages/auth/SignupPage';
// Workspace
import WorkspaceLayoutNew from './pages/workspace/WorkspaceLayoutNew';
import WorkspaceDashboard from './pages/workspace/WorkspaceDashboard';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import IBChatPremium from './pages/workspace/IBChatPremiumNew';
import WorkspaceSettings from './pages/workspace/WorkspaceSettings';
// Workspace Modules (5 Module Model)
import WorkspaceTasks from './pages/workspace/modules/WorkspaceTasks';
import WorkspaceApprovals from './pages/workspace/modules/WorkspaceApprovals';
import WorkspaceChannels from './pages/workspace/modules/WorkspaceChannels';
import WorkspaceChats from './pages/workspace/modules/WorkspaceChats';
import WorkspaceNotifications from './pages/workspace/modules/WorkspaceNotifications';
import './styles/design-system.css';
// Evaluate Module
import EvaluateList from './pages/commerce/evaluate/EvaluateList';
import EvaluateCreate from './pages/commerce/evaluate/EvaluateCreate';
import EvaluateDetail from './pages/commerce/evaluate/EvaluateDetail';
import EvaluateEdit from './pages/commerce/evaluate/EvaluateEdit';
// Commit Module
import CommitList from './pages/commerce/commit/CommitList';
import CommitCreate from './pages/commerce/commit/CommitCreate';
import CommitDetail from './pages/commerce/commit/CommitDetail';
import CommitEdit from './pages/commerce/commit/CommitEdit';
// Execute Module
import ExecuteList from './pages/commerce/execute/ExecuteList';
import ExecuteCreate from './pages/commerce/execute/ExecuteCreate';
import ExecuteDetail from './pages/commerce/execute/ExecuteDetail';
import ExecuteEdit from './pages/commerce/execute/ExecuteEdit';
// Bill Module
import CommerceBillList from './pages/commerce/bill/BillList';
import CommerceBillCreate from './pages/commerce/bill/BillCreate';
import CommerceBillDetail from './pages/commerce/bill/BillDetail';
import CommerceBillEdit from './pages/commerce/bill/BillEdit';
// Collect Module
import CollectList from './pages/commerce/collect/CollectList';
import CollectCreate from './pages/commerce/collect/CollectCreate';
import CollectDetail from './pages/commerce/collect/CollectDetail';
import CollectEdit from './pages/commerce/collect/CollectEdit';
// Procure Module
import ProcureList from './pages/commerce/procure/ProcurementList';
// Pay Module
import PayList from './pages/commerce/pay/PayList';
import PayCreate from './pages/commerce/pay/PayCreate';
import PayDetail from './pages/commerce/pay/PayDetail';
import PayEdit from './pages/commerce/pay/PayEdit';
// Spend Module
import SpendList from './pages/commerce/spend/SpendList';
import SpendCreate from './pages/commerce/spend/SpendCreate';
import SpendDetail from './pages/commerce/spend/SpendDetail';
import SpendEdit from './pages/commerce/spend/SpendEdit';
// Tax Module
import TaxList from './pages/commerce/tax/TaxList';
import TaxCreate from './pages/commerce/tax/TaxCreate';
import TaxDetail from './pages/commerce/tax/TaxDetail';
import TaxEdit from './pages/commerce/tax/TaxEdit';
// Reconcile Module
import ReconcileList from './pages/commerce/reconcile/ReconcileList';
import ReconcileCreate from './pages/commerce/reconcile/ReconcileCreate';
import ReconcileDetail from './pages/commerce/reconcile/ReconcileDetail';
import ReconcileEdit from './pages/commerce/reconcile/ReconcileEdit';
// Govern Module
import GovernList from './pages/commerce/govern/GovernList';
import GovernCreate from './pages/commerce/govern/GovernCreate';
import GovernDetail from './pages/commerce/govern/GovernDetail';
import GovernEdit from './pages/commerce/govern/GovernEdit';
// Workforce Module - Elite Design
import EmployeesElite from './pages/EmployeesElite';
// Operations Module - Elite Design
import WorkOrdersElite from './pages/WorkOrdersElite';
import InventoryElite from './pages/InventoryElite';
// Capital Module - Elite Design
import PortfolioElite from './pages/PortfolioElite';
// Financial Reports - Elite Design
import ProfitLossElite from './pages/ProfitLossElite';
import BalanceSheetElite from './pages/BalanceSheetElite';

// Revenue Workflow Module (5-Stage)
import RevenueLeadsList from './pages/commerce/revenue-workflow/LeadsList';
import RevenueLeadCreate from './pages/commerce/revenue-workflow/LeadCreate';
import RevenueLeadDetail from './pages/commerce/revenue-workflow/LeadDetail';
import RevenueLeadEdit from './pages/commerce/revenue-workflow/LeadEdit';
import RevenueEvaluationWorkspace from './pages/commerce/revenue-workflow/EvaluationWorkspace';
import RevenueWorkflowEvaluationsList from './pages/commerce/revenue-workflow/EvaluationsList';
import RevenueCommitReview from './pages/commerce/revenue-workflow/CommitReview';
import RevenueWorkflowCommitsList from './pages/commerce/revenue-workflow/CommitsList';
import RevenueContractDraft from './pages/commerce/revenue-workflow/ContractDraft';
import RevenueWorkflowContractsList from './pages/commerce/revenue-workflow/ContractsList';
import RevenueHandoff from './pages/commerce/revenue-workflow/Handoff';
import RevenueWorkflowHandoffsList from './pages/commerce/revenue-workflow/HandoffsList';

// Procurement Workflow Module (5-Stage)
import ProcureRequestsList from './pages/commerce/procure-workflow/RequestsList';
import ProcureRequestCreate from './pages/commerce/procure-workflow/RequestCreate';
import ProcureRequestDetail from './pages/commerce/procure-workflow/RequestDetail';
import ProcureRequestEdit from './pages/commerce/procure-workflow/RequestEdit';
import ProcureEvaluationWorkspace from './pages/commerce/procure-workflow/EvaluationWorkspace';
import ProcureWorkflowEvaluationsList from './pages/commerce/procure-workflow/EvaluationsList';
import ProcureCommitReview from './pages/commerce/procure-workflow/CommitReview';
import ProcureWorkflowCommitsList from './pages/commerce/procure-workflow/CommitsList';
import ProcureContractDraft from './pages/commerce/procure-workflow/ContractDraft';
import ProcureWorkflowContractsList from './pages/commerce/procure-workflow/ContractsList';
import ProcureHandoff from './pages/commerce/procure-workflow/Handoff';
import ProcureWorkflowHandoffsList from './pages/commerce/procure-workflow/HandoffsList';

// Parties Engine (Commercial Identity & Readiness)
import PartyEngineList from './pages/commerce/parties-engine/PartyEngineList';
import PartyEngineDetail from './pages/commerce/parties-engine/PartyEngineDetail';
import PartyEngineCreate from './pages/commerce/parties-engine/PartyEngineCreate';

// Governance Engine (Policies, Limits, Authority, Risk, Audit)
import GovernanceEngineDashboard from './pages/commerce/governance-engine/GovernanceEngineDashboard';
import GovernancePoliciesList from './pages/commerce/governance-engine/GovernancePoliciesList';
import GovernanceLimitsList from './pages/commerce/governance-engine/GovernanceLimitsList';
import GovernanceAuthorityList from './pages/commerce/governance-engine/GovernanceAuthorityList';
import GovernanceRiskRulesList from './pages/commerce/governance-engine/GovernanceRiskRulesList';

// Intelligence Module
import IntelligenceDashboard from './pages/intelligence/IntelligenceDashboard';
import IntelligenceAnalytics from './pages/intelligence/AnalyticsDashboard';
import IntelligenceReports from './pages/intelligence/ReportsPage';
import IntelligenceInsights from './pages/intelligence/InsightsPage';
import IntelligenceForecasts from './pages/intelligence/ForecastsPage';
import IntelSignalsPage from './pages/intelligence/SignalsPage';
import IntelSignalsRealtimePage from './pages/intelligence/SignalsPageRealtime';
import IntelMetricsPage from './pages/intelligence/MetricsPage';
import IntelRiskPage from './pages/intelligence/RiskPage';
import IntelForecastPage from './pages/intelligence/ForecastPage';
import IntelAIForecastPage from './pages/intelligence/AIForecastPage';
import IntelRecommendationsPage from './pages/intelligence/RecommendationsPage';
import IntelLearningPage from './pages/intelligence/LearningPage';
import ExecutiveDashboard from './pages/intelligence/ExecutiveDashboard';

// Operations Module
import OperationsDashboard from './pages/operations/OperationsDashboard';
import IntakeQueue from './pages/operations/intake/IntakeQueue';
import ProjectsList from './pages/operations/projects/ProjectsList';
import ProjectDetail from './pages/operations/projects/ProjectDetail';
import TasksList from './pages/operations/tasks/TasksList';
import ResourcesPage from './pages/operations/resources/ResourcesPage';
import ServicesList from './pages/operations/services/ServicesList';
import ServiceDetail from './pages/operations/services/ServiceDetail';
import OpsGovernanceDashboard from './pages/operations/governance/GovernanceDashboard';

// IB Finance Module (Enterprise Finance Engine)
import IBFinanceDashboard from './pages/ib-finance/IBFinanceDashboard';
import BillingQueue from './pages/ib-finance/billing/BillingQueue';
import BillingDetail from './pages/ib-finance/billing/BillingDetail';
import BillingCreate from './pages/ib-finance/billing/BillingCreate';
import BillingEdit from './pages/ib-finance/billing/BillingEdit';
import ReceivablesDashboard from './pages/ib-finance/receivables/ReceivablesDashboard';
import ReceivableEdit from './pages/ib-finance/receivables/ReceivableEdit';
import PayablesDashboard from './pages/ib-finance/payables/PayablesDashboard';
import PayableEdit from './pages/ib-finance/payables/PayableEdit';
import LedgerDashboard from './pages/ib-finance/ledger/LedgerDashboard';
import JournalCreate from './pages/ib-finance/ledger/JournalCreate';
import JournalEdit from './pages/ib-finance/ledger/JournalEdit';
import AssetsDashboard from './pages/ib-finance/assets/AssetsDashboard';
import AssetDetail from './pages/ib-finance/assets/AssetDetail';
import AssetCreate from './pages/ib-finance/assets/AssetCreate';
import AssetEdit from './pages/ib-finance/assets/AssetEdit';
import TaxDashboard from './pages/ib-finance/tax/TaxDashboard';
import IBFinanceTaxEdit from './pages/ib-finance/tax/TaxEdit';
import GSTReports from './pages/ib-finance/tax/GSTReports';
import CloseDashboard from './pages/ib-finance/close/CloseDashboard';
import FinancialStatements from './pages/ib-finance/close/FinancialStatements';
import BankReconciliation from './pages/ib-finance/bank/BankReconciliation';
import CurrencySettings from './pages/ib-finance/settings/CurrencySettings';

// IB Workforce Module (Human Capacity, Accountability & Compliance Engine)
import IBWorkforceDashboard from './pages/ib-workforce/IBWorkforceDashboard';
import PeopleList from './pages/ib-workforce/people/PeopleList';
import PersonDetail from './pages/ib-workforce/people/PersonDetail';
import PersonCreate from './pages/ib-workforce/people/PersonCreate';
import PersonEdit from './pages/ib-workforce/people/PersonEdit';
import RolesList from './pages/ib-workforce/roles/RolesList';
import RoleDetail from './pages/ib-workforce/roles/RoleDetail';
import RoleCreate from './pages/ib-workforce/roles/RoleCreate';
import RoleEdit from './pages/ib-workforce/roles/RoleEdit';
import CapacityDashboard from './pages/ib-workforce/capacity/CapacityDashboard';
import TimeDashboard from './pages/ib-workforce/time/TimeDashboard';
import PayrollDashboard from './pages/ib-workforce/payroll/PayrollDashboard';
import ComplianceDashboard from './pages/ib-workforce/compliance/ComplianceDashboard';

// IB Capital Module
import IBCapitalDashboard from './pages/ib-capital/IBCapitalDashboard';
import OwnershipDashboard from './pages/ib-capital/ownership/OwnershipDashboard';
import OwnerDetail from './pages/ib-capital/ownership/OwnerDetail';
import EquityDashboard from './pages/ib-capital/equity/EquityDashboard';
import RoundDetail from './pages/ib-capital/equity/RoundDetail';
import DebtDashboard from './pages/ib-capital/debt/DebtDashboard';
import DebtDetail from './pages/ib-capital/debt/DebtDetail';
import ConvertibleConversion from './pages/ib-capital/debt/ConvertibleConversion';
import TreasuryDashboard from './pages/ib-capital/treasury/TreasuryDashboard';
import TreasuryAccountDetail from './pages/ib-capital/treasury/TreasuryAccountDetail';
import ReturnsDashboard from './pages/ib-capital/returns/ReturnsDashboard';
import ReturnDetail from './pages/ib-capital/returns/ReturnDetail';
import CapitalGovernanceDashboard from './pages/ib-capital/governance/GovernanceDashboard';
import ApprovalDetail from './pages/ib-capital/governance/ApprovalDetail';
import RuleDetail from './pages/ib-capital/governance/RuleDetail';
import ESOPDashboard from './pages/ib-capital/esop/ESOPDashboard';
import GrantDetail from './pages/ib-capital/esop/GrantDetail';
import ScenarioModeling from './pages/ib-capital/scenarios/ScenarioModeling';

// Admin Module
import OrgAdminDashboard from './pages/admin/OrgAdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import RolesPermissions from './pages/admin/RolesPermissions';
import OrgSettings from './pages/admin/OrgSettings';

// Enhanced Features
import ActivityFeed from './pages/ActivityFeed';
import CustomizableDashboard from './pages/CustomizableDashboard';
import GlobalSearch from './components/GlobalSearch';
import CalendarPage from './pages/CalendarPage';
import ReportsBuilder from './pages/ReportsBuilder';

// P2 Features - Email Campaigns & Workflow Builder
import EmailCampaigns from './pages/workspace/email-campaigns/EmailCampaigns';
import WorkflowBuilder from './pages/workspace/workflows/WorkflowBuilder';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking auth status
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authStatus = authService.isAuthenticated();
      console.log('Auth check on mount:', authStatus);
      setIsAuthenticated(authStatus);

      // Get user data
      if (authStatus) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(userData);
      }

      setAuthLoading(false);
    };
    checkAuth();

    // Also listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = () => {
      const authStatus = authService.isAuthenticated();
      console.log('Auth changed via storage:', authStatus);
      setIsAuthenticated(authStatus);

      if (authStatus) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const PrivateRoute = ({ children }) => {
    // Double-check auth from localStorage directly
    const currentAuth = authService.isAuthenticated();

    // Show loading while checking auth
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Use current auth check from localStorage (most up-to-date)
    if (!currentAuth) {
      console.log('Not authenticated, redirecting to landing');
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <div className="App">
      <WebRTCProvider userId={currentUser?.id}>
        <FinanceNotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<Home />} />



              {/* Auth Routes - New Login/Signup System */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />

              {/* Super Admin Routes */}
              <Route path="/super-admin/login" element={<SuperAdminLoginNew />} />
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/organizations" element={<SuperAdminOrgsPage />} />
              <Route path="/super-admin/users" element={<SuperAdminUsersPage />} />

              {/* Redirect old login routes to new auth pages */}
              <Route path="/login" element={<Navigate to="/auth/login" replace />} />
              <Route path="/commerce/login" element={<Navigate to="/auth/login" replace />} />
              <Route path="/commerce-login" element={<Navigate to="/auth/login" replace />} />

              {/* Public Website Overview Pages */}
              <Route path="/pricing" element={<MainPricingPage />} />
              <Route path="/workspace-overview" element={<WorkspaceOverview />} />
              <Route path="/intelligence-overview" element={<IntelligenceOverview />} />

              <Route path="/solutions" element={<SolutionsIndex />} />
              <Route path="/solutions/commerce" element={<IBCommerceSolution />} />
              <Route path="/solutions/commerce/overview" element={<IBCommerceOverview />} />
              <Route path="/solutions/commerce/parties" element={<PartiesModule />} />
              <Route path="/solutions/commerce/parties/customers" element={<CustomersPage />} />
              <Route path="/solutions/commerce/parties/vendors" element={<VendorsPage />} />
              <Route path="/solutions/commerce/parties/partners" element={<PartnersPage />} />
              <Route path="/solutions/commerce/parties/channels" element={<ChannelsPage />} />
              <Route path="/solutions/commerce/parties/profiles" element={<ProfilesPage />} />
              <Route path="/solutions/commerce/catalog" element={<CatalogModule />} />
              <Route path="/solutions/commerce/catalog/items" element={<ItemsPage />} />
              <Route path="/solutions/commerce/catalog/pricing" element={<PricingPage />} />
              <Route path="/solutions/commerce/catalog/costing" element={<CostingPage />} />
              <Route path="/solutions/commerce/catalog/packages" element={<PackagesPage />} />
              <Route path="/solutions/commerce/catalog/rules" element={<RulesPage />} />
              <Route path="/solutions/commerce/revenue" element={<RevenueModule />} />
              <Route path="/solutions/commerce/revenue/lead" element={<LeadPage />} />
              <Route path="/solutions/commerce/revenue/evaluate" element={<RevenueEvaluatePage />} />
              <Route path="/solutions/commerce/revenue/commit" element={<RevenueCommitPage />} />
              <Route path="/solutions/commerce/revenue/contract" element={<RevenueContractPage />} />
              <Route path="/solutions/commerce/procurement" element={<ProcurementModule />} />
              <Route path="/solutions/commerce/procurement/procure" element={<ProcurePage />} />
              <Route path="/solutions/commerce/procurement/evaluate" element={<ProcurementEvaluatePage />} />
              <Route path="/solutions/commerce/procurement/commit" element={<ProcurementCommitPage />} />
              <Route path="/solutions/commerce/procurement/contract" element={<ProcurementContractPage />} />
              <Route path="/solutions/commerce/governance" element={<GovernanceModule />} />
              <Route path="/solutions/commerce/governance/policies" element={<PoliciesPage />} />
              <Route path="/solutions/commerce/governance/authority" element={<AuthorityPage />} />
              <Route path="/solutions/commerce/governance/limits" element={<LimitsPage />} />
              <Route path="/solutions/commerce/governance/risk" element={<RiskPage />} />
              <Route path="/solutions/commerce/governance/audit" element={<AuditPage />} />
              <Route path="/solutions/workforce" element={<WorkforceSolution />} />
              <Route path="/solutions/workforce/overview" element={<IBWorkforceOverview />} />
              <Route path="/solutions/workforce/employees" element={<WorkforceEmployeesPage />} />
              <Route path="/solutions/workforce/payroll" element={<WorkforcePayrollPage />} />
              <Route path="/solutions/workforce/benefits" element={<WorkforceBenefitsPage />} />
              <Route path="/solutions/workforce/performance" element={<WorkforcePerformancePage />} />
              <Route path="/solutions/workforce/learning" element={<WorkforceLearningPage />} />
              <Route path="/solutions/capital" element={<CapitalSolution />} />
              <Route path="/solutions/capital/overview" element={<IBCapitalOverview />} />
              <Route path="/solutions/capital/banks" element={<CapitalBanksPage />} />
              <Route path="/solutions/capital/treasury" element={<CapitalTreasuryPage />} />
              <Route path="/solutions/capital/credit" element={<CapitalCreditPage />} />
              <Route path="/solutions/capital/forecasting" element={<CapitalForecastingPage />} />
              <Route path="/solutions/capital/optimization" element={<CapitalOptimizationPage />} />
              <Route path="/solutions/operations" element={<OperationsSolution />} />
              <Route path="/solutions/operations/overview" element={<IBOperationsOverview />} />
              <Route path="/solutions/operations/projects" element={<OperationsProjectsPage />} />
              <Route path="/solutions/operations/assets" element={<OperationsAssetsPage />} />
              <Route path="/solutions/operations/inventory" element={<OperationsInventoryPage />} />
              <Route path="/solutions/operations/procurement" element={<OperationsProcurementPage />} />
              <Route path="/solutions/operations/production" element={<OperationsProductionPage />} />
              <Route path="/solutions/finance" element={<FinanceSolution />} />
              <Route path="/solutions/finance/overview" element={<IBFinanceOverview />} />
              <Route path="/solutions/finance/accounting" element={<FinanceAccountingPage />} />
              <Route path="/solutions/finance/reporting" element={<FinanceReportingPage />} />
              <Route path="/solutions/finance/budgeting" element={<FinanceBudgetingPage />} />
              <Route path="/solutions/finance/reconciliation" element={<FinanceReconciliationPage />} />
              <Route path="/solutions/finance/compliance" element={<FinanceCompliancePage />} />
              <Route path="/insights" element={<InsightsIndex />} />
              <Route path="/intelligence" element={<IntelligencePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Workspace Routes - Premium UI */}
              <Route
                path="/workspace"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/workspace/dashboard" replace />} />
                <Route path="dashboard" element={<WorkspaceDashboard />} />
                <Route path="chats" element={<WorkspaceChats />} />
                <Route path="channels" element={<WorkspaceChannels />} />
                <Route path="tasks" element={<WorkspaceTasks />} />
                <Route path="approvals" element={<WorkspaceApprovals />} />
                <Route path="notifications" element={<WorkspaceNotifications />} />
                <Route path="chat" element={<IBChatPremium viewMode="chat" />} />
                <Route path="settings" element={<WorkspaceSettings />} />
              </Route>

              {/* Reports Routes */}
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<ReportsDashboard />} />
              </Route>

              {/* IB Commerce Routes - Now within Workspace Layout */}
              <Route
                path="/commerce"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<CommerceDashboard />} />
                <Route path="profile" element={<CommerceProfile />} />
                <Route path="settings" element={<CommerceProfile />} />
                {/* Parties Module */}
                <Route path="parties" element={<PartiesDashboard />} />
                <Route path="parties/dashboard" element={<PartiesDashboard />} />
                <Route path="parties/customers" element={<CustomersList />} />
                <Route path="parties/customers/create" element={<CustomersCreate />} />
                <Route path="parties/customers/:customer_id" element={<CustomersDetail />} />
                <Route path="parties/customers/:customer_id/edit" element={<CustomersEdit />} />
                <Route path="parties/vendors" element={<VendorsList />} />
                <Route path="parties/vendors/create" element={<VendorsCreate />} />
                <Route path="parties/vendors/:vendor_id" element={<VendorsDetail />} />
                <Route path="parties/vendors/:vendor_id/edit" element={<VendorsEdit />} />
                <Route path="parties/partners" element={<PartnersList />} />
                <Route path="parties/partners/create" element={<PartnersCreate />} />
                <Route path="parties/partners/:partner_id" element={<PartnersDetail />} />
                <Route path="parties/partners/:partner_id/edit" element={<PartnersEdit />} />
                <Route path="parties/channels" element={<ChannelsList />} />
                <Route path="parties/channels/create" element={<ChannelsCreate />} />
                <Route path="parties/channels/:channel_id" element={<ChannelsDetail />} />
                <Route path="parties/channels/:channel_id/edit" element={<ChannelsEdit />} />
                <Route path="parties/profiles" element={<ProfilesList />} />
                <Route path="parties/profiles/create" element={<ProfilesCreate />} />
                <Route path="parties/profiles/:profile_id" element={<ProfilesDetail />} />
                <Route path="parties/profiles/:profile_id/edit" element={<ProfilesEdit />} />

                {/* Catalog Module */}
                <Route path="catalog" element={<CatalogDashboard />} />
                <Route path="catalog/items" element={<CatalogItemsList />} />
                <Route path="catalog/items/create" element={<CatalogItemsCreate />} />
                <Route path="catalog/items/:item_id" element={<CatalogItemsDetail />} />
                <Route path="catalog/items/:item_id/edit" element={<CatalogItemsEdit />} />
                <Route path="catalog/pricing" element={<CatalogPricingList />} />
                <Route path="catalog/pricing/create" element={<CatalogPricingCreate />} />
                <Route path="catalog/pricing/:pricing_id" element={<CatalogPricingDetail />} />
                <Route path="catalog/pricing/:pricing_id/edit" element={<CatalogPricingEdit />} />
                <Route path="catalog/costing" element={<CatalogCostingList />} />
                <Route path="catalog/costing/create" element={<CatalogCostingCreate />} />
                <Route path="catalog/costing/:costing_id" element={<CatalogCostingDetail />} />
                <Route path="catalog/costing/:costing_id/edit" element={<CatalogCostingEdit />} />
                <Route path="catalog/rules" element={<CatalogRulesList />} />
                <Route path="catalog/rules/create" element={<CatalogRulesCreate />} />
                <Route path="catalog/rules/:rule_id" element={<CatalogRulesDetail />} />
                <Route path="catalog/rules/:rule_id/edit" element={<CatalogRulesEdit />} />
                <Route path="catalog/packages" element={<CatalogPackagesList />} />
                <Route path="catalog/packages/create" element={<CatalogPackagesCreate />} />
                <Route path="catalog/packages/:package_id" element={<CatalogPackagesDetail />} />
                <Route path="catalog/packages/:package_id/edit" element={<CatalogPackagesEdit />} />

                {/* Revenue Module */}
                <Route path="revenue" element={<RevenueDashboard />} />
                <Route path="lead" element={<LeadList />} />
                <Route path="lead/create" element={<LeadCreate />} />
                <Route path="lead/:id" element={<LeadDetail />} />
                <Route path="lead/:id/edit" element={<LeadEdit />} />
                <Route path="masters" element={<MasterDataView />} />
                {/* Revenue - Evaluations Sub-module */}
                <Route path="revenue/evaluations" element={<RevenueEvaluationsList />} />
                <Route path="revenue/evaluations/create" element={<RevenueEvaluationsCreate />} />
                <Route path="revenue/evaluations/:evaluation_id" element={<RevenueEvaluationsDetail />} />
                <Route path="revenue/evaluations/:evaluation_id/edit" element={<RevenueEvaluationsEdit />} />
                {/* Revenue - Commits Sub-module */}
                <Route path="revenue/commits" element={<RevenueCommitsList />} />
                <Route path="revenue/commits/create" element={<RevenueCommitsCreate />} />
                <Route path="revenue/commits/:commit_id" element={<RevenueCommitsDetail />} />
                <Route path="revenue/commits/:commit_id/edit" element={<RevenueCommitsEdit />} />
                {/* Revenue - Contracts Sub-module */}
                <Route path="revenue/contracts" element={<RevenueContractsList />} />
                <Route path="revenue/contracts/create" element={<RevenueContractsCreate />} />
                <Route path="revenue/contracts/:contract_id" element={<RevenueContractsDetail />} />
                <Route path="revenue/contracts/:contract_id/edit" element={<RevenueContractsEdit />} />
                {/* Legacy Evaluate Routes */}
                <Route path="evaluate" element={<EvaluateList />} />
                <Route path="evaluate/create" element={<EvaluateCreate />} />
                <Route path="evaluate/:evaluationId" element={<EvaluateDetail />} />
                <Route path="evaluate/:evaluationId/edit" element={<EvaluateEdit />} />
                <Route path="commit" element={<CommitList />} />
                <Route path="commit/create" element={<CommitCreate />} />
                <Route path="commit/:commitId" element={<CommitDetail />} />
                <Route path="commit/:commitId/edit" element={<CommitEdit />} />
                <Route path="execute" element={<ExecuteList />} />
                <Route path="execute/create" element={<ExecuteCreate />} />
                <Route path="execute/:executionId" element={<ExecuteDetail />} />
                <Route path="execute/:executionId/edit" element={<ExecuteEdit />} />
                <Route path="bill" element={<CommerceBillList />} />
                <Route path="bill/create" element={<CommerceBillCreate />} />
                <Route path="bill/:invoiceId" element={<CommerceBillDetail />} />
                <Route path="bill/:invoiceId/edit" element={<CommerceBillEdit />} />
                <Route path="collect" element={<CollectList />} />
                <Route path="collect/create" element={<CollectCreate />} />
                <Route path="collect/:collectionId" element={<CollectDetail />} />
                <Route path="collect/:collectionId/edit" element={<CollectEdit />} />
                <Route path="procure" element={<ProcurementDashboard />} />
                <Route path="procure/requests" element={<ProcureList />} />
                <Route path="procure/requests/create" element={<ProcurementCreate />} />
                <Route path="procure/requests/:pr_id" element={<ProcurementDetail />} />
                <Route path="procure/requests/:pr_id/edit" element={<ProcurementEdit />} />
                {/* Procurement - Orders Sub-module */}
                <Route path="procure/orders" element={<OrdersList />} />
                <Route path="procure/orders/create" element={<OrdersCreate />} />
                <Route path="procure/orders/:po_id" element={<OrdersDetail />} />
                <Route path="procure/orders/:po_id/edit" element={<OrdersEdit />} />
                {/* Procurement - Evaluations Sub-module */}
                <Route path="procure/evaluate" element={<ProcureEvaluationsList />} />
                <Route path="procure/evaluate/create" element={<ProcureEvaluationsCreate />} />
                <Route path="procure/evaluate/:evaluation_id" element={<ProcureEvaluationsDetail />} />
                <Route path="procure/evaluate/:evaluation_id/edit" element={<ProcureEvaluationsEdit />} />
                {/* Procurement - Commits Sub-module */}
                <Route path="procure/commit" element={<ProcureCommitsList />} />
                <Route path="procure/commit/create" element={<ProcureCommitsCreate />} />
                <Route path="procure/commit/:commit_id" element={<ProcureCommitsDetail />} />
                <Route path="procure/commit/:commit_id/edit" element={<ProcureCommitsEdit />} />
                {/* Procurement - Contracts Sub-module */}
                <Route path="procure/contract" element={<ProcureContractsList />} />
                <Route path="procure/contract/create" element={<ProcureContractsCreate />} />
                <Route path="procure/contract/:contract_id" element={<ProcureContractsDetail />} />
                <Route path="procure/contract/:contract_id/edit" element={<ProcureContractsEdit />} />
                <Route path="pay" element={<PayList />} />
                <Route path="pay/create" element={<PayCreate />} />
                <Route path="pay/:paymentId" element={<PayDetail />} />
                <Route path="pay/:paymentId/edit" element={<PayEdit />} />
                <Route path="spend" element={<SpendList />} />
                <Route path="spend/create" element={<SpendCreate />} />
                <Route path="spend/:spendId" element={<SpendDetail />} />
                <Route path="spend/:spendId/edit" element={<SpendEdit />} />
                <Route path="tax" element={<TaxList />} />
                <Route path="tax/create" element={<TaxCreate />} />
                <Route path="tax/:taxId" element={<TaxDetail />} />
                <Route path="tax/:taxId/edit" element={<TaxEdit />} />
                <Route path="reconcile" element={<ReconcileList />} />
                <Route path="reconcile/create" element={<ReconcileCreate />} />
                <Route path="reconcile/:reconciliationId" element={<ReconcileDetail />} />
                <Route path="reconcile/:reconciliationId/edit" element={<ReconcileEdit />} />
                <Route path="govern" element={<GovernanceDashboard />} />
                <Route path="govern/policies" element={<GovernPoliciesList />} />
                <Route path="govern/policies/create" element={<GovernPoliciesCreate />} />
                <Route path="govern/policies/:policy_id" element={<GovernPoliciesDetail />} />
                <Route path="govern/policies/:policy_id/edit" element={<GovernPoliciesEdit />} />
                <Route path="govern/limits" element={<GovernLimitsList />} />
                <Route path="govern/limits/create" element={<GovernLimitsCreate />} />
                <Route path="govern/limits/:limit_id" element={<GovernLimitsDetail />} />
                <Route path="govern/limits/:limit_id/edit" element={<GovernLimitsEdit />} />
                <Route path="govern/authority" element={<GovernAuthorityList />} />
                <Route path="govern/authority/create" element={<GovernAuthorityCreate />} />
                <Route path="govern/authority/:authority_id" element={<GovernAuthorityDetail />} />
                <Route path="govern/authority/:authority_id/edit" element={<GovernAuthorityEdit />} />
                <Route path="govern/risk" element={<GovernRiskList />} />
                <Route path="govern/risk/create" element={<GovernRiskCreate />} />
                <Route path="govern/risk/:risk_id" element={<GovernRiskDetail />} />
                <Route path="govern/risk/:risk_id/edit" element={<GovernRiskEdit />} />
                <Route path="govern/audit" element={<GovernAuditList />} />
                <Route path="govern/audit/create" element={<GovernAuditCreate />} />
                <Route path="govern/audit/:audit_id" element={<GovernAuditDetail />} />
                <Route path="govern/audit/:audit_id/edit" element={<GovernAuditEdit />} />

                {/* Revenue Workflow - 5-Stage Enterprise */}
                <Route path="revenue-workflow/leads" element={<RevenueLeadsList />} />
                <Route path="revenue-workflow/leads/create" element={<RevenueLeadCreate />} />
                <Route path="revenue-workflow/leads/:lead_id" element={<RevenueLeadDetail />} />
                <Route path="revenue-workflow/leads/:lead_id/edit" element={<RevenueLeadEdit />} />
                <Route path="revenue-workflow/evaluations" element={<RevenueWorkflowEvaluationsList />} />
                <Route path="revenue-workflow/evaluations/:evaluation_id" element={<RevenueEvaluationWorkspace />} />
                <Route path="revenue-workflow/commits" element={<RevenueWorkflowCommitsList />} />
                <Route path="revenue-workflow/commits/:commit_id" element={<RevenueCommitReview />} />
                <Route path="revenue-workflow/contracts" element={<RevenueWorkflowContractsList />} />
                <Route path="revenue-workflow/contracts/:contract_id" element={<RevenueContractDraft />} />
                <Route path="revenue-workflow/handoffs" element={<RevenueWorkflowHandoffsList />} />
                <Route path="revenue-workflow/handoffs/:handoff_id" element={<RevenueHandoff />} />

                {/* Procurement Workflow - 5-Stage Enterprise */}
                <Route path="procure-workflow/requests" element={<ProcureRequestsList />} />
                <Route path="procure-workflow/requests/create" element={<ProcureRequestCreate />} />
                <Route path="procure-workflow/requests/:request_id" element={<ProcureRequestDetail />} />
                <Route path="procure-workflow/requests/:request_id/edit" element={<ProcureRequestEdit />} />
                <Route path="procure-workflow/evaluations" element={<ProcureWorkflowEvaluationsList />} />
                <Route path="procure-workflow/evaluations/:evaluation_id" element={<ProcureEvaluationWorkspace />} />
                <Route path="procure-workflow/commits" element={<ProcureWorkflowCommitsList />} />
                <Route path="procure-workflow/commits/:commit_id" element={<ProcureCommitReview />} />
                <Route path="procure-workflow/contracts" element={<ProcureWorkflowContractsList />} />
                <Route path="procure-workflow/contracts/:contract_id" element={<ProcureContractDraft />} />
                <Route path="procure-workflow/handoffs" element={<ProcureWorkflowHandoffsList />} />
                <Route path="procure-workflow/handoffs/:handoff_id" element={<ProcureHandoff />} />

                {/* Parties Engine - Commercial Identity & Readiness */}
                <Route path="parties-engine" element={<PartyEngineList />} />
                <Route path="parties-engine/create" element={<PartyEngineCreate />} />
                <Route path="parties-engine/:party_id" element={<PartyEngineDetail />} />

                {/* Governance Engine - Policies, Limits, Authority, Risk, Audit */}
                <Route path="governance-engine" element={<GovernanceEngineDashboard />} />
                <Route path="governance-engine/policies" element={<GovernancePoliciesList />} />
                <Route path="governance-engine/limits" element={<GovernanceLimitsList />} />
                <Route path="governance-engine/authority" element={<GovernanceAuthorityList />} />
                <Route path="governance-engine/risk-rules" element={<GovernanceRiskRulesList />} />

                {/* Manufacturing Masters */}
                <Route path="manufacturing/masters" element={<MasterDashboard />} />
                <Route path="manufacturing/masters/:masterType" element={<MasterList />} />
                <Route path="manufacturing/masters-view" element={<MasterDataView />} />
                {/* Manufacturing Analytics */}
                <Route path="manufacturing/analytics" element={<AnalyticsDashboard />} />
              </Route>

              {/* IB Intelligence Routes - Within Workspace Layout */}
              <Route
                path="/intelligence"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<IntelligenceDashboard />} />
                {/* New Intelligence Modules */}
                <Route path="signals" element={<IntelSignalsRealtimePage />} />
                <Route path="signals/legacy" element={<IntelSignalsPage />} />
                <Route path="metrics" element={<IntelMetricsPage />} />
                <Route path="risk" element={<IntelRiskPage />} />
                <Route path="forecast" element={<IntelAIForecastPage />} />
                <Route path="forecast/legacy" element={<IntelForecastPage />} />
                <Route path="recommendations" element={<IntelRecommendationsPage />} />
                <Route path="learning" element={<IntelLearningPage />} />
                <Route path="executive" element={<ExecutiveDashboard />} />
                {/* Legacy routes */}
                <Route path="analytics" element={<IntelligenceAnalytics />} />
                <Route path="analytics/dashboard" element={<IntelligenceAnalytics />} />
                <Route path="analytics/revenue" element={<IntelligenceAnalytics />} />
                <Route path="analytics/procurement" element={<IntelligenceAnalytics />} />
                <Route path="analytics/parties" element={<IntelligenceAnalytics />} />
                <Route path="reports" element={<IntelligenceReports />} />
                <Route path="reports/standard" element={<IntelligenceReports />} />
                <Route path="reports/custom" element={<IntelligenceReports />} />
                <Route path="reports/scheduled" element={<IntelligenceReports />} />
                <Route path="insights" element={<IntelligenceInsights />} />
                <Route path="insights/ai" element={<IntelligenceInsights />} />
                <Route path="insights/recommendations" element={<IntelligenceInsights />} />
                <Route path="insights/anomalies" element={<IntelligenceInsights />} />
                <Route path="forecasts" element={<IntelligenceForecasts />} />
                <Route path="forecasts/revenue" element={<IntelligenceForecasts />} />
                <Route path="forecasts/spend" element={<IntelligenceForecasts />} />
                <Route path="forecasts/cashflow" element={<IntelligenceForecasts />} />
              </Route>

              {/* IB Operations Routes - Within Workspace Layout */}
              <Route
                path="/operations"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<OperationsDashboard />} />
                {/* Intake */}
                <Route path="intake" element={<IntakeQueue />} />
                <Route path="intake/:work_order_id" element={<IntakeQueue />} />
                {/* Projects */}
                <Route path="projects" element={<ProjectsList />} />
                <Route path="projects/:project_id" element={<ProjectDetail />} />
                {/* Tasks */}
                <Route path="tasks" element={<TasksList />} />
                <Route path="tasks/my" element={<TasksList />} />
                {/* Resources */}
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="inventory" element={<ResourcesPage />} />
                {/* Services */}
                <Route path="services" element={<ServicesList />} />
                <Route path="services/:service_instance_id" element={<ServiceDetail />} />
                {/* Governance */}
                <Route path="governance" element={<OpsGovernanceDashboard />} />
                <Route path="governance/alerts" element={<OpsGovernanceDashboard />} />
              </Route>

              {/* Organization Admin Routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<OrgAdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="roles" element={<RolesPermissions />} />
                <Route path="settings" element={<OrgSettings />} />
                <Route path="billing" element={<OrgSettings />} />
              </Route>

              {/* IB Finance Routes - Within Workspace Layout */}
              <Route
                path="/finance"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<FinanceDashboard />} />
                {/* Bill & Collect (Receivables) */}
                <Route path="bill" element={<CommerceBillList />} />
                <Route path="bill/create" element={<CommerceBillCreate />} />
                <Route path="bill/:invoiceId" element={<CommerceBillDetail />} />
                <Route path="bill/:invoiceId/edit" element={<CommerceBillEdit />} />
                <Route path="collect" element={<CollectList />} />
                <Route path="collect/create" element={<CollectCreate />} />
                <Route path="collect/:collectionId" element={<CollectDetail />} />
                <Route path="collect/:collectionId/edit" element={<CollectEdit />} />
                {/* Pay & Spend (Payables) */}
                <Route path="pay" element={<PayList />} />
                <Route path="pay/create" element={<PayCreate />} />
                <Route path="pay/:paymentId" element={<PayDetail />} />
                <Route path="pay/:paymentId/edit" element={<PayEdit />} />
                <Route path="spend" element={<SpendList />} />
                <Route path="spend/create" element={<SpendCreate />} />
                <Route path="spend/:spendId" element={<SpendDetail />} />
                <Route path="spend/:spendId/edit" element={<SpendEdit />} />
                {/* Cash Flow Routes */}
                <Route path="cashflow/actuals" element={<CashFlowActuals />} />
                <Route path="cashflow/budgeting" element={<CashFlowBudgeting />} />
                <Route path="cashflow/forecasting" element={<CashFlowForecasting />} />
                <Route path="cashflow/variance" element={<CashFlowVariance />} />
                {/* Financial Reporting Routes */}
                <Route path="financial-reporting" element={<FinancialReporting />} />
                <Route path="financial-reporting/profit-loss" element={<ProfitLossElite />} />
                <Route path="financial-reporting/balance-sheet" element={<BalanceSheetElite />} />
                <Route path="financial-reporting/cashflow" element={<CashFlowStatementReport />} />
                <Route path="financial-reporting/trial-balance" element={<TrialBalance />} />
                <Route path="financial-reporting/general-ledger" element={<GeneralLedger />} />
                <Route path="financial-reporting/adjustment-entries" element={<AdjustmentEntries />} />
                <Route path="financial-reporting/adjustment-entries/create" element={<CreateAdjustmentEntry />} />
                <Route path="financial-reporting/adjustment-entries/:id" element={<AdjustmentEntryDetail />} />
                {/* Accounting Routes */}
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices/create" element={<CreateInvoice />} />
                <Route path="invoices/:id" element={<InvoiceDetail />} />
                <Route path="aging-dso" element={<AgingDSO />} />
                <Route path="bills" element={<Bills />} />
                <Route path="bills/create" element={<CreateBill />} />
                <Route path="bills/:id" element={<BillDetail />} />
                <Route path="aging-dpo" element={<AgingDPO />} />
                <Route path="collections" element={<Collections />} />
                <Route path="payments" element={<Payments />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/create" element={<AddCustomerPage />} />
                <Route path="customers/:id" element={<CustomerDetail />} />
                <Route path="customers/:id/edit" element={<EditCustomerPage />} />
                <Route path="vendors" element={<Vendors />} />
                <Route path="vendors/create" element={<AddVendorPage />} />
                <Route path="vendors/add" element={<AddVendorPage />} />
                <Route path="vendors/:id" element={<VendorDetail />} />
                <Route path="vendors/:id/edit" element={<EditVendorPage />} />
                <Route path="banking/accounts" element={<BankingAccounts />} />
                <Route path="banking/transactions" element={<BankingTransactions />} />
                <Route path="banking/matching" element={<BankingMatching />} />
                <Route path="banking/manage" element={<ManageBanks />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* IB Workforce Routes - Within Workspace Layout */}
              <Route
                path="/workforce"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<EmployeesElite />} />
                <Route path="employees" element={<EmployeesElite />} />
              </Route>

              {/* IB Capital Routes - Within Workspace Layout */}
              <Route
                path="/capital"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<PortfolioElite />} />
                <Route path="portfolio" element={<PortfolioElite />} />
              </Route>

              {/* IB Finance Routes (Enterprise Finance Engine) - Within Workspace Layout */}
              <Route
                path="/ib-finance"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<IBFinanceDashboard />} />
                {/* Billing Module */}
                <Route path="billing" element={<BillingQueue />} />
                <Route path="billing/create" element={<BillingCreate />} />
                <Route path="billing/:id" element={<BillingDetail />} />
                <Route path="billing/:id/edit" element={<BillingEdit />} />
                {/* Receivables Module */}
                <Route path="receivables" element={<ReceivablesDashboard />} />
                <Route path="receivables/payment" element={<ReceivablesDashboard />} />
                <Route path="receivables/apply" element={<ReceivablesDashboard />} />
                <Route path="receivables/:id/edit" element={<ReceivableEdit />} />
                <Route path="receivables/:id" element={<ReceivablesDashboard />} />
                {/* Payables Module */}
                <Route path="payables" element={<PayablesDashboard />} />
                <Route path="payables/create" element={<PayablesDashboard />} />
                <Route path="payables/:id/edit" element={<PayableEdit />} />
                <Route path="payables/:id" element={<PayablesDashboard />} />
                <Route path="payables/:id/pay" element={<PayablesDashboard />} />
                {/* Ledger Module */}
                <Route path="ledger" element={<LedgerDashboard />} />
                <Route path="ledger/accounts" element={<LedgerDashboard />} />
                <Route path="ledger/journals" element={<LedgerDashboard />} />
                <Route path="ledger/journal/create" element={<JournalCreate />} />
                <Route path="ledger/journal/:id" element={<LedgerDashboard />} />
                <Route path="ledger/journal/:id/edit" element={<JournalEdit />} />
                <Route path="ledger/trial-balance" element={<LedgerDashboard />} />
                {/* Assets Module */}
                <Route path="assets" element={<AssetsDashboard />} />
                <Route path="assets/create" element={<AssetCreate />} />
                <Route path="assets/:id" element={<AssetDetail />} />
                <Route path="assets/:id/edit" element={<AssetEdit />} />
                <Route path="assets/:id/dispose" element={<AssetDetail />} />
                {/* Tax Module */}
                <Route path="tax" element={<TaxDashboard />} />
                <Route path="tax/reports" element={<TaxDashboard />} />
                <Route path="tax/gst" element={<GSTReports />} />
                <Route path="tax/registrations" element={<TaxDashboard />} />
                <Route path="tax/:id/edit" element={<IBFinanceTaxEdit />} />
                {/* Close Module */}
                <Route path="close" element={<CloseDashboard />} />
                <Route path="close/reconciliations" element={<CloseDashboard />} />
                <Route path="close/statements/:period" element={<FinancialStatements />} />
                <Route path="close/statements" element={<FinancialStatements />} />
                {/* Bank Reconciliation Module */}
                <Route path="bank" element={<BankReconciliation />} />
                <Route path="bank/reconciliation" element={<BankReconciliation />} />
                {/* Settings Module */}
                <Route path="settings/currencies" element={<CurrencySettings />} />
              </Route>

              {/* IB Workforce Routes (Human Capacity, Accountability & Compliance Engine) - Within Workspace Layout */}
              <Route
                path="/ib-workforce"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<IBWorkforceDashboard />} />
                {/* People Module */}
                <Route path="people" element={<PeopleList />} />
                <Route path="people/create" element={<PersonCreate />} />
                <Route path="people/:person_id" element={<PersonDetail />} />
                <Route path="people/:person_id/edit" element={<PersonEdit />} />
                {/* Roles Module */}
                <Route path="roles" element={<RolesList />} />
                <Route path="roles/create" element={<RoleCreate />} />
                <Route path="roles/:role_id" element={<RoleDetail />} />
                <Route path="roles/:role_id/edit" element={<RoleEdit />} />
                {/* Capacity Module */}
                <Route path="capacity" element={<CapacityDashboard />} />
                {/* Time Module */}
                <Route path="time" element={<TimeDashboard />} />
                {/* Payroll Module */}
                <Route path="payroll" element={<PayrollDashboard />} />
                {/* Compliance Module */}
                <Route path="compliance" element={<ComplianceDashboard />} />
              </Route>

              {/* IB Capital Routes (Ownership, Funding & Capital Governance Engine) - Within Workspace Layout */}
              <Route
                path="/ib-capital"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<IBCapitalDashboard />} />
                {/* Ownership Module */}
                <Route path="ownership" element={<OwnershipDashboard />} />
                <Route path="ownership/:owner_id" element={<OwnerDetail />} />
                {/* Equity Module */}
                <Route path="equity" element={<EquityDashboard />} />
                <Route path="equity/:round_id" element={<RoundDetail />} />
                {/* Debt Module */}
                <Route path="debt" element={<DebtDashboard />} />
                <Route path="debt/:debt_id" element={<DebtDetail />} />
                <Route path="debt/:debt_id/convert" element={<ConvertibleConversion />} />
                {/* ESOP Module */}
                <Route path="esop" element={<ESOPDashboard />} />
                <Route path="esop/grants/:grant_id" element={<GrantDetail />} />
                {/* Treasury Module */}
                <Route path="treasury" element={<TreasuryDashboard />} />
                <Route path="treasury/:account_id" element={<TreasuryAccountDetail />} />
                {/* Returns Module */}
                <Route path="returns" element={<ReturnsDashboard />} />
                <Route path="returns/:return_id" element={<ReturnDetail />} />
                {/* Governance Module */}
                <Route path="governance" element={<CapitalGovernanceDashboard />} />
                <Route path="governance/approvals/:approval_id" element={<ApprovalDetail />} />
                <Route path="governance/rules/:rule_id" element={<RuleDetail />} />
                {/* Scenario Modeling */}
                <Route path="scenarios" element={<ScenarioModeling />} />
              </Route>

              {/* Email Campaigns */}
              <Route
                path="/email-campaigns"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<EmailCampaigns />} />
              </Route>

              {/* Workflow Builder */}
              <Route
                path="/workflows"
                element={
                  <PrivateRoute>
                    <WorkspaceLayoutNew setIsAuthenticated={setIsAuthenticated} />
                  </PrivateRoute>
                }
              >
                <Route index element={<WorkflowBuilder />} />
              </Route>

              {/* Redirect old routes to new workspace routes */}
              <Route path="/dashboard" element={<Navigate to="/workspace" replace />} />
              <Route path="/cashflow/*" element={<Navigate to="/finance" replace />} />
              <Route path="/customers" element={<Navigate to="/finance/customers" replace />} />
              <Route path="/vendors" element={<Navigate to="/finance/vendors" replace />} />
              <Route path="/invoices" element={<Navigate to="/finance/invoices" replace />} />
              <Route path="/bills" element={<Navigate to="/finance/bills" replace />} />
              <Route path="/financial-reporting/*" element={<Navigate to="/finance" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </FinanceNotificationProvider>
      </WebRTCProvider>
    </div>
  );
}

export default App;
