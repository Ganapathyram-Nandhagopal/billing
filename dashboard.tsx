"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BillForm } from "@/components/bill-form"
import { BillHistory } from "@/components/bill-history"
import { Settings } from "@/components/settings"
import { UserManagement } from "@/components/user-management"
import {
  LayoutDashboard,
  FileText,
  History,
  SettingsIcon,
  Users,
  LogOut,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertCircle,
} from "lucide-react"

interface DashboardProps {
  user: any
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [bills, setBills] = useState<any[]>([])
  const [settings, setSettings] = useState({
    billLimit: 100,
    currentBillCount: 0,
    companyName: "Your Company",
    companyAddress: "123 Business St, City, State 12345",
    companyPhone: "+1 (555) 123-4567",
    companyEmail: "info@yourcompany.com",
  })

  useEffect(() => {
    const savedBills = localStorage.getItem("bills")
    const savedSettings = localStorage.getItem("billSettings")

    if (savedBills) {
      const parsedBills = JSON.parse(savedBills)
      setBills(parsedBills)
      setSettings((prev) => ({ ...prev, currentBillCount: parsedBills.length }))
    }

    if (savedSettings) {
      setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }))
    }
  }, [])

  const addBill = (newBill: any) => {
    if (settings.currentBillCount >= settings.billLimit) {
      alert("Bill limit reached! Please increase the limit in settings.")
      return false
    }

    const billWithId = { ...newBill, id: Date.now(), date: new Date().toISOString() }
    const updatedBills = [...bills, billWithId]
    setBills(updatedBills)
    setSettings((prev) => ({ ...prev, currentBillCount: updatedBills.length }))
    localStorage.setItem("bills", JSON.stringify(updatedBills))
    return true
  }

  const updateSettings = (newSettings: any) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
    localStorage.setItem("billSettings", JSON.stringify(newSettings))
  }

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0)
  const retailBills = bills.filter((bill) => bill.type === "retail").length
  const wholesaleBills = bills.filter((bill) => bill.type === "wholesale").length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Mobile Billing</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="create-bill" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Create Bill</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">From {bills.length} bills</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bills.length}</div>
                  <p className="text-xs text-muted-foreground">Limit: {settings.billLimit}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retail Bills</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{retailBills}</div>
                  <p className="text-xs text-muted-foreground">Individual customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wholesale Bills</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{wholesaleBills}</div>
                  <p className="text-xs text-muted-foreground">Business customers</p>
                </CardContent>
              </Card>
            </div>

            {/* Bill Limit Warning */}
            {settings.currentBillCount >= settings.billLimit * 0.9 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-800">
                    <AlertCircle className="w-5 h-5" />
                    <span>Bill Limit Warning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700">
                    You have used {settings.currentBillCount} out of {settings.billLimit} bills. Consider increasing
                    your limit in settings.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Recent Bills */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bills</CardTitle>
                <CardDescription>Your latest billing activity</CardDescription>
              </CardHeader>
              <CardContent>
                {bills.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No bills created yet</p>
                ) : (
                  <div className="space-y-4">
                    {bills
                      .slice(-5)
                      .reverse()
                      .map((bill) => (
                        <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{bill.customerName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(bill.date).toLocaleDateString()} •
                              <Badge variant={bill.type === "retail" ? "default" : "secondary"} className="ml-2">
                                {bill.type}
                              </Badge>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${bill.total.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{bill.items.length} items</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-bill">
            <BillForm onAddBill={addBill} settings={settings} />
          </TabsContent>

          <TabsContent value="history">
            <BillHistory bills={bills} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings">
            <Settings settings={settings} onUpdateSettings={updateSettings} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
