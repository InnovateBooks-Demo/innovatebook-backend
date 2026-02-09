import React from "react";
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import {
  useOfflineSync,
  useConflictResolution,
  useOfflineActions,
} from "../hooks/useOfflineSync";
import { toast } from "sonner";

/**
 * Offline status indicator component - shows connection status and sync state
 */
export const OfflineStatusIndicator = ({ className = "" }) => {
  const { isOnline, syncStatus, lastSyncTime, prefetchData, triggerSync } =
    useOfflineSync();
  const { pendingCount, hasPending, syncNow } = useOfflineActions();
  const { hasConflicts, conflicts } = useConflictResolution();

  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline");
      return;
    }

    try {
      await syncNow();
      toast.success("Sync triggered");
    } catch (error) {
      toast.error("Sync failed");
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return "bg-red-500";
    if (hasConflicts) return "bg-yellow-500";
    if (hasPending) return "bg-orange-500";
    if (syncStatus === "syncing") return "bg-blue-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (hasConflicts)
      return `${conflicts.length} Conflict${conflicts.length > 1 ? "s" : ""}`;
    if (hasPending) return `${pendingCount} Pending`;
    if (syncStatus === "syncing") return "Syncing...";
    return "Online";
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-medium ${getStatusColor()}`}
      >
        {isOnline ? (
          <>
            {syncStatus === "syncing" ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : hasConflicts ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <Wifi className="w-3 h-3" />
            )}
          </>
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span>{getStatusText()}</span>
      </div>

      {isOnline && (hasPending || syncStatus === "idle") && (
        <button
          onClick={handleSync}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          title="Sync now"
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-500 ${syncStatus === "syncing" ? "animate-spin" : ""}`}
          />
        </button>
      )}

      {lastSyncTime && (
        <span className="text-xs text-gray-400">
          Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

/**
 * Conflict resolution modal - shows and resolves sync conflicts
 */
export const ConflictResolutionModal = ({ onClose }) => {
  const { conflicts, resolving, resolveConflict, autoResolveConflicts } =
    useConflictResolution();

  if (conflicts.length === 0) {
    return null;
  }

  const handleResolve = async (changeId, resolution, mergedData = null) => {
    const result = await resolveConflict(changeId, resolution, mergedData);
    if (result.success) {
      toast.success(`Conflict resolved: ${result.resolution}`);
    } else {
      toast.error("Failed to resolve conflict");
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-yellow-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Sync Conflicts Detected
              </h3>
              <p className="text-sm text-gray-500">
                {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}{" "}
                need resolution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {conflicts.map((conflict, index) => (
              <div
                key={conflict.change.id || index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {conflict.change.endpoint || "Unknown endpoint"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Local: {formatDate(conflict.change.timestamp)}
                    </p>
                    {conflict.serverData?.updated_at && (
                      <p className="text-xs text-gray-500">
                        Server:{" "}
                        {formatDate(
                          new Date(conflict.serverData.updated_at).getTime(),
                        )}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                    {conflict.conflictType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-700 mb-1">
                      Your Changes
                    </p>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-24">
                      {JSON.stringify(conflict.change.data, null, 2)}
                    </pre>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-700 mb-1">
                      Server Version
                    </p>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-24">
                      {JSON.stringify(conflict.serverData, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleResolve(conflict.change.id, "USE_SERVER")
                    }
                    disabled={resolving}
                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium disabled:opacity-50"
                  >
                    <Cloud className="w-4 h-4 inline mr-1" />
                    Use Server Version
                  </button>
                  <button
                    onClick={() =>
                      handleResolve(conflict.change.id, "USE_LOCAL")
                    }
                    disabled={resolving}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium disabled:opacity-50"
                  >
                    <CloudOff className="w-4 h-4 inline mr-1" />
                    Use My Version
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={() => autoResolveConflicts("USE_SERVER")}
            disabled={resolving}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm disabled:opacity-50"
          >
            Accept All Server Versions
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#022B6B] text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Pending actions badge - shows count of pending offline actions
 */
export const PendingActionsBadge = ({ className = "" }) => {
  const { pendingCount, hasPending } = useOfflineActions();

  if (!hasPending) return null;

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full ${className}`}
    >
      {pendingCount}
    </span>
  );
};

export default OfflineStatusIndicator;
