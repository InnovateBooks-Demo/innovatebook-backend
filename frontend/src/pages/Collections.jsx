import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const Collections = () => {
  return (
    <div className="p-8" data-testid="collections-page">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "Inter", color: "#033F99" }}
        >
          Collections
        </h1>
        <p className="text-gray-600">Manage overdue invoices and follow-ups</p>
      </div>

      <Card className="chart-container">
        <CardHeader>
          <CardTitle
            className="text-xl font-semibold"
            style={{ color: "#033F99" }}
          >
            Collections Dashboard
          </CardTitle>
          <CardDescription>
            Track follow-ups and recovery management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">
              Collections management features coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Collections;
