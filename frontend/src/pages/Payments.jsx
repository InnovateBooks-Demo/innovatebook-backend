import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const Payments = () => {
  return (
    <div className="p-8" data-testid="payments-page">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "Inter", color: "#033F99" }}
        >
          Payments
        </h1>
        <p className="text-gray-600">
          Manage vendor payments and disbursements
        </p>
      </div>

      <Card className="chart-container">
        <CardHeader>
          <CardTitle
            className="text-xl font-semibold"
            style={{ color: "#033F99" }}
          >
            Payments Dashboard
          </CardTitle>
          <CardDescription>
            Track scheduled and completed payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">
              Payment management features coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
