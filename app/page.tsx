import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  TrendingUp,
  PieChart,
  Shield,
  Banknote
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Professional Financial Management System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Streamline your business operations with our comprehensive accounting and financial management solution
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Get Started
              </Button>
            </Link>
            <Link href="/reports">
              <Button size="lg" variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                View Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold">Invoice Management</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Create and manage professional invoices, track payments, and monitor accounts receivable
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-semibold">Financial Tracking</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive ledger system for tracking income, expenses, and maintaining accurate financial records
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold">Advanced Analytics</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Generate detailed reports and insights to make informed business decisions
            </p>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-12">Why Choose Our Solution?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enterprise-grade security for your financial data
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-4 bg-rose-100 dark:bg-rose-900 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-rose-600 dark:text-rose-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Scalable</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Grows with your business needs
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-4 bg-amber-100 dark:bg-amber-900 rounded-full mb-4">
                <Banknote className="w-8 h-8 text-amber-600 dark:text-amber-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cost-Effective</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Affordable solution with premium features
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900 rounded-full mb-4">
                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">User-Friendly</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Intuitive interface for all skill levels
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses managing their finances with our platform
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Try It Now
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}