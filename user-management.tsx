"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react"

interface User {
  id: number
  username: string
  name: string
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
  createdAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    role: "user" as "admin" | "user",
    status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    const savedUsers = localStorage.getItem("billingUsers")
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      // Initialize with default admin user
      const defaultUsers: User[] = [
        {
          id: 1,
          username: "admin",
          name: "Administrator",
          email: "admin@company.com",
          role: "admin",
          status: "active",
          createdAt: new Date().toISOString(),
        },
      ]
      setUsers(defaultUsers)
      localStorage.setItem("billingUsers", JSON.stringify(defaultUsers))
    }
  }, [])

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers)
    localStorage.setItem("billingUsers", JSON.stringify(updatedUsers))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUser) {
      // Update existing user
      const updatedUsers = users.map((user) => (user.id === editingUser.id ? { ...user, ...formData } : user))
      saveUsers(updatedUsers)
      setEditingUser(null)
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
      }
      saveUsers([...users, newUser])
      setIsAddDialogOpen(false)
    }

    // Reset form
    setFormData({
      username: "",
      name: "",
      email: "",
      role: "user",
      status: "active",
    })
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    })
  }

  const handleDelete = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const updatedUsers = users.filter((user) => user.id !== userId)
      saveUsers(updatedUsers)
    }
  }

  const toggleUserStatus = (userId: number) => {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? { ...user, status: user.status === "active" ? "inactive" : ("active" as "active" | "inactive") }
        : user,
    )
    saveUsers(updatedUsers)
  }

  const UserForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="Enter username"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="Enter email address"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: "admin" | "user") => setFormData((prev) => ({ ...prev, role: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "active" | "inactive") => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false)
            setEditingUser(null)
            setFormData({ username: "", name: "", email: "", role: "user", status: "active" })
          }}
        >
          Cancel
        </Button>
        <Button type="submit">{editingUser ? "Update User" : "Add User"}</Button>
      </div>
    </form>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>User Management</span>
            </CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account for the billing system</DialogDescription>
              </DialogHeader>
              <UserForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first user.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                      <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Username: {user.username}</p>
                      <p>Email: {user.email}</p>
                      <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user.id)}>
                      {user.status === "active" ? (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {user.id !== 1 && ( // Don't allow deleting the default admin
                      <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user account information</DialogDescription>
            </DialogHeader>
            <UserForm />
          </DialogContent>
        </Dialog>

        {/* Summary */}
        {users.length > 0 && (
          <Card className="mt-6 bg-gray-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.filter((user) => user.status === "active").length}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.filter((user) => user.role === "admin").length}</p>
                  <p className="text-sm text-gray-600">Admins</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.filter((user) => user.role === "user").length}</p>
                  <p className="text-sm text-gray-600">Regular Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
