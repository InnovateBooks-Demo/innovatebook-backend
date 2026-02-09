import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingDown,
  Plus,
  Calculator,
  LineChart,
  Save,
  Trash2,
  Play,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Users,
  DollarSign,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ScenarioModeling = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuickSim, setShowQuickSim] = useState(false);
  const [showNewScenario, setShowNewScenario] = useState(false);
  const [showAddRound, setShowAddRound] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [templates, setTemplates] = useState([]);

  // Quick simulation state
  const [quickSim, setQuickSim] = useState({
    current_shares: 10000000,
    current_valuation: 10000000,
    pre_money_valuation: 10000000,
    investment_amount: 2000000,
    option_pool_increase: 0,
  });
  const [quickSimResult, setQuickSimResult] = useState(null);

  // New scenario state
  const [newScenario, setNewScenario] = useState({
    name: "",
    description: "",
    base_valuation: 10000000,
    base_shares_outstanding: 10000000,
  });

  // New round state
  const [newRound, setNewRound] = useState({
    round_name: "",
    round_type: "seed",
    pre_money_valuation: 0,
    investment_amount: 0,
    option_pool_increase: 0,
  });

  useEffect(() => {
    fetchScenarios();
    fetchTemplates();
  }, []);

  const fetchScenarios = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/ib-capital/scenario/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setScenarios(data.scenarios || []);
      }
    } catch (error) {
      console.error("Failed to fetch scenarios");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-capital/scenario/templates`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates");
    }
  };

  const fetchScenarioDetails = async (scenarioId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-capital/scenario/${scenarioId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedScenario(data);
        setAnalysisResult(null);
      }
    } catch (error) {
      toast.error("Failed to fetch scenario details");
    }
  };

  const runQuickSimulation = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-capital/scenario/simulate-quick`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quickSim),
        },
      );
      if (response.ok) {
        const data = await response.json();
        setQuickSimResult(data);
      } else {
        toast.error("Simulation failed");
      }
    } catch (error) {
      toast.error("Simulation failed");
    }
  };

  const createScenario = async () => {
    if (!newScenario.name) {
      toast.error("Scenario name is required");
      return;
    }
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-capital/scenario/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newScenario),
        },
      );
      if (response.ok) {
        const data = await response.json();
        toast.success("Scenario created");
        setShowNewScenario(false);
        setNewScenario({
          name: "",
          description: "",
          base_valuation: 10000000,
          base_shares_outstanding: 10000000,
        });
        fetchScenarios();
        setSelectedScenario(data);
      }
    } catch (error) {
      toast.error("Failed to create scenario");
    }
  };

  const addRound = async () => {
    if (
      !selectedScenario ||
      !newRound.round_name ||
      !newRound.investment_amount
    ) {
      toast.error("Round name and investment amount are required");
      return;
    }
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-capital/scenario/round/add`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newRound,
            scenario_id: selectedScenario.scenario_id,
          }),
        },
      );
      if (response.ok) {
        toast.success("Round added");
        setShowAddRound(false);
        setNewRound({
          round_name: "",
          round_type: "seed",
          pre_money_valuation: 0,
          investment_amount: 0,
          option_pool_increase: 0,
        });
        fetchScenarioDetails(selectedScenario.scenario_id);
      }
    } catch (error) {
      toast.error("Failed to add round");
    }
  };

  const runAnalysis = async () => {
    if (!selectedScenario) return;
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-capital/scenario/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scenario_id: selectedScenario.scenario_id }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        toast.success("Analysis complete");
      }
    } catch (error) {
      toast.error("Analysis failed");
    }
  };

  const deleteScenario = async (scenarioId) => {
    if (!window.confirm("Delete this scenario?")) return;
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/ib-capital/scenario/${scenarioId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        toast.success("Scenario deleted");
        if (selectedScenario?.scenario_id === scenarioId) {
          setSelectedScenario(null);
          setAnalysisResult(null);
        }
        fetchScenarios();
      }
    } catch (error) {
      toast.error("Failed to delete scenario");
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount?.toLocaleString()}`;
  };

  const formatNumber = (num) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)}L`;
    return num?.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/ib-capital")}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Cap Table Scenario Modeling
            </h1>
            <p className="text-gray-500">
              Simulate dilution from future funding rounds
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickSim(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Quick Calculator
          </button>
          <button
            onClick={() => setShowNewScenario(true)}
            className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022d6e] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Scenario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Scenarios List */}
        <div className="col-span-4 bg-white rounded-lg border p-4">
          <h2 className="font-semibold mb-4">Saved Scenarios</h2>

          {scenarios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No scenarios yet</p>
              <p className="text-sm">Create one to start modeling</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.scenario_id}
                  onClick={() => fetchScenarioDetails(scenario.scenario_id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedScenario?.scenario_id === scenario.scenario_id
                      ? "border-[#3A4E63] bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{scenario.name}</h3>
                      <p className="text-sm text-gray-500">
                        {scenario.description || "No description"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Base: {formatCurrency(scenario.base_valuation)} •{" "}
                        {formatNumber(scenario.base_shares_outstanding)} shares
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScenario(scenario.scenario_id);
                      }}
                      className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Templates */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium mb-3 text-sm text-gray-600">
              Quick Start Templates
            </h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setNewScenario({
                      name: template.name,
                      description: template.description,
                      base_valuation: template.base_valuation,
                      base_shares_outstanding: template.base_shares,
                    });
                    setShowNewScenario(true);
                  }}
                  className="w-full text-left p-2 rounded border hover:bg-gray-50 text-sm"
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500">
                    {template.rounds.length} rounds configured
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario Details & Analysis */}
        <div className="col-span-8">
          {selectedScenario ? (
            <div className="space-y-4">
              {/* Scenario Header */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedScenario.name}
                    </h2>
                    <p className="text-gray-500">
                      {selectedScenario.description}
                    </p>
                  </div>
                  <button
                    onClick={runAnalysis}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Run Analysis
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Base Valuation</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(selectedScenario.base_valuation)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Base Shares</p>
                    <p className="text-xl font-semibold">
                      {formatNumber(selectedScenario.base_shares_outstanding)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Funding Rounds</p>
                    <p className="text-xl font-semibold">
                      {selectedScenario.rounds?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rounds */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Funding Rounds</h3>
                  <button
                    onClick={() => setShowAddRound(true)}
                    className="px-3 py-1 border rounded-lg hover:bg-gray-50 flex items-center gap-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Round
                  </button>
                </div>

                {selectedScenario.rounds?.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>No rounds added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedScenario.rounds?.map((round, idx) => (
                      <div
                        key={round.round_id}
                        className="p-3 border rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full mr-2">
                              {round.round_type.toUpperCase()}
                            </span>
                            <span className="font-medium">
                              {round.round_name}
                            </span>
                          </div>
                          <span className="text-lg font-semibold text-green-600">
                            +{formatCurrency(round.investment_amount)}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-500">Pre-Money:</span>
                            <span className="ml-1">
                              {formatCurrency(round.pre_money_valuation)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Post-Money:</span>
                            <span className="ml-1">
                              {formatCurrency(round.post_money_valuation)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Price/Share:</span>
                            <span className="ml-1">
                              ₹{round.price_per_share?.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">New Shares:</span>
                            <span className="ml-1">
                              {formatNumber(round.new_shares_issued)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Analysis Results */}
              {analysisResult && (
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-semibold mb-4">Dilution Analysis</h3>

                  {/* Summary */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-500">Total Rounds</p>
                      <p className="text-xl font-semibold">
                        {analysisResult.summary?.total_rounds}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-500">Capital Raised</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(
                          analysisResult.summary?.total_capital_raised,
                        )}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-500">Final Valuation</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(
                          analysisResult.summary?.final_valuation,
                        )}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-500">Total Dilution</p>
                      <p className="text-xl font-semibold text-orange-600">
                        {analysisResult.summary?.total_dilution_pct}%
                      </p>
                    </div>
                  </div>

                  {/* Ownership Table */}
                  <h4 className="font-medium mb-2">
                    Final Ownership Structure
                  </h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2">Shareholder</th>
                        <th className="text-right p-2">Shares</th>
                        <th className="text-right p-2">Ownership %</th>
                        <th className="text-right p-2">Dilution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(analysisResult.final_ownership || {}).map(
                        ([name, data]) => (
                          <tr key={name} className="border-t">
                            <td className="p-2">{name}</td>
                            <td className="text-right p-2">
                              {formatNumber(data.shares)}
                            </td>
                            <td className="text-right p-2">
                              {data.percentage?.toFixed(2)}%
                            </td>
                            <td
                              className={`text-right p-2 ${data.total_dilution > 0 ? "text-red-500" : "text-gray-400"}`}
                            >
                              {data.total_dilution > 0
                                ? `-${data.total_dilution?.toFixed(2)}%`
                                : "-"}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-8 text-center">
              <TrendingDown className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700">
                Select a Scenario
              </h3>
              <p className="text-gray-500 mt-2">
                Choose a scenario from the list or create a new one to start
                modeling
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Simulation Modal */}
      {showQuickSim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              Quick Dilution Calculator
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Shares Outstanding
                </label>
                <input
                  type="number"
                  value={quickSim.current_shares}
                  onChange={(e) =>
                    setQuickSim({
                      ...quickSim,
                      current_shares: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Valuation (₹)
                </label>
                <input
                  type="number"
                  value={quickSim.current_valuation}
                  onChange={(e) =>
                    setQuickSim({
                      ...quickSim,
                      current_valuation: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pre-Money Valuation (₹)
                </label>
                <input
                  type="number"
                  value={quickSim.pre_money_valuation}
                  onChange={(e) =>
                    setQuickSim({
                      ...quickSim,
                      pre_money_valuation: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Investment Amount (₹)
                </label>
                <input
                  type="number"
                  value={quickSim.investment_amount}
                  onChange={(e) =>
                    setQuickSim({
                      ...quickSim,
                      investment_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Option Pool Increase (%)
                </label>
                <input
                  type="number"
                  value={quickSim.option_pool_increase}
                  onChange={(e) =>
                    setQuickSim({
                      ...quickSim,
                      option_pool_increase: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            {quickSimResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Results</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Price per Share:</div>
                  <div className="font-semibold">
                    ₹{quickSimResult.output?.price_per_share}
                  </div>
                  <div>New Shares Issued:</div>
                  <div className="font-semibold">
                    {formatNumber(quickSimResult.output?.new_shares_issued)}
                  </div>
                  <div>Post-Money Valuation:</div>
                  <div className="font-semibold">
                    {formatCurrency(
                      quickSimResult.output?.post_money_valuation,
                    )}
                  </div>
                  <div>Dilution:</div>
                  <div className="font-semibold text-orange-600">
                    {quickSimResult.output?.dilution_percentage}%
                  </div>
                  <div>New Investor Ownership:</div>
                  <div className="font-semibold text-green-600">
                    {quickSimResult.output?.new_investor_ownership_pct}%
                  </div>
                  <div>Existing Ownership:</div>
                  <div className="font-semibold">
                    {quickSimResult.output?.existing_ownership_pct}%
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={runQuickSimulation}
                className="flex-1 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022d6e]"
              >
                Calculate
              </button>
              <button
                onClick={() => {
                  setShowQuickSim(false);
                  setQuickSimResult(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Scenario Modal */}
      {showNewScenario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Create New Scenario</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Scenario Name *
                </label>
                <input
                  type="text"
                  value={newScenario.name}
                  onChange={(e) =>
                    setNewScenario({ ...newScenario, name: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  placeholder="e.g., Series A Planning"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newScenario.description}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Base Valuation (₹)
                </label>
                <input
                  type="number"
                  value={newScenario.base_valuation}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      base_valuation: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Base Shares Outstanding
                </label>
                <input
                  type="number"
                  value={newScenario.base_shares_outstanding}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      base_shares_outstanding: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={createScenario}
                className="flex-1 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022d6e]"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewScenario(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Round Modal */}
      {showAddRound && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Add Funding Round</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Round Name *
                </label>
                <input
                  type="text"
                  value={newRound.round_name}
                  onChange={(e) =>
                    setNewRound({ ...newRound, round_name: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  placeholder="e.g., Series A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Round Type
                </label>
                <select
                  value={newRound.round_type}
                  onChange={(e) =>
                    setNewRound({ ...newRound, round_type: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                >
                  <option value="seed">Seed</option>
                  <option value="series_a">Series A</option>
                  <option value="series_b">Series B</option>
                  <option value="series_c">Series C</option>
                  <option value="bridge">Bridge</option>
                  <option value="pre_seed">Pre-Seed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pre-Money Valuation (₹)
                </label>
                <input
                  type="number"
                  value={newRound.pre_money_valuation}
                  onChange={(e) =>
                    setNewRound({
                      ...newRound,
                      pre_money_valuation: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Investment Amount (₹) *
                </label>
                <input
                  type="number"
                  value={newRound.investment_amount}
                  onChange={(e) =>
                    setNewRound({
                      ...newRound,
                      investment_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Option Pool Increase (%)
                </label>
                <input
                  type="number"
                  value={newRound.option_pool_increase}
                  onChange={(e) =>
                    setNewRound({
                      ...newRound,
                      option_pool_increase: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={addRound}
                className="flex-1 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022d6e]"
              >
                Add Round
              </button>
              <button
                onClick={() => setShowAddRound(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioModeling;
