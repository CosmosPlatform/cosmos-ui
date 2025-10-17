"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Settings, Edit, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  getSentinelSettings,
  updateSentinelSettings,
  type GetSentinelSettingsResponse,
} from "@/lib/api/monitoring/monitoring";

// Helper functions to convert between seconds and time components
function secondsToTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

function timeToSeconds(hours: number, minutes: number, seconds: number) {
  return hours * 3600 + minutes * 60 + seconds;
}

export function SentinelSettings() {
  const [settings, setSettings] = useState<GetSentinelSettingsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const result = await getSentinelSettings();
    if (result.error) {
      toast.error("Failed to fetch sentinel settings");
      console.error("Failed to fetch sentinel settings:", result.error);
    } else {
      setSettings(result.data);
    }
    setIsLoading(false);
  };

  const handleEditClick = () => {
    if (!settings) return;

    // Initialize form with current settings
    setEnabled(settings.enabled);
    const time = secondsToTime(settings.interval);
    setHours(time.hours);
    setMinutes(time.minutes);
    setSeconds(time.seconds);
    setError("");
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    if (enabled) {
      const totalSeconds = timeToSeconds(hours, minutes, seconds);
      if (totalSeconds <= 0) {
        setError("Interval must be greater than 0 when enabled");
        return false;
      }
      if (totalSeconds < 60) {
        setError("Interval must be at least 60 seconds (1 minute)");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    const totalSeconds = timeToSeconds(hours, minutes, seconds);

    const result = await updateSentinelSettings({
      enabled,
      interval: totalSeconds,
    });

    if (result.error) {
      toast.error("Failed to update sentinel settings");
      console.error("Failed to update sentinel settings:", result.error);
      setError(result.error.error || "Failed to update settings");
    } else {
      toast.success("Sentinel settings updated successfully");
      setIsDialogOpen(false);
      setError("");
      fetchSettings();
    }

    setIsSaving(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setError("");
    }
    setIsDialogOpen(open);
  };

  const formatInterval = (intervalSeconds: number) => {
    const time = secondsToTime(intervalSeconds);
    const parts = [];
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);
    if (time.seconds > 0) parts.push(`${time.seconds}s`);
    return parts.join(" ") || "0s";
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Sentinel Settings</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
          disabled={isLoading || !settings}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Settings
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : settings ? (
        <div className="bg-muted p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status</p>
              <p className="text-sm text-muted-foreground">
                Sentinel monitoring status
              </p>
            </div>
            <div className="flex items-center gap-2">
              {settings.enabled ? (
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                  Enabled
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                  Disabled
                </span>
              )}
            </div>
          </div>

          {settings.enabled && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Monitoring Interval</p>
                <p className="text-sm text-muted-foreground">
                  How often the sentinel checks applications
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-lg">
                  {formatInterval(settings.interval)}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load sentinel settings</AlertDescription>
        </Alert>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Sentinel Settings</DialogTitle>
            <DialogDescription>
              Configure the sentinel monitoring service settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Enabled Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="enabled"
                checked={enabled}
                onCheckedChange={(checked) => setEnabled(!!checked)}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="enabled" className="cursor-pointer">
                  Enable Sentinel Monitoring
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically monitor applications at regular intervals
                </p>
              </div>
            </div>

            {/* Interval Inputs */}
            {enabled && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Monitoring Interval</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set how often the sentinel should check applications
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      value={hours}
                      onChange={(e) =>
                        setHours(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minutes">Minutes</Label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) =>
                        setMinutes(
                          Math.min(
                            59,
                            Math.max(0, parseInt(e.target.value) || 0),
                          ),
                        )
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seconds">Seconds</Label>
                    <Input
                      id="seconds"
                      type="number"
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) =>
                        setSeconds(
                          Math.min(
                            59,
                            Math.max(0, parseInt(e.target.value) || 0),
                          ),
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Total interval:</strong>{" "}
                    {timeToSeconds(hours, minutes, seconds)} seconds (
                    {formatInterval(timeToSeconds(hours, minutes, seconds))})
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
