"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, Calendar } from "lucide-react"

interface BillHistoryProps {
  bills: any[]
}

export function BillHistory({ bills }: BillHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const filteredBills = bills
    .filter((bill) => {
      const matchesSearch =
        bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || bill.type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === "amount") {
        return b.total - a.total
      } else if (sortBy === "customer") {
        return a.customerName.localeCompare(b.customerName)
      }
      return 0
    })

  const generateInvoice = (bill: any) => {
    const invoiceContent = `
      <html>
        <head>
          <title>Invoice - ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { text-align: right; }
            .total-row { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p>Bill #: ${bill.billNumber}</p>
            <p>Date: ${new Date(bill.date).toLocaleDateString()}</p>
          </div>
          
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${bill.customerName}</strong></p>
            <p>${bill.customerPhone}</p>
            <p>${bill.customerAddress}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items
                .map(
                  (item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: $${bill.subtotal.toFixed(2)}</p>
            <p>Discount (${bill.discount}%): -$${bill.discountAmount.toFixed(2)}</p>
            <p>Tax (${bill.tax}%): $${bill.taxAmount.toFixed(2)}</p>
            <p class="total-row">Total: $${bill.total.toFixed(2)}</p>
          </div>
          
          ${bill.notes ? `<div><h3>Notes:</h3><p>${bill.notes}</p></div>` : ""}
        </body>
      </html>
    `

    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(invoiceContent)
      newWindow.document.close()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill History</CardTitle>
        <CardDescription>View and manage all your bills</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer name or bill number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bills List */}
        {filteredBills.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No bills found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {bills.length === 0
                ? "Get started by creating your first bill."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBills.map((bill) => (
              <Card key={bill.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{bill.customerName}</h3>
                      <Badge variant={bill.type === "retail" ? "default" : "secondary"}>{bill.type}</Badge>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Bill #: {bill.billNumber}</p>
                      <p>Date: {new Date(bill.date).toLocaleDateString()}</p>
                      <p>Items: {bill.items.length}</p>
                      {bill.customerPhone && <p>Phone: {bill.customerPhone}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end space-y-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold">${bill.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Subtotal: ${bill.subtotal.toFixed(2)}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => generateInvoice(bill)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => generateInvoice(bill)}>
                        <Download className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>

                {bill.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Notes:</strong> {bill.notes}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredBills.length > 0 && (
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{filteredBills.length}</p>
                  <p className="text-sm text-gray-600">Total Bills</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ${filteredBills.reduce((sum, bill) => sum + bill.total, 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredBills.filter((bill) => bill.type === "retail").length}</p>
                  <p className="text-sm text-gray-600">Retail Bills</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filteredBills.filter((bill) => bill.type === "wholesale").length}
                  </p>
                  <p className="text-sm text-gray-600">Wholesale Bills</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
