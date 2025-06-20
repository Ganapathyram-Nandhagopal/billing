"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { SettingsIcon, Save, Building, MaximizeIcon as Limit } from "lucide-react"

interface SettingsProps {
  settings: any
  onUpdateSettings: (settings: any) => void
}

export function Settings({ settings, onUpdateSettings }: SettingsProps) {
  const [formData, setFormData] = useState(settings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateSettings(formData)
    alert("Settings saved successfully!")
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>Application Settings</span>
          </CardTitle>
          <CardDescription>Configure your billing application preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bill Limit Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Limit className="w-5 h-5" />
                  <span>Bill Limits</span>
                </CardTitle>
                <CardDescription>Set the maximum number of bills that can be created</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billLimit">Maximum Bills</Label>
                    <Input
                      id="billLimit"
                      type="number"
                      min="1"
                      value={formData.billLimit}
                      onChange={(e) => handleInputChange("billLimit", Number.parseInt(e.target.value) || 100)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Usage</Label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <p className="text-sm">
                        {formData.currentBillCount} / {formData.billLimit} bills used
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(formData.currentBillCount / formData.billLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Building className="w-5 h-5" />
                  <span>Company Information</span>
                </CardTitle>
                <CardDescription>This information will appear on your invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                    placeholder="Enter your company address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Phone Number</Label>
                    <Input
                      id="companyPhone"
                      value={formData.companyPhone}
                      onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email Address</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={formData.companyEmail}
                      onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Settings Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Preview</CardTitle>
          <CardDescription>Preview how your company information will appear on invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">INVOICE</h2>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{formData.companyName}</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{formData.companyAddress}</p>
              <p className="text-sm text-gray-600">Phone: {formData.companyPhone}</p>
              <p className="text-sm text-gray-600">Email: {formData.companyEmail}</p>
            </div>
            <div className="text-sm text-gray-500">
              <p>This is how your company information will appear on invoices</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
