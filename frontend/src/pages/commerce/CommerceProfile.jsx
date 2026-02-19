import React, { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { authService } from "../../utils/auth";
import { toast } from "sonner";

const CommerceProfile = () => {
  const user = authService.getUser();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    company: "",
    location: "",
    role: user?.role || "Commerce Manager",
  });

  const handleSave = () => {
    // TODO: API call to update profile
    toast.success("Profile updated successfully");
    setEditing(false);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            My Profile
          </h2>
          <p className="text-slate-600 mt-1">
            Manage your personal information and preferences
          </p>
        </div>

        {!editing ? (
          <Button onClick={() => setEditing(true)} className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#033F99] to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">
                {formData.full_name?.charAt(0) || "U"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {formData.full_name}
            </h3>
            <p className="text-sm text-slate-600 mb-4">{formData.role}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>Joined Jan 2025</span>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2 p-6 bg-white border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  disabled={!editing}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!editing}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={!editing}
                  placeholder="+91 XXXXX XXXXX"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <div className="relative mt-2">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  disabled={!editing}
                  placeholder="Your Company"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  disabled={!editing}
                  placeholder="City, Country"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                disabled
                className="mt-2 h-11 bg-slate-50"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Leads Created", value: "24", icon: User },
          { label: "Invoices Generated", value: "156", icon: Mail },
          { label: "Contracts Signed", value: "18", icon: Building2 },
          { label: "Total Revenue", value: "₹24.5M", icon: MapPin },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={`item-${index}`}
              className="p-5 bg-white border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#C4D9F4] rounded-xl flex items-center justify-center">
                  <Icon className="h-6 w-6 text-[#033F99]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CommerceProfile;
