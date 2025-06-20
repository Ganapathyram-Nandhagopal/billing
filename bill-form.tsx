"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, FileText, Download } from "lucide-react"

interface BillFormProps {
  onAddBill: (bill: any) => boolean
  settings: any
}

interface BillItem {
  id: number
  name: string
  quantity: number
  price: number
  total: number
}

export function BillForm({ onAddBill, settings }: BillFormProps) {
  const [billType, setBillType] = useState<"retail" | "wholesale">("retail")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [items, setItems] = useState<BillItem[]>([{ id: 1, name: "", quantity: 1, price: 0, total: 0 }])
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [notes, setNotes] = useState("")

  const addItem = () => {
    const newItem: BillItem = {
      id: Date.now(),
      name: "",
      quantity: 1,
      price: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: number, field: keyof BillItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "price") {
            updatedItem.total = updatedItem.quantity * updatedItem.price
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = (subtotal * discount) / 100
  const taxAmount = ((subtotal - discountAmount) * tax) / 100
  const total = subtotal - discountAmount + taxAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim()) {
      alert("Please enter customer name")
      return
    }

    if (items.some((item) => !item.name.trim() || item.price <= 0)) {
      alert("Please fill in all item details")
      return
    }

    const bill = {
      type: billType,
      customerName,
      customerPhone,
      customerAddress,
      items: items.filter((item) => item.name.trim()),
      subtotal,
      discount,
      discountAmount,
      tax,
      taxAmount,
      total,
      notes,
      billNumber: `${billType.toUpperCase()}-${Date.now()}`,
    }

    const success = onAddBill(bill)
    if (success) {
      // Reset form
      setCustomerName("")
      setCustomerPhone("")
      setCustomerAddress("")
      setItems([{ id: 1, name: "", quantity: 1, price: 0, total: 0 }])
      setDiscount(0)
      setTax(0)
      setNotes("")
      alert("Bill created successfully!")
    }
  }

  const generateInvoice = () => {
    const invoiceContent = `
      <html>
        <head>
          <title>Invoice</title>
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
            <p>Bill #: ${billType.toUpperCase()}-${Date.now()}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="company-info">
            <h3>${settings.companyName}</h3>
            <p>${settings.companyAddress}</p>
            <p>Phone: ${settings.companyPhone}</p>
            <p>Email: ${settings.companyEmail}</p>
          </div>
          
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${customerName}</strong></p>
            <p>${customerPhone}</p>
            <p>${customerAddress}</p>
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
              ${items
                .map(
                  (item) => `
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
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>Discount (${discount}%): -$${discountAmount.toFixed(2)}</p>
            <p>Tax (${tax}%): $${taxAmount.toFixed(2)}</p>
            <p class="total-row">Total: $${total.toFixed(2)}</p>
          </div>
          
          ${notes ? `<div><h3>Notes:</h3><p>${notes}</p></div>` : ""}
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Create New Bill</span>
        </CardTitle>
        <CardDescription>Create retail or wholesale bills with automatic invoice generation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill Type */}
          <div className="space-y-2">
            <Label>Bill Type</Label>
            <Select value={billType} onValueChange={(value: "retail" | "wholesale") => setBillType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerAddress">Address</Label>
            <Textarea
              id="customerAddress"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Enter customer address"
              rows={2}
            />
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Items</Label>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Item Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Total</Label>
                      <p className="text-lg font-semibold">${item.total.toFixed(2)}</p>
                    </div>
                    {items.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax (%)</Label>
                <Input
                  id="tax"
                  type="number"
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount ({discount}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({tax}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or terms"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Create Bill
            </Button>
            <Button type="button" variant="outline" onClick={generateInvoice} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Preview Invoice
            </Button>
          </div>

          {/* Bill Limit Info */}
          <div className="text-center text-sm text-gray-500">
            Bills used: {settings.currentBillCount} / {settings.billLimit}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
