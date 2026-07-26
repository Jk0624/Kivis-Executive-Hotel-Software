import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

import ReportTabs from "../../components/admin/reports/ReportTabs";
import OperationalReport from "../../components/admin/reports/OperationalReport";
import BookingReport from "../../components/admin/reports/BookingReport";
import RevenueReport from "../../components/admin/reports/RevenueReport";
import AccessLogReport from "../../components/admin/reports/AccessLogReport";
import SecurityAuditReport from "../../components/admin/reports/SecurityAuditReport";

type ReportTab =
  | "operations"
  | "bookings"
  | "revenue"
  | "access"
  | "audit";

export default function SecurityAudit() {
  const [activeTab, setActiveTab] =
    useState<ReportTab>("operations");

  const renderActiveReport = () => {
    switch (activeTab) {
      case "operations":
        return <OperationalReport />;

      case "bookings":
        return <BookingReport />;

      case "revenue":
        return <RevenueReport />;

      case "access":
        return <AccessLogReport />;

      case "audit":
        return <SecurityAuditReport />;

      default:
        return <OperationalReport />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Operations & Reports Center
            </h1>

            <p className="mt-2 max-w-3xl text-slate-500">
              View operational insights, bookings, revenue,
              access activities and security audit records for
              KIVIS Executive Lodge from a single workspace.
            </p>

          </div>

        </div>

        <ReportTabs
          activeTab={activeTab}
          onChange={(tab) =>
            setActiveTab(tab as ReportTab)
          }
        />

        {renderActiveReport()}

      </div>
    </AdminLayout>
  );
}