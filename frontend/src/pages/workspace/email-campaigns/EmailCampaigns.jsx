import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Plus,
  Send,
  Users,
  BarChart3,
  Pause,
  Play,
  Trash2,
  ArrowLeft,
  FileText,
  Eye,
  MousePointer,
  AlertCircle,
  Check,
  PenTool,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../utils/auth";
import EmailTemplateEditor from "../../../components/EmailTemplateEditor";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const EmailCampaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showAddRecipients, setShowAddRecipients] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    template_id: "",
    subject_override: "",
    recipient_type: "manual",
  });

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    body_html: "",
    category: "general",
    variables: [],
  });

  const [recipientInput, setRecipientInput] = useState("");

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/email-campaigns/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/email-campaigns/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates");
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/email-campaigns/campaigns/${campaignId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedCampaign(data);
      }
    } catch (error) {
      toast.error("Failed to fetch campaign details");
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.template_id) {
      toast.error("Name and template are required");
      return;
    }
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/email-campaigns/campaigns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCampaign),
      });
      if (response.ok) {
        toast.success("Campaign created");
        setShowNewCampaign(false);
        setNewCampaign({
          name: "",
          template_id: "",
          subject_override: "",
          recipient_type: "manual",
        });
        fetchCampaigns();
      }
    } catch (error) {
      toast.error("Failed to create campaign");
    }
  };

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body_html) {
      toast.error("Name, subject, and body are required");
      return;
    }
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/email-campaigns/templates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTemplate),
      });
      if (response.ok) {
        toast.success("Template created");
        setShowNewTemplate(false);
        setNewTemplate({
          name: "",
          subject: "",
          body_html: "",
          category: "general",
          variables: [],
        });
        fetchTemplates();
      }
    } catch (error) {
      toast.error("Failed to create template");
    }
  };

  const openTemplateEditor = (template = null) => {
    setEditingTemplate(
      template || {
        name: "",
        subject: "",
        body_html: "",
        category: "general",
        variables: [],
      },
    );
    setShowTemplateEditor(true);
  };

  const handleTemplateSave = async (updatedTemplate) => {
    try {
      const token = authService.getToken();
      const isUpdate = updatedTemplate.template_id;

      const url = isUpdate
        ? `${API_URL}/api/email-campaigns/templates/${updatedTemplate.template_id}`
        : `${API_URL}/api/email-campaigns/templates`;

      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTemplate),
      });

      if (response.ok) {
        toast.success(isUpdate ? "Template updated" : "Template created");
        setShowTemplateEditor(false);
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        toast.error("Failed to save template");
      }
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const seedTemplates = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/email-campaigns/templates/seed`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        toast.success("Default templates created");
        fetchTemplates();
      }
    } catch (error) {
      toast.error("Failed to seed templates");
    }
  };

  const addRecipients = async () => {
    if (!selectedCampaign || !recipientInput.trim()) return;

    const emails = recipientInput
      .split(/[\n,]/)
      .map((e) => e.trim())
      .filter((e) => e);
    const recipients = emails.map((email) => ({
      email,
      name: email.split("@")[0],
    }));

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/email-campaigns/campaigns/${selectedCampaign.campaign_id}/recipients/bulk`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipients }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        toast.success(`Added ${data.added} recipients`);
        setShowAddRecipients(false);
        setRecipientInput("");
        fetchCampaignDetails(selectedCampaign.campaign_id);
      }
    } catch (error) {
      toast.error("Failed to add recipients");
    }
  };

  const sendCampaign = async (campaignId) => {
    if (!window.confirm("Send this campaign to all recipients?")) return;
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/email-campaigns/campaigns/${campaignId}/send`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        toast.success("Campaign sending started");
        fetchCampaigns();
        if (selectedCampaign?.campaign_id === campaignId) {
          fetchCampaignDetails(campaignId);
        }
      }
    } catch (error) {
      toast.error("Failed to send campaign");
    }
  };

  const deleteCampaign = async (campaignId) => {
    if (!window.confirm("Delete this campaign?")) return;
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${API_URL}/api/email-campaigns/campaigns/${campaignId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        toast.success("Campaign deleted");
        if (selectedCampaign?.campaign_id === campaignId) {
          setSelectedCampaign(null);
        }
        fetchCampaigns();
      }
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-700",
      scheduled: "bg-blue-100 text-blue-700",
      sending: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
      paused: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
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
            onClick={() => navigate("/workspace")}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Email Campaigns
            </h1>
            <p className="text-gray-500">
              Send bulk templated emails with tracking
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`pb-2 px-1 ${activeTab === "campaigns" ? "border-b-2 border-[#3A4E63] text-[#3A4E63]" : "text-gray-500"}`}
        >
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`pb-2 px-1 ${activeTab === "templates" ? "border-b-2 border-[#3A4E63] text-[#3A4E63]" : "text-gray-500"}`}
        >
          Templates
        </button>
      </div>

      {activeTab === "campaigns" && (
        <div className="grid grid-cols-12 gap-6">
          {/* Campaigns List */}
          <div className="col-span-5 bg-white rounded-lg border p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">All Campaigns</h2>
              <button
                onClick={() => setShowNewCampaign(true)}
                className="px-3 py-1 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022d6e] flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No campaigns yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.campaign_id}
                    onClick={() => fetchCampaignDetails(campaign.campaign_id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCampaign?.campaign_id === campaign.campaign_id
                        ? "border-[#3A4E63] bg-[rgba(3,63,153,0.08)]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-xs text-gray-500">
                          {campaign.template_name}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(campaign.status)}`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />{" "}
                        {campaign.recipient_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Send className="h-3 w-3" /> {campaign.sent_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {campaign.opened_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaign Details */}
          <div className="col-span-7">
            {selectedCampaign ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {selectedCampaign.name}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedCampaign.status)}`}
                      >
                        {selectedCampaign.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {selectedCampaign.status === "draft" && (
                        <>
                          <button
                            onClick={() => setShowAddRecipients(true)}
                            className="px-3 py-1 border rounded-lg hover:bg-gray-50 flex items-center gap-1 text-sm"
                          >
                            <Users className="h-4 w-4" />
                            Add Recipients
                          </button>
                          <button
                            onClick={() =>
                              sendCampaign(selectedCampaign.campaign_id)
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                            disabled={!selectedCampaign.recipients?.length}
                          >
                            <Send className="h-4 w-4" />
                            Send
                          </button>
                        </>
                      )}
                      <button
                        onClick={() =>
                          deleteCampaign(selectedCampaign.campaign_id)
                        }
                        className="px-3 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <Users className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                      <p className="text-xl font-semibold">
                        {selectedCampaign.stats?.total_recipients || 0}
                      </p>
                      <p className="text-xs text-gray-500">Recipients</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <Send className="h-5 w-5 mx-auto mb-1 text-green-600" />
                      <p className="text-xl font-semibold text-green-600">
                        {selectedCampaign.stats?.sent || 0}
                      </p>
                      <p className="text-xs text-gray-500">Sent</p>
                    </div>
                    <div className="p-3 bg-[rgba(3,63,153,0.08)] rounded-lg text-center">
                      <Eye className="h-5 w-5 mx-auto mb-1 text-[#033F99]" />
                      <p className="text-xl font-semibold text-[#033F99]">
                        {selectedCampaign.stats?.opened || 0}
                      </p>
                      <p className="text-xs text-gray-500">Opened</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <MousePointer className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                      <p className="text-xl font-semibold text-purple-600">
                        {selectedCampaign.stats?.clicked || 0}
                      </p>
                      <p className="text-xs text-gray-500">Clicked</p>
                    </div>
                  </div>
                </div>

                {/* Recipients */}
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-semibold mb-3">
                    Recipients ({selectedCampaign.recipients?.length || 0})
                  </h3>
                  {selectedCampaign.recipients?.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No recipients added yet
                    </p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-center p-2">Opened</th>
                            <th className="text-center p-2">Clicked</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCampaign.recipients?.map((recipient) => (
                            <tr
                              key={recipient.recipient_id}
                              className="border-t"
                            >
                              <td className="p-2">{recipient.email}</td>
                              <td className="p-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${
                                    recipient.status === "sent"
                                      ? "bg-green-100 text-green-700"
                                      : recipient.status === "failed"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {recipient.status}
                                </span>
                              </td>
                              <td className="p-2 text-center">
                                {recipient.opened ? (
                                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="p-2 text-center">
                                {recipient.clicked ? (
                                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-8 text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700">
                  Select a Campaign
                </h3>
                <p className="text-gray-500 mt-2">
                  Choose a campaign to view details or create a new one
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Email Templates</h2>
            <div className="flex gap-2">
              <button
                onClick={seedTemplates}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 text-sm"
                data-testid="load-default-templates-btn"
              >
                Load Defaults
              </button>
              <button
                onClick={() => openTemplateEditor()}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"
                data-testid="open-visual-template-editor-btn"
              >
                <PenTool className="h-4 w-4" />
                Visual Editor
              </button>
              <button
                onClick={() => setShowNewTemplate(true)}
                className="px-3 py-1 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022d6e] flex items-center gap-1 text-sm"
                data-testid="new-template-btn"
              >
                <Plus className="h-4 w-4" />
                Quick Add
              </button>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No templates yet</p>
              <button
                onClick={seedTemplates}
                className="text-[#3A4E63] underline text-sm mt-2"
              >
                Load default templates
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.template_id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {template.subject}
                  </p>
                  <div className="text-xs text-gray-400 mb-3">
                    Variables: {template.variables?.join(", ") || "None"}
                  </div>
                  <button
                    onClick={() => openTemplateEditor(template)}
                    className="w-full px-3 py-1.5 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 text-sm"
                    data-testid={`edit-template-${template.template_id}`}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, name: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  placeholder="e.g., January Newsletter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Template *
                </label>
                <select
                  value={newCampaign.template_id}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      template_id: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Select a template</option>
                  {templates.map((t) => (
                    <option key={t.template_id} value={t.template_id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject Override (optional)
                </label>
                <input
                  type="text"
                  value={newCampaign.subject_override}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      subject_override: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                  placeholder="Leave empty to use template subject"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={createCampaign}
                className="flex-1 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022d6e]"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewCampaign(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Template Modal */}
      {showNewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Create New Template</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        category: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="general">General</option>
                    <option value="marketing">Marketing</option>
                    <option value="transactional">Transactional</option>
                    <option value="newsletter">Newsletter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={newTemplate.subject}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, subject: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  placeholder="Use {{variable}} for dynamic content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Body (HTML) *
                </label>
                <textarea
                  value={newTemplate.body_html}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      body_html: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2 font-mono text-sm"
                  rows={10}
                  placeholder="<div>Your email content here...</div>"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={createTemplate}
                className="flex-1 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022d6e]"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewTemplate(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Recipients Modal */}
      {showAddRecipients && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h2 className="text-xl font-semibold mb-4">Add Recipients</h2>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email Addresses
              </label>
              <textarea
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                className="w-full border rounded-lg p-2"
                rows={6}
                placeholder="Enter email addresses, one per line or comma-separated"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple emails with commas or new lines
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={addRecipients}
                className="flex-1 px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022d6e]"
              >
                Add Recipients
              </button>
              <button
                onClick={() => {
                  setShowAddRecipients(false);
                  setRecipientInput("");
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Email Template Editor Modal */}
      {showTemplateEditor && editingTemplate && (
        <EmailTemplateEditor
          template={editingTemplate}
          onSave={handleTemplateSave}
          onCancel={() => {
            setShowTemplateEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default EmailCampaigns;
