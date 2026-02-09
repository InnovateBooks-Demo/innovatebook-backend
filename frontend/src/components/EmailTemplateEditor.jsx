import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Link,
  Image,
  Code,
  Undo,
  Redo,
  Type,
  Palette,
  Save,
  X,
  Eye,
  EyeOff,
  Variable,
} from "lucide-react";

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px"];
const COLORS = [
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#3A4E63",
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#ca8a04",
];
const VARIABLES = [
  { name: "first_name", label: "First Name" },
  { name: "last_name", label: "Last Name" },
  { name: "company_name", label: "Company Name" },
  { name: "email", label: "Email" },
  { name: "amount", label: "Amount" },
  { name: "invoice_number", label: "Invoice Number" },
  { name: "due_date", label: "Due Date" },
  { name: "cta_url", label: "CTA URL" },
];

const EmailTemplateEditor = ({ template, onSave, onCancel }) => {
  const [subject, setSubject] = useState(template?.subject || "");
  const [htmlContent, setHtmlContent] = useState(
    template?.body_html || getDefaultTemplate(),
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const editorRef = useRef(null);

  function getDefaultTemplate() {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #3A4E63;">Email Title</h1>
  <p>Hello {{first_name}},</p>
  <p>Your email content goes here...</p>
  <a href="{{cta_url}}" style="display: inline-block; padding: 12px 24px; background: #3A4E63; color: white; text-decoration: none; border-radius: 6px;">Call to Action</a>
  <p style="margin-top: 24px; color: #666;">Best regards,<br>Your Team</p>
</div>`;
  }

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertVariable = (variable) => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const varSpan = document.createElement("span");
      varSpan.className = "variable-tag";
      varSpan.style.cssText =
        "background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-family: monospace;";
      varSpan.textContent = `{{${variable}}}`;
      range.deleteContents();
      range.insertNode(varSpan);
      range.setStartAfter(varSpan);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    setShowVariables(false);
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
  };

  const handleSave = () => {
    const detectedVariables = [];
    const variableMatches = htmlContent.match(/\{\{(\w+)\}\}/g);
    if (variableMatches) {
      variableMatches.forEach((match) => {
        const varName = match.replace(/\{\{|\}\}/g, "");
        if (!detectedVariables.includes(varName)) {
          detectedVariables.push(varName);
        }
      });
    }

    onSave({
      ...template,
      subject,
      body_html: htmlContent,
      variables: detectedVariables,
    });
  };

  const getPreviewHtml = () => {
    let preview = htmlContent;
    // Replace variables with sample data
    preview = preview.replace(/\{\{first_name\}\}/g, "John");
    preview = preview.replace(/\{\{last_name\}\}/g, "Doe");
    preview = preview.replace(/\{\{company_name\}\}/g, "Acme Corp");
    preview = preview.replace(/\{\{email\}\}/g, "john@acme.com");
    preview = preview.replace(/\{\{amount\}\}/g, "₹50,000");
    preview = preview.replace(/\{\{invoice_number\}\}/g, "INV-001");
    preview = preview.replace(/\{\{due_date\}\}/g, "Jan 30, 2026");
    preview = preview.replace(/\{\{cta_url\}\}/g, "#");
    return preview;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Email Template Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${showPreview ? "bg-blue-50 border-blue-300" : ""}`}
            >
              {showPreview ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showPreview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022d6e] flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Template
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Subject Line */}
        <div className="p-4 border-b bg-gray-50">
          <label className="block text-sm font-medium mb-1">Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="Enter email subject..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Use {"{{variable}}"} for dynamic content
          </p>
        </div>

        {showPreview ? (
          /* Preview Mode */
          <div className="flex-1 overflow-auto p-4 bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
              <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                <p className="text-sm text-gray-500">Subject:</p>
                <p className="font-medium">
                  {subject
                    .replace(/\{\{first_name\}\}/g, "John")
                    .replace(/\{\{company_name\}\}/g, "Acme Corp")}
                </p>
              </div>
              <div
                className="p-4"
                dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
              />
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
              {/* Text Formatting */}
              <div className="flex items-center gap-1 pr-2 border-r">
                <button
                  onClick={() => execCommand("bold")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  onClick={() => execCommand("italic")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => execCommand("underline")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </button>
              </div>

              {/* Font Size */}
              <div className="flex items-center gap-1 px-2 border-r">
                <select
                  onChange={(e) => execCommand("fontSize", e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                  defaultValue="3"
                >
                  <option value="1">Small</option>
                  <option value="3">Normal</option>
                  <option value="5">Large</option>
                  <option value="7">X-Large</option>
                </select>
              </div>

              {/* Alignment */}
              <div className="flex items-center gap-1 px-2 border-r">
                <button
                  onClick={() => execCommand("justifyLeft")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => execCommand("justifyCenter")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => execCommand("justifyRight")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
              </div>

              {/* Lists */}
              <div className="flex items-center gap-1 px-2 border-r">
                <button
                  onClick={() => execCommand("insertUnorderedList")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => execCommand("insertOrderedList")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Numbered List"
                >
                  <span className="text-sm font-medium">1.</span>
                </button>
              </div>

              {/* Link */}
              <div className="flex items-center gap-1 px-2 border-r">
                <button
                  onClick={() => {
                    const url = prompt("Enter URL:");
                    if (url) execCommand("createLink", url);
                  }}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Insert Link"
                >
                  <Link className="h-4 w-4" />
                </button>
              </div>

              {/* Color */}
              <div className="relative px-2 border-r">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
                  title="Text Color"
                >
                  <Palette className="h-4 w-4" />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10">
                    <div className="grid grid-cols-3 gap-1">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            execCommand("foreColor", color);
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Variables */}
              <div className="relative px-2">
                <button
                  onClick={() => setShowVariables(!showVariables)}
                  className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
                  title="Insert Variable"
                >
                  <Variable className="h-4 w-4" />
                  <span className="text-sm">Variables</span>
                </button>
                {showVariables && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]">
                    <p className="text-xs text-gray-500 mb-2">
                      Click to insert
                    </p>
                    <div className="space-y-1">
                      {VARIABLES.map((v) => (
                        <button
                          key={v.name}
                          onClick={() => insertVariable(v.name)}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                        >
                          <span className="font-mono text-blue-600">{`{{${v.name}}}`}</span>
                          <span className="text-gray-500 ml-2">{v.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Undo/Redo */}
              <div className="flex items-center gap-1 px-2">
                <button
                  onClick={() => execCommand("undo")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Undo"
                >
                  <Undo className="h-4 w-4" />
                </button>
                <button
                  onClick={() => execCommand("redo")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Redo"
                >
                  <Redo className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-auto p-4">
              <div
                ref={editorRef}
                contentEditable
                className="min-h-full p-4 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4E63]"
                onInput={handleContentChange}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{ minHeight: "400px" }}
              />
            </div>

            {/* HTML Source Toggle */}
            <div className="p-2 border-t bg-gray-50">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  <Code className="h-4 w-4 inline mr-1" />
                  View HTML Source
                </summary>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full mt-2 p-2 border rounded font-mono text-xs"
                  rows={8}
                />
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
