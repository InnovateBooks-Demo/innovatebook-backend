import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { authService } from "../utils/auth";

const Settings = () => {
  const user = authService.getUser();

  return (
    <div className="p-8" data-testid="settings-page">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "Inter", color: "#033F99" }}
        >
          Settings
        </h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Company Settings */}
        <Card className="chart-container" data-testid="company-settings-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ color: "#033F99" }}
            >
              Company Information
            </CardTitle>
            <CardDescription>Basic company details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    placeholder="Innovate Books"
                    defaultValue="Innovate Books"
                    data-testid="company-name-input"
                  />
                </div>
                <div>
                  <Label>Financial Year Start</Label>
                  <Input
                    type="date"
                    defaultValue="2025-04-01"
                    data-testid="fy-start-input"
                  />
                </div>
                <div>
                  <Label>GSTIN</Label>
                  <Input
                    placeholder="27AAAAA0000A1Z5"
                    data-testid="gstin-input"
                  />
                </div>
                <div>
                  <Label>PAN</Label>
                  <Input placeholder="AAAAA0000A" data-testid="pan-input" />
                </div>
              </div>
              <Button className="mt-4" data-testid="save-company-btn">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card className="chart-container" data-testid="user-profile-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ color: "#033F99" }}
            >
              User Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    defaultValue={user?.full_name}
                    data-testid="user-name-input"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    data-testid="user-email-input"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input
                    defaultValue={user?.role}
                    disabled
                    data-testid="user-role-input"
                  />
                </div>
              </div>
              <Button className="mt-4" data-testid="save-profile-btn">
                Update Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card className="chart-container" data-testid="tax-settings-card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ color: "#033F99" }}
            >
              Tax Settings
            </CardTitle>
            <CardDescription>Configure tax rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>GST Rate (%)</Label>
                  <Input
                    type="number"
                    defaultValue="18"
                    data-testid="gst-rate-input"
                  />
                </div>
                <div>
                  <Label>TDS Rate (%)</Label>
                  <Input
                    type="number"
                    defaultValue="10"
                    data-testid="tds-rate-input"
                  />
                </div>
                <div>
                  <Label>Default Payment Terms</Label>
                  <Input
                    defaultValue="Net 30"
                    data-testid="payment-terms-input"
                  />
                </div>
              </div>
              <Button className="mt-4" data-testid="save-tax-btn">
                Save Tax Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card
          className="chart-container"
          data-testid="notification-settings-card"
        >
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold"
              style={{ color: "#033F99" }}
            >
              Notifications
            </CardTitle>
            <CardDescription>Manage alert preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive alerts via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5"
                  data-testid="email-notif-toggle"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Overdue Invoice Alerts</p>
                  <p className="text-sm text-gray-600">
                    Get notified about overdue invoices
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5"
                  data-testid="overdue-alert-toggle"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Low Cash Alerts</p>
                  <p className="text-sm text-gray-600">
                    Alert when cash balance is low
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5"
                  data-testid="low-cash-alert-toggle"
                />
              </div>
              <Button className="mt-4" data-testid="save-notifications-btn">
                Save Notification Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
