import React, { useState, useRef, useCallback } from "react";
import {
  Zap,
  GitBranch,
  Play,
  Clock,
  Bell,
  Mail,
  FileText,
  Trash2,
  Plus,
  GripVertical,
  Settings,
  X,
  Check,
} from "lucide-react";

const STEP_TYPES = [
  {
    id: "trigger",
    name: "Trigger",
    icon: Zap,
    color: "bg-yellow-100 border-yellow-400 text-yellow-700",
  },
  {
    id: "condition",
    name: "Condition",
    icon: GitBranch,
    color: "bg-blue-100 border-blue-400 text-blue-700",
  },
  {
    id: "action",
    name: "Action",
    icon: Play,
    color: "bg-green-100 border-green-400 text-green-700",
  },
  {
    id: "delay",
    name: "Delay",
    icon: Clock,
    color: "bg-orange-100 border-orange-400 text-orange-700",
  },
  {
    id: "notification",
    name: "Notification",
    icon: Bell,
    color: "bg-purple-100 border-purple-400 text-purple-700",
  },
  {
    id: "email",
    name: "Send Email",
    icon: Mail,
    color: "bg-pink-100 border-pink-400 text-pink-700",
  },
];

const ACTION_TYPES = [
  { id: "create_task", name: "Create Task" },
  { id: "send_notification", name: "Send Notification" },
  { id: "send_email", name: "Send Email" },
  { id: "update_record", name: "Update Record" },
  { id: "api_call", name: "API Call" },
];

const CONDITION_OPERATORS = [
  { id: "equals", name: "Equals" },
  { id: "not_equals", name: "Not Equals" },
  { id: "greater_than", name: "Greater Than" },
  { id: "less_than", name: "Less Than" },
  { id: "contains", name: "Contains" },
  { id: "is_empty", name: "Is Empty" },
  { id: "is_not_empty", name: "Is Not Empty" },
];

const VisualWorkflowEditor = ({ workflow, onSave, onCancel }) => {
  const [steps, setSteps] = useState(workflow?.steps || []);
  const [draggedStep, setDraggedStep] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showStepPalette, setShowStepPalette] = useState(false);
  const canvasRef = useRef(null);

  const generateStepId = () =>
    `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addStep = (stepType) => {
    const newStep = {
      step_id: generateStepId(),
      name: `New ${stepType.name}`,
      step_type: stepType.id,
      config: getDefaultConfig(stepType.id),
      next_steps: [],
      position: { x: 100 + steps.length * 50, y: 100 + steps.length * 80 },
    };
    setSteps([...steps, newStep]);
    setShowStepPalette(false);
    setSelectedStep(newStep);
  };

  const getDefaultConfig = (stepType) => {
    switch (stepType) {
      case "condition":
        return { field: "", operator: "equals", value: "" };
      case "action":
        return {
          type: "create_task",
          title: "",
          description: "",
          priority: "medium",
        };
      case "delay":
        return { delay_seconds: 60 };
      case "notification":
        return { title: "", message: "", notification_type: "info" };
      case "email":
        return { to: "", subject: "", body: "" };
      default:
        return {};
    }
  };

  const updateStep = (stepId, updates) => {
    setSteps(
      steps.map((s) => (s.step_id === stepId ? { ...s, ...updates } : s)),
    );
    if (selectedStep?.step_id === stepId) {
      setSelectedStep({ ...selectedStep, ...updates });
    }
  };

  const deleteStep = (stepId) => {
    setSteps(steps.filter((s) => s.step_id !== stepId));
    // Remove references from other steps
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        next_steps: s.next_steps.filter((id) => id !== stepId),
      })),
    );
    if (selectedStep?.step_id === stepId) {
      setSelectedStep(null);
    }
  };

  const connectSteps = (fromId, toId) => {
    if (fromId === toId) return;
    setSteps(
      steps.map((s) => {
        if (s.step_id === fromId) {
          const nextSteps = s.next_steps.includes(toId)
            ? s.next_steps.filter((id) => id !== toId)
            : [...s.next_steps, toId];
          return { ...s, next_steps: nextSteps };
        }
        return s;
      }),
    );
  };

  const handleDragStart = (e, step) => {
    setDraggedStep(step);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetStep) => {
    e.preventDefault();
    if (
      draggedStep &&
      targetStep &&
      draggedStep.step_id !== targetStep.step_id
    ) {
      connectSteps(draggedStep.step_id, targetStep.step_id);
    }
    setDraggedStep(null);
  };

  const moveStep = (stepId, direction) => {
    const index = steps.findIndex((s) => s.step_id === stepId);
    if (direction === "up" && index > 0) {
      const newSteps = [...steps];
      [newSteps[index - 1], newSteps[index]] = [
        newSteps[index],
        newSteps[index - 1],
      ];
      setSteps(newSteps);
    } else if (direction === "down" && index < steps.length - 1) {
      const newSteps = [...steps];
      [newSteps[index], newSteps[index + 1]] = [
        newSteps[index + 1],
        newSteps[index],
      ];
      setSteps(newSteps);
    }
  };

  const getStepTypeInfo = (type) =>
    STEP_TYPES.find((t) => t.id === type) || STEP_TYPES[0];

  const handleSave = () => {
    onSave({ ...workflow, steps });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Visual Workflow Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#022d6e] flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Save Workflow
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Step Palette */}
          <div className="w-64 border-r p-4 overflow-y-auto bg-gray-50">
            <h3 className="font-semibold mb-3 text-sm text-gray-600">
              Add Steps
            </h3>
            <div className="space-y-2">
              {STEP_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addStep(type)}
                  className={`w-full flex items-center gap-2 p-3 rounded-lg border-2 ${type.color} hover:shadow-md transition-shadow`}
                >
                  <type.icon className="h-5 w-5" />
                  <span className="font-medium">{type.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <h3 className="font-semibold mb-3 text-sm text-gray-600">Tips</h3>
              <ul className="text-xs text-gray-500 space-y-2">
                <li>• Drag steps to reorder</li>
                <li>• Click a step to configure</li>
                <li>• Connect steps by dragging from one to another</li>
                <li>• Use conditions for branching logic</li>
              </ul>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-4 overflow-auto bg-gray-100" ref={canvasRef}>
            {steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Zap className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">
                  Start building your workflow
                </p>
                <p className="text-sm">
                  Add steps from the palette on the left
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const typeInfo = getStepTypeInfo(step.step_type);
                  const Icon = typeInfo.icon;
                  return (
                    <div
                      key={step.step_id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, step)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, step)}
                      onClick={() => setSelectedStep(step)}
                      className={`relative p-4 rounded-lg border-2 bg-white cursor-pointer transition-all ${selectedStep?.step_id === step.step_id
                          ? "ring-2 ring-[#033F99] border-[#033F99]"
                          : "hover:shadow-md"
                        } ${typeInfo.color.split(" ")[0]} ${typeInfo.color.split(" ")[1]}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="cursor-grab">
                          <GripVertical className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 bg-white/50 rounded uppercase font-medium">
                              {step.step_type}
                            </span>
                            <span className="text-xs text-gray-500">
                              Step {index + 1}
                            </span>
                          </div>
                          <h4 className="font-medium mt-1">{step.name}</h4>
                          {step.config && (
                            <div className="text-sm text-gray-600 mt-1">
                              {step.step_type === "condition" && (
                                <span>
                                  If {step.config.field || "..."}{" "}
                                  {step.config.operator}{" "}
                                  {step.config.value || "..."}
                                </span>
                              )}
                              {step.step_type === "action" && (
                                <span>Action: {step.config.type}</span>
                              )}
                              {step.step_type === "delay" && (
                                <span>
                                  Wait {step.config.delay_seconds || 0} seconds
                                </span>
                              )}
                              {step.step_type === "notification" && (
                                <span>
                                  {step.config.title || "Notification"}
                                </span>
                              )}
                              {step.step_type === "email" && (
                                <span>To: {step.config.to || "..."}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStep(step.step_id, "up");
                            }}
                            className="p-1 hover:bg-white/50 rounded"
                            disabled={index === 0}
                          >
                            ↑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStep(step.step_id, "down");
                            }}
                            className="p-1 hover:bg-white/50 rounded"
                            disabled={index === steps.length - 1}
                          >
                            ↓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStep(step.step_id);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Connection indicator */}
                      {step.next_steps.length > 0 && (
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Properties Panel */}
          {selectedStep && (
            <div className="w-80 border-l p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Step Properties</h3>
                <button
                  onClick={() => setSelectedStep(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Step Name
                  </label>
                  <input
                    type="text"
                    value={selectedStep.name}
                    onChange={(e) =>
                      updateStep(selectedStep.step_id, { name: e.target.value })
                    }
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                {/* Condition Config */}
                {selectedStep.step_type === "condition" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Field
                      </label>
                      <input
                        type="text"
                        value={selectedStep.config?.field || ""}
                        onChange={(e) =>
                          updateStep(selectedStep.step_id, {
                            config: {
                              ...selectedStep.config,
                              field: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded-lg p-2"
                        placeholder="e.g., amount, status"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Operator
                      </label>
                      <select
                        value={selectedStep.config?.operator || "equals"}
                        onChange={(e) =>
                          updateStep(selectedStep.step_id, {
                            config: {
                              ...selectedStep.config,
                              operator: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded-lg p-2"
                      >
                        {CONDITION_OPERATORS.map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={selectedStep.config?.value || ""}
                        onChange={(e) =>
                          updateStep(selectedStep.step_id, {
                            config: {
                              ...selectedStep.config,
                              value: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                  </>
                )}

                {/* Action Config */}
                {selectedStep.step_type === "action" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Action Type
                      </label>
                      <select
                        value={selectedStep.config?.type || "create_task"}
                        onChange={(e) =>
                          updateStep(selectedStep.step_id, {
                            config: {
                              ...selectedStep.config,
                              type: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded-lg p-2"
                      >
                        {ACTION_TYPES.map((action) => (
                          <option key={action.id} value={action.id}>
                            {action.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={selectedStep.config?.title || ""}
                        onChange={(e) =>
                          updateStep(selectedStep.step_id, {
                            config: {
                              ...selectedStep.config,
                              title: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={selectedStep.config?.description || ""}
                        onChange={(e) =>
                          updateStep(selectedStep.step_id, {
                            config: {
                              ...selectedStep.config,
                              description: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded-lg p-2"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Priority
                      </label>
                      <select
                        value={selectedStep.config?.priority || "medium"}
                        onChange={(e) =>
                          updateStep(selectedStep.step_id, {
                            config: {
                              ...selectedStep.config,
                              priority: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Delay Config */}
                {selectedStep.step_type === "delay" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Delay (seconds)
                    </label>
                    <input
                      type="number"
                      value={selectedStep.config?.delay_seconds || 60}
                      onChange={(e) =>
                        updateStep(selectedStep.step_id, {
                          config: {
                            ...selectedStep.config,
                            delay_seconds: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full border rounded-lg p-2"
                      min={0}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ={" "}
                      {Math.floor(
                        (selectedStep.config?.delay_seconds || 0) / 60,
                      )}{" "}
                      min {(selectedStep.config?.delay_seconds || 0) % 60} sec
                    </p>
                  </div>
                )}

                {/* Notification Config */}
                {(selectedStep.step_type === "notification" ||
                  selectedStep.step_type === "trigger") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={selectedStep.config?.title || ""}
                          onChange={(e) =>
                            updateStep(selectedStep.step_id, {
                              config: {
                                ...selectedStep.config,
                                title: e.target.value,
                              },
                            })
                          }
                          className="w-full border rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Message
                        </label>
                        <textarea
                          value={selectedStep.config?.message || ""}
                          onChange={(e) =>
                            updateStep(selectedStep.step_id, {
                              config: {
                                ...selectedStep.config,
                                message: e.target.value,
                              },
                            })
                          }
                          className="w-full border rounded-lg p-2"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                {/* Email Config */}
                {selectedStep.step_type === "email" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        To
                      </label>
                      <input
                        type="text"
                        value={selectedStep.config?.to || ""}
                        onChange={(e) =>
                          updateStep(selectedStep.step_id, {
                            config: {
                              ...selectedStep.config,
                              to: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded-lg p-2"
                        placeholder="{{user_email}} or email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={selectedStep.config?.subject || ""}
                        onChange={(e) =>
                          updateStep(selectedStep.step_id, {
                            config: {
                              ...selectedStep.config,
                              subject: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Body
                      </label>
                      <textarea
                        value={selectedStep.config?.body || ""}
                        onChange={(e) =>
                          updateStep(selectedStep.step_id, {
                            config: {
                              ...selectedStep.config,
                              body: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded-lg p-2"
                        rows={4}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualWorkflowEditor;
