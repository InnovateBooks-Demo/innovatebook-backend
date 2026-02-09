import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Check,
  AlertCircle,
  Download,
  Cloud,
} from "lucide-react";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { authService } from "../utils/auth";
import { toast } from "sonner";

const OfflineIndicator = ({ showDetails = false }) => {
  const {
    isOnline,
    syncStatus,
    lastSyncTime,
    cacheStatus,
    prefetchData,
    clearCache,
    triggerSync,
  } = useOfflineSync();
  const [showPanel, setShowPanel] = useState(false);

  // Don't show anything if online and no details needed
  if (isOnline && !showDetails && !showPanel) {
    return null;
  }

  const handlePrefetch = async () => {
    const token = authService.getToken();
    if (!token) {
      toast.error("Please log in to enable offline mode");
      return;
    }

    toast.info("Downloading finance data for offline use...");
    const result = await prefetchData(token);
    if (result?.success) {
      toast.success("Finance data cached for offline use");
    } else {
      toast.error("Failed to cache data");
    }
  };

  const handleClearCache = async () => {
    await clearCache();
    toast.success("Offline cache cleared");
  };

  const formatTime = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Offline banner (shown when offline)
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <div className="bg-amber-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <WifiOff className="h-5 w-5" />
          <div>
            <p className="font-medium">You're offline</p>
            <p className="text-xs text-amber-100">Showing cached data</p>
          </div>
          {cacheStatus.cached && (
            <div className="ml-2 px-2 py-1 bg-amber-600 rounded text-xs">
              {cacheStatus.endpoints.length} pages cached
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed panel (for settings or dashboard)
  if (showDetails) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOnline ? "bg-green-100" : "bg-amber-100"}`}
            >
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Offline Mode</h3>
              <p className="text-sm text-gray-500">
                {isOnline ? "Connected" : "Working offline"}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isOnline
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Sync Status */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cache Status</span>
            <span className="text-sm font-medium">
              {cacheStatus.cached
                ? `${cacheStatus.endpoints.length} pages`
                : "Not cached"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Sync</span>
            <span className="text-sm font-medium">
              {formatTime(lastSyncTime)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handlePrefetch}
            disabled={syncStatus === "syncing"}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-700 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {syncStatus === "syncing" ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {syncStatus === "syncing" ? "Syncing..." : "Download for Offline"}
          </button>

          {cacheStatus.cached && (
            <button
              onClick={handleClearCache}
              className="px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear Cache
            </button>
          )}
        </div>

        {/* Cached Endpoints */}
        {cacheStatus.cached && cacheStatus.endpoints.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Cached Pages:</p>
            <div className="flex flex-wrap gap-1">
              {cacheStatus.endpoints.slice(0, 5).map((url, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {url.split("/").pop() || "dashboard"}
                </span>
              ))}
              {cacheStatus.endpoints.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{cacheStatus.endpoints.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Minimal indicator (floating button)
  return (
    <button
      onClick={() => setShowPanel(!showPanel)}
      className="fixed bottom-4 right-4 z-50 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50"
    >
      {syncStatus === "syncing" ? (
        <RefreshCw className="h-5 w-5 text-[#033F99] animate-spin" />
      ) : cacheStatus.cached ? (
        <Cloud className="h-5 w-5 text-green-600" />
      ) : (
        <Wifi className="h-5 w-5 text-gray-400" />
      )}
    </button>
  );
};

export default OfflineIndicator;
