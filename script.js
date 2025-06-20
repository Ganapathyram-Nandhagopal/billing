// Application State
let currentUser = null
let bills = []
let users = []
let settings = {
  billLimit: 100,
  currentBillCount: 0,
  companyName: "Your Company",
  companyAddress: "123 Business St, City, State 12345",
  companyPhone: "+1 (555) 123-4567",
  companyEmail: "info@yourcompany.com",
}

let inventory = []
let stockTransactions = []

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  loadData()
})

function initializeApp() {
  // Check if user is already logged in
  const savedUser = localStorage.getItem("billingUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    showDashboard()
  } else {
    showLogin()
  }
}

function setupEventListeners() {
  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin)
  document.getElementById("logoutBtn").addEventListener("click", handleLogout)

  // Navigation tabs
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab))
  })

  // Bill form
  document.getElementById("billForm").addEventListener("submit", handleCreateBill)
  document.getElementById("addItemBtn").addEventListener("click", addBillItem)
  document.getElementById("previewInvoiceBtn").addEventListener("click", previewInvoice)

  // Settings form
  document.getElementById("settingsForm").addEventListener("submit", handleSaveSettings)

  // User management
  document.getElementById("addUserBtn").addEventListener("click", () => showModal("addUserModal"))
  document.getElementById("addUserForm").addEventListener("submit", handleAddUser)
  document.getElementById("editUserForm").addEventListener("submit", handleEditUser)

  // Modal controls
  setupModalControls()

  // Search and filters
  document.getElementById("searchBills").addEventListener("input", filterBills)
  document.getElementById("filterType").addEventListener("change", filterBills)
  document.getElementById("sortBy").addEventListener("change", filterBills)

  // Real-time calculations
  document.getElementById("discount").addEventListener("input", calculateTotals)
  document
    .getElementById("tax")
    .addEventListener("input", calculateTotals)

  // Settings preview updates
  ;["companyName", "companyAddress", "companyPhone", "companyEmail"].forEach((field) => {
    document.getElementById(field).addEventListener("input", updateSettingsPreview)
  })

  // Inventory management
  document.getElementById("addItemBtn").addEventListener("click", () => showModal("addItemModal"))
  document.getElementById("addItemForm").addEventListener("submit", handleAddItem)
  document.getElementById("editItemForm").addEventListener("submit", handleEditItem)

  // Balance management
  document.getElementById("openingBalanceBtn").addEventListener("click", showOpeningBalanceModal)
  document.getElementById("closingBalanceBtn").addEventListener("click", showClosingBalanceModal)
  document.getElementById("saveOpeningBalance").addEventListener("click", saveOpeningBalance)
  document.getElementById("generateClosingBalance").addEventListener("click", generateClosingBalance)
  document.getElementById("exportInventoryBtn").addEventListener("click", exportInventoryToExcel)

  // Inventory filters
  document.getElementById("searchItems").addEventListener("input", filterInventoryItems)
  document.getElementById("filterCategory").addEventListener("change", filterInventoryItems)
  document.getElementById("filterStock").addEventListener("change", filterInventoryItems)

  // Update bill item button
  document.getElementById("addBillItemBtn").addEventListener("click", addBillItemWithDropdown)

  // Modal controls for inventory
  document
    .querySelectorAll("#cancelAddItem, #cancelEditItem, #cancelOpeningBalance, #cancelClosingBalance")
    .forEach((btn) => {
      btn.addEventListener("click", closeModals)
    })
}

function setupModalControls() {
  // Close modal buttons
  document.querySelectorAll(".modal-close, #cancelAddUser, #cancelEditUser").forEach((btn) => {
    btn.addEventListener("click", closeModals)
  })

  // Close modal on backdrop click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModals()
    })
  })
}

function loadData() {
  // Load bills
  const savedBills = localStorage.getItem("bills")
  if (savedBills) {
    bills = JSON.parse(savedBills)
  }

  // Load users
  const savedUsers = localStorage.getItem("billingUsers")
  if (savedUsers) {
    users = JSON.parse(savedUsers)
  } else {
    // Initialize with default admin user
    users = [
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
    saveUsers()
  }

  // Load settings
  const savedSettings = localStorage.getItem("billSettings")
  if (savedSettings) {
    settings = { ...settings, ...JSON.parse(savedSettings) }
  }

  // Update current bill count
  settings.currentBillCount = bills.length

  // Load inventory
  const savedInventory = localStorage.getItem("inventory")
  if (savedInventory) {
    inventory = JSON.parse(savedInventory)
  }

  // Load stock transactions
  const savedTransactions = localStorage.getItem("stockTransactions")
  if (savedTransactions) {
    stockTransactions = JSON.parse(savedTransactions)
  }

  updateDashboard()
}

function saveData() {
  localStorage.setItem("bills", JSON.stringify(bills))
  localStorage.setItem("billSettings", JSON.stringify(settings))
  localStorage.setItem("inventory", JSON.stringify(inventory))
  localStorage.setItem("stockTransactions", JSON.stringify(stockTransactions))
}

function saveUsers() {
  localStorage.setItem("billingUsers", JSON.stringify(users))
}

// Authentication
function handleLogin(e) {
  e.preventDefault()
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value
  const loginBtn = document.getElementById("loginBtn")
  const errorDiv = document.getElementById("loginError")

  // Show loading state
  loginBtn.disabled = true

  setTimeout(() => {
    if (username === "admin" && password === "admin123") {
      currentUser = {
        id: 1,
        username: "admin",
        name: "Administrator",
        role: "admin",
      }
      localStorage.setItem("billingUser", JSON.stringify(currentUser))
      showDashboard()
    } else {
      errorDiv.textContent = "Invalid username or password"
      errorDiv.style.display = "block"
    }
    loginBtn.disabled = false
  }, 1000)
}

function handleLogout() {
  currentUser = null
  localStorage.removeItem("billingUser")
  showLogin()
}

function showLogin() {
  document.getElementById("loginScreen").classList.add("active")
  document.getElementById("dashboardScreen").classList.remove("active")
}

function showDashboard() {
  document.getElementById("loginScreen").classList.remove("active")
  document.getElementById("dashboardScreen").classList.add("active")
  document.getElementById("userName").textContent = currentUser.name
  updateDashboard()
}

// Navigation
function switchTab(tabName) {
  // Update active tab
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.remove("active")
  })
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

  // Update active content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })
  document.getElementById(tabName).classList.add("active")

  // Load tab-specific data
  switch (tabName) {
    case "overview":
      updateOverview()
      break
    case "create-bill":
      initializeBillForm()
      break
    case "history":
      updateBillHistory()
      break
    case "users":
      updateUsersList()
      break
    case "settings":
      updateSettingsForm()
      break
    case "inventory":
      updateInventoryList()
      break
  }
}

// Dashboard Updates
function updateDashboard() {
  updateOverview()
  updateBillLimitWarning()
  updateBillForm()
}

function updateOverview() {
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0)
  const retailBills = bills.filter((bill) => bill.type === "retail").length
  const wholesaleBills = bills.filter((bill) => bill.type === "wholesale").length

  document.getElementById("totalRevenue").textContent = `$${totalRevenue.toFixed(2)}`
  document.getElementById("totalBills").textContent = bills.length
  document.getElementById("totalBillsText").textContent = `From ${bills.length} bills`
  document.getElementById("billLimitText").textContent = `Limit: ${settings.billLimit}`
  document.getElementById("retailBills").textContent = retailBills
  document.getElementById("wholesaleBills").textContent = wholesaleBills

  updateRecentBills()
}

function updateRecentBills() {
  const recentBillsList = document.getElementById("recentBillsList")

  if (bills.length === 0) {
    recentBillsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-invoice"></i>
                <p>No bills created yet</p>
            </div>
        `
    return
  }

  const recentBills = bills.slice(-5).reverse()
  recentBillsList.innerHTML = recentBills
    .map(
      (bill) => `
        <div class="bill-item">
            <div class="bill-info">
                <h4>${bill.customerName}</h4>
                <div class="bill-meta">
                    <span>${new Date(bill.date).toLocaleDateString()}</span>
                    <span class="badge badge-${bill.type}">${bill.type}</span>
                </div>
            </div>
            <div class="bill-amount">
                <div class="bill-total">$${bill.total.toFixed(2)}</div>
                <div class="bill-items">${bill.items.length} items</div>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateBillLimitWarning() {
  const warningCard = document.getElementById("billLimitWarning")
  const currentCount = settings.currentBillCount
  const limit = settings.billLimit

  if (currentCount >= limit * 0.9) {
    warningCard.style.display = "block"
    document.getElementById("warningCurrentCount").textContent = currentCount
    document.getElementById("warningTotalLimit").textContent = limit
  } else {
    warningCard.style.display = "none"
  }
}

// Bill Management
function initializeBillForm() {
  // Reset form
  document.getElementById("billForm").reset()
  document.getElementById("billItemsList").innerHTML = ""
  addBillItemWithDropdown() // Add first item with dropdown
  calculateTotals()
  updateBillFormLimits()
}

function updateBillForm() {
  updateBillFormLimits()
}

function updateBillFormLimits() {
  document.getElementById("currentBillCount").textContent = settings.currentBillCount
  document.getElementById("maxBillLimit").textContent = settings.billLimit
}

function addBillItem() {
  const itemsList = document.getElementById("itemsList")
  const itemId = Date.now()

  const itemHtml = `
        <div class="item-card" data-item-id="${itemId}">
            <div class="item-row">
                <div class="form-group">
                    <label>Item Name</label>
                    <input type="text" class="form-control item-name" placeholder="Enter item name" required>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="form-control item-quantity" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" class="form-control item-price" min="0" step="0.01" value="0" required>
                </div>
                <div class="item-total">
                    <label>Total</label>
                    <div class="item-total-value">$0.00</div>
                </div>
                <div class="form-group">
                    ${
                      itemsList.children.length > 0
                        ? `
                        <button type="button" class="btn btn-outline remove-item-btn">
                            <i class="fas fa-minus"></i>
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>
    `

  itemsList.insertAdjacentHTML("beforeend", itemHtml)

  // Add event listeners for the new item
  const newItem = itemsList.lastElementChild
  const quantityInput = newItem.querySelector(".item-quantity")
  const priceInput = newItem.querySelector(".item-price")
  const removeBtn = newItem.querySelector(".remove-item-btn")

  quantityInput.addEventListener("input", calculateTotals)
  priceInput.addEventListener("input", calculateTotals)

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      newItem.remove()
      calculateTotals()
    })
  }
}

function calculateTotals() {
  const items = document.querySelectorAll(".item-card")
  let subtotal = 0

  items.forEach((item) => {
    const quantity = Number.parseFloat(item.querySelector(".item-quantity").value) || 0
    const price = Number.parseFloat(item.querySelector(".item-price").value) || 0
    const total = quantity * price

    item.querySelector(".item-total-value").textContent = `$${total.toFixed(2)}`
    subtotal += total
  })

  const discount = Number.parseFloat(document.getElementById("discount").value) || 0
  const tax = Number.parseFloat(document.getElementById("tax").value) || 0

  const discountAmount = (subtotal * discount) / 100
  const taxAmount = ((subtotal - discountAmount) * tax) / 100
  const finalTotal = subtotal - discountAmount + taxAmount

  document.getElementById("subtotalAmount").textContent = `$${subtotal.toFixed(2)}`
  document.getElementById("discountPercent").textContent = discount
  document.getElementById("discountAmount").textContent = `-$${discountAmount.toFixed(2)}`
  document.getElementById("taxPercent").textContent = tax
  document.getElementById("taxAmount").textContent = `$${taxAmount.toFixed(2)}`
  document.getElementById("finalTotal").textContent = `$${finalTotal.toFixed(2)}`
}

function handleCreateBill(e) {
  e.preventDefault()

  if (settings.currentBillCount >= settings.billLimit) {
    alert("Bill limit reached! Please increase the limit in settings.")
    return
  }

  const formData = new FormData(e.target)
  const items = []
  const billItemElements = []

  document.querySelectorAll(".bill-item-card").forEach((item, index) => {
    const searchInput = item.querySelector(".item-search")
    const name = searchInput.value.trim()
    const quantity = Number.parseFloat(item.querySelector(".item-quantity").value) || 0
    const price = Number.parseFloat(item.querySelector(".item-price").value) || 0
    const selectedItemId = item.dataset.selectedItemId

    if (name && quantity > 0 && price >= 0) {
      items.push({
        id: Date.now() + Math.random(),
        name,
        quantity,
        price,
        total: quantity * price,
        inventoryItemId: selectedItemId ? Number.parseInt(selectedItemId) : null,
      })

      billItemElements.push({
        elementId: item.dataset.itemId,
        quantity: quantity,
        inventoryItemId: selectedItemId ? Number.parseInt(selectedItemId) : null,
      })
    }
  })

  if (items.length === 0) {
    alert("Please add at least one item with valid details.")
    return
  }

  // Check stock availability for inventory items
  let stockError = false
  billItemElements.forEach((billItem) => {
    if (billItem.inventoryItemId) {
      const inventoryItem = inventory.find((i) => i.id === billItem.inventoryItemId)
      if (inventoryItem && billItem.quantity > inventoryItem.stock) {
        alert(
          `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.stock}, Requested: ${billItem.quantity}`,
        )
        stockError = true
      }
    }
  })

  if (stockError) {
    return
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discount = Number.parseFloat(document.getElementById("discount").value) || 0
  const tax = Number.parseFloat(document.getElementById("tax").value) || 0
  const discountAmount = (subtotal * discount) / 100
  const taxAmount = ((subtotal - discountAmount) * tax) / 100
  const total = subtotal - discountAmount + taxAmount

  const bill = {
    id: Date.now(),
    billNumber: `${document.getElementById("billType").value.toUpperCase()}-${Date.now()}`,
    type: document.getElementById("billType").value,
    customerName: document.getElementById("customerName").value,
    customerPhone: document.getElementById("customerPhone").value,
    customerAddress: document.getElementById("customerAddress").value,
    items,
    subtotal,
    discount,
    discountAmount,
    tax,
    taxAmount,
    total,
    notes: document.getElementById("notes").value,
    date: new Date().toISOString(),
  }

  bills.push(bill)
  settings.currentBillCount = bills.length

  // Update inventory stock
  billItemElements.forEach((billItem) => {
    if (billItem.inventoryItemId) {
      const inventoryItemIndex = inventory.findIndex((i) => i.id === billItem.inventoryItemId)
      if (inventoryItemIndex !== -1) {
        inventory[inventoryItemIndex].stock -= billItem.quantity
        if (inventory[inventoryItemIndex].stock < 0) {
          inventory[inventoryItemIndex].stock = 0
        }
      }
    }
  })

  // Record stock transaction
  const stockTransaction = {
    id: Date.now(),
    type: "bill_sale",
    billId: bill.id,
    billNumber: bill.billNumber,
    date: new Date().toISOString(),
    items: billItemElements
      .filter((item) => item.inventoryItemId)
      .map((item) => {
        const inventoryItem = inventory.find((i) => i.id === item.inventoryItemId)
        return {
          itemId: item.inventoryItemId,
          itemName: inventoryItem.name,
          quantitySold: item.quantity,
          remainingStock: inventoryItem.stock,
        }
      }),
  }

  if (stockTransaction.items.length > 0) {
    stockTransactions.push(stockTransaction)
  }

  saveData()

  alert("Bill created successfully!")
  initializeBillForm()
  updateDashboard()
}

function previewInvoice() {
  const customerName = document.getElementById("customerName").value
  const customerPhone = document.getElementById("customerPhone").value
  const customerAddress = document.getElementById("customerAddress").value
  const billType = document.getElementById("billType").value
  const notes = document.getElementById("notes").value

  if (!customerName.trim()) {
    alert("Please enter customer name to preview invoice.")
    return
  }

  const items = []
  document.querySelectorAll(".item-card").forEach((item) => {
    const name = item.querySelector(".item-name").value.trim()
    const quantity = Number.parseFloat(item.querySelector(".item-quantity").value) || 0
    const price = Number.parseFloat(item.querySelector(".item-price").value) || 0

    if (name && quantity > 0 && price >= 0) {
      items.push({ name, quantity, price, total: quantity * price })
    }
  })

  if (items.length === 0) {
    alert("Please add at least one item to preview invoice.")
    return
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discount = Number.parseFloat(document.getElementById("discount").value) || 0
  const tax = Number.parseFloat(document.getElementById("tax").value) || 0
  const discountAmount = (subtotal * discount) / 100
  const taxAmount = ((subtotal - discountAmount) * tax) / 100
  const total = subtotal - discountAmount + taxAmount

  generateInvoiceHTML({
    billNumber: `${billType.toUpperCase()}-${Date.now()}`,
    customerName,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    discount,
    discountAmount,
    tax,
    taxAmount,
    total,
    notes,
    date: new Date().toISOString(),
  })
}

function generateInvoiceHTML(bill) {
  const invoiceContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${bill.billNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; }
                .company-info { margin-bottom: 20px; }
                .customer-info { margin-bottom: 20px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .items-table th { background-color: #f2f2f2; font-weight: bold; }
                .totals { text-align: right; margin-bottom: 20px; }
                .total-row { margin-bottom: 5px; }
                .total-final { font-weight: bold; font-size: 1.1em; border-top: 1px solid #ddd; padding-top: 5px; }
                .notes { margin-top: 20px; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>INVOICE</h1>
                <p><strong>Bill #:</strong> ${bill.billNumber}</p>
                <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
            </div>
            
            <div class="company-info">
                <h3>${settings.companyName}</h3>
                <p>${settings.companyAddress}</p>
                <p><strong>Phone:</strong> ${settings.companyPhone}</p>
                <p><strong>Email:</strong> ${settings.companyEmail}</p>
            </div>
            
            <div class="customer-info">
                <h3>Bill To:</h3>
                <p><strong>${bill.customerName}</strong></p>
                ${bill.customerPhone ? `<p><strong>Phone:</strong> ${bill.customerPhone}</p>` : ""}
                ${bill.customerAddress ? `<p><strong>Address:</strong> ${bill.customerAddress}</p>` : ""}
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
                <div class="total-row">Subtotal: $${bill.subtotal.toFixed(2)}</div>
                <div class="total-row">Discount (${bill.discount}%): -$${bill.discountAmount.toFixed(2)}</div>
                <div class="total-row">Tax (${bill.tax}%): $${bill.taxAmount.toFixed(2)}</div>
                <div class="total-row total-final">Total: $${bill.total.toFixed(2)}</div>
            </div>
            
            ${
              bill.notes
                ? `
                <div class="notes">
                    <h3>Notes:</h3>
                    <p>${bill.notes}</p>
                </div>
            `
                : ""
            }
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
        </body>
        </html>
    `

  const newWindow = window.open("", "_blank")
  if (newWindow) {
    newWindow.document.write(invoiceContent)
    newWindow.document.close()
  }
}

// Bill History
function updateBillHistory() {
  filterBills()
}

function filterBills() {
  const searchTerm = document.getElementById("searchBills").value.toLowerCase()
  const filterType = document.getElementById("filterType").value
  const sortBy = document.getElementById("sortBy").value

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.customerName.toLowerCase().includes(searchTerm) || bill.billNumber.toLowerCase().includes(searchTerm)
    const matchesType = filterType === "all" || bill.type === filterType
    return matchesSearch && matchesType
  })

  // Sort bills
  filteredBills.sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date) - new Date(a.date)
      case "amount":
        return b.total - a.total
      case "customer":
        return a.customerName.localeCompare(b.customerName)
      default:
        return 0
    }
  })

  displayBills(filteredBills)
  updateBillsSummary(filteredBills)
}

function displayBills(billsToShow) {
  const billsList = document.getElementById("billsList")

  if (billsToShow.length === 0) {
    billsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar"></i>
                <h4>No bills found</h4>
                <p>${bills.length === 0 ? "Get started by creating your first bill." : "Try adjusting your search or filters."}</p>
            </div>
        `
    return
  }

  billsList.innerHTML = billsToShow
    .map(
      (bill) => `
        <div class="bill-card">
            <div class="bill-header">
                <div class="bill-details">
                    <h4>${bill.customerName} <span class="badge badge-${bill.type}">${bill.type}</span></h4>
                    <div class="bill-meta">
                        <p><strong>Bill #:</strong> ${bill.billNumber}</p>
                        <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
                        <p><strong>Items:</strong> ${bill.items.length}</p>
                        ${bill.customerPhone ? `<p><strong>Phone:</strong> ${bill.customerPhone}</p>` : ""}
                    </div>
                </div>
                <div class="bill-amount">
                    <div class="bill-total">$${bill.total.toFixed(2)}</div>
                    <div class="bill-items">Subtotal: $${bill.subtotal.toFixed(2)}</div>
                    <div class="bill-actions">
                        <button class="btn btn-outline" onclick="viewBill(${bill.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-outline" onclick="printBill(${bill.id})">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>
                </div>
            </div>
            ${
              bill.notes
                ? `
                <div class="bill-notes">
                    <strong>Notes:</strong> ${bill.notes}
                </div>
            `
                : ""
            }
        </div>
    `,
    )
    .join("")
}

function updateBillsSummary(billsToShow) {
  const summaryDiv = document.getElementById("billsSummary")

  if (billsToShow.length === 0) {
    summaryDiv.style.display = "none"
    return
  }

  summaryDiv.style.display = "block"

  const totalRevenue = billsToShow.reduce((sum, bill) => sum + bill.total, 0)
  const retailCount = billsToShow.filter((bill) => bill.type === "retail").length
  const wholesaleCount = billsToShow.filter((bill) => bill.type === "wholesale").length

  document.getElementById("summaryTotalBills").textContent = billsToShow.length
  document.getElementById("summaryTotalRevenue").textContent = `$${totalRevenue.toFixed(2)}`
  document.getElementById("summaryRetailBills").textContent = retailCount
  document.getElementById("summaryWholesaleBills").textContent = wholesaleCount
}

function viewBill(billId) {
  const bill = bills.find((b) => b.id === billId)
  if (bill) {
    generateInvoiceHTML(bill)
  }
}

function printBill(billId) {
  const bill = bills.find((b) => b.id === billId)
  if (bill) {
    generateInvoiceHTML(bill)
  }
}

// User Management
function updateUsersList() {
  const usersList = document.getElementById("usersList")

  usersList.innerHTML = users
    .map(
      (user) => `
        <div class="user-card">
            <div class="user-info">
                <h4>${user.name} 
                    <span class="badge badge-${user.role}">${user.role}</span>
                    <span class="badge badge-${user.status}">${user.status}</span>
                </h4>
                <div class="user-meta">
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Created:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-outline" onclick="toggleUserStatus(${user.id})">
                    <i class="fas fa-user-${user.status === "active" ? "slash" : "check"}"></i>
                    ${user.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <button class="btn btn-outline" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                ${
                  user.id !== 1
                    ? `
                    <button class="btn btn-outline" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                `
                    : ""
                }
            </div>
        </div>
    `,
    )
    .join("")

  updateUsersSummary()
}

function updateUsersSummary() {
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status === "active").length
  const adminUsers = users.filter((user) => user.role === "admin").length
  const regularUsers = users.filter((user) => user.role === "user").length

  document.getElementById("totalUsers").textContent = totalUsers
  document.getElementById("activeUsers").textContent = activeUsers
  document.getElementById("adminUsers").textContent = adminUsers
  document.getElementById("regularUsers").textContent = regularUsers
}

function handleAddUser(e) {
  e.preventDefault()

  const newUser = {
    id: Date.now(),
    username: document.getElementById("newUsername").value,
    name: document.getElementById("newUserName").value,
    email: document.getElementById("newUserEmail").value,
    role: document.getElementById("newUserRole").value,
    status: document.getElementById("newUserStatus").value,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers()
  updateUsersList()
  closeModals()
  document.getElementById("addUserForm").reset()
  alert("User added successfully!")
}

function editUser(userId) {
  const user = users.find((u) => u.id === userId)
  if (user) {
    document.getElementById("editUserId").value = user.id
    document.getElementById("editUsername").value = user.username
    document.getElementById("editUserName").value = user.name
    document.getElementById("editUserEmail").value = user.email
    document.getElementById("editUserRole").value = user.role
    document.getElementById("editUserStatus").value = user.status
    showModal("editUserModal")
  }
}

function handleEditUser(e) {
  e.preventDefault()

  const userId = Number.parseInt(document.getElementById("editUserId").value)
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      username: document.getElementById("editUsername").value,
      name: document.getElementById("editUserName").value,
      email: document.getElementById("editUserEmail").value,
      role: document.getElementById("editUserRole").value,
      status: document.getElementById("editUserStatus").value,
    }

    saveUsers()
    updateUsersList()
    closeModals()
    alert("User updated successfully!")
  }
}

function toggleUserStatus(userId) {
  const user = users.find((u) => u.id === userId)
  if (user) {
    user.status = user.status === "active" ? "inactive" : "active"
    saveUsers()
    updateUsersList()
  }
}

function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    users = users.filter((u) => u.id !== userId)
    saveUsers()
    updateUsersList()
    alert("User deleted successfully!")
  }
}

// Settings
function updateSettingsForm() {
  document.getElementById("billLimit").value = settings.billLimit
  document.getElementById("companyName").value = settings.companyName
  document.getElementById("companyAddress").value = settings.companyAddress
  document.getElementById("companyPhone").value = settings.companyPhone
  document.getElementById("companyEmail").value = settings.companyEmail

  updateUsageDisplay()
  updateSettingsPreview()
}

function updateUsageDisplay() {
  const currentCount = settings.currentBillCount
  const limit = settings.billLimit
  const percentage = (currentCount / limit) * 100

  document.getElementById("usageText").textContent = `${currentCount} / ${limit} bills used`
  document.getElementById("usageProgress").style.width = `${Math.min(percentage, 100)}%`
}

function updateSettingsPreview() {
  document.getElementById("previewCompanyName").textContent = document.getElementById("companyName").value
  document.getElementById("previewCompanyAddress").textContent = document.getElementById("companyAddress").value
  document.getElementById("previewCompanyPhone").textContent = document.getElementById("companyPhone").value
  document.getElementById("previewCompanyEmail").textContent = document.getElementById("companyEmail").value
}

function handleSaveSettings(e) {
  e.preventDefault()

  settings.billLimit = Number.parseInt(document.getElementById("billLimit").value)
  settings.companyName = document.getElementById("companyName").value
  settings.companyAddress = document.getElementById("companyAddress").value
  settings.companyPhone = document.getElementById("companyPhone").value
  settings.companyEmail = document.getElementById("companyEmail").value

  saveData()
  updateUsageDisplay()
  updateDashboard()
  alert("Settings saved successfully!")
}

// Modal Management
function showModal(modalId) {
  document.getElementById(modalId).classList.add("active")
}

function closeModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("active")
  })
}

// Utility Functions
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

// Initialize first bill item when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Add initial item to bill form
  setTimeout(() => {
    if (document.getElementById("itemsList").children.length === 0) {
      addBillItem()
    }
  }, 100)
})

// Inventory Management Functions
function handleAddItem(e) {
  e.preventDefault()

  const newItem = {
    id: Date.now(),
    name: document.getElementById("itemName").value,
    category: document.getElementById("itemCategory").value,
    price: Number.parseFloat(document.getElementById("itemPrice").value),
    stock: Number.parseInt(document.getElementById("itemStock").value),
    minStock: Number.parseInt(document.getElementById("itemMinStock").value),
    unit: document.getElementById("itemUnit").value,
    description: document.getElementById("itemDescription").value,
    createdAt: new Date().toISOString(),
  }

  inventory.push(newItem)
  saveData()
  updateInventoryList()
  closeModals()
  document.getElementById("addItemForm").reset()
  alert("Item added successfully!")
}

function editInventoryItem(itemId) {
  const item = inventory.find((i) => i.id === itemId)
  if (item) {
    document.getElementById("editItemId").value = item.id
    document.getElementById("editItemName").value = item.name
    document.getElementById("editItemCategory").value = item.category
    document.getElementById("editItemPrice").value = item.price
    document.getElementById("editItemStock").value = item.stock
    document.getElementById("editItemMinStock").value = item.minStock
    document.getElementById("editItemUnit").value = item.unit
    document.getElementById("editItemDescription").value = item.description
    showModal("editItemModal")
  }
}

function handleEditItem(e) {
  e.preventDefault()

  const itemId = Number.parseInt(document.getElementById("editItemId").value)
  const itemIndex = inventory.findIndex((i) => i.id === itemId)

  if (itemIndex !== -1) {
    inventory[itemIndex] = {
      ...inventory[itemIndex],
      name: document.getElementById("editItemName").value,
      category: document.getElementById("editItemCategory").value,
      price: Number.parseFloat(document.getElementById("editItemPrice").value),
      stock: Number.parseInt(document.getElementById("editItemStock").value),
      minStock: Number.parseInt(document.getElementById("editItemMinStock").value),
      unit: document.getElementById("editItemUnit").value,
      description: document.getElementById("editItemDescription").value,
    }

    saveData()
    updateInventoryList()
    closeModals()
    alert("Item updated successfully!")
  }
}

function deleteInventoryItem(itemId) {
  if (confirm("Are you sure you want to delete this item?")) {
    inventory = inventory.filter((i) => i.id !== itemId)
    saveData()
    updateInventoryList()
    alert("Item deleted successfully!")
  }
}

function updateInventoryList() {
  filterInventoryItems()
  updateInventoryStats()
}

function updateInventoryStats() {
  const totalItems = inventory.length
  const lowStockItems = inventory.filter((item) => item.stock <= item.minStock).length
  const totalStockValue = inventory.reduce((sum, item) => sum + item.stock * item.price, 0)

  document.getElementById("totalItems").textContent = totalItems
  document.getElementById("lowStockItems").textContent = lowStockItems
  document.getElementById("totalStockValue").textContent = `$${totalStockValue.toFixed(2)}`
}

function filterInventoryItems() {
  const searchTerm = document.getElementById("searchItems").value.toLowerCase()
  const categoryFilter = document.getElementById("filterCategory").value
  const stockFilter = document.getElementById("filterStock").value

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm)
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

    let matchesStock = true
    if (stockFilter === "in-stock") {
      matchesStock = item.stock > item.minStock
    } else if (stockFilter === "low-stock") {
      matchesStock = item.stock <= item.minStock && item.stock > 0
    } else if (stockFilter === "out-of-stock") {
      matchesStock = item.stock === 0
    }

    return matchesSearch && matchesCategory && matchesStock
  })

  displayInventoryItems(filteredItems)
}

function displayInventoryItems(itemsToShow) {
  const itemsList = document.getElementById("itemsList")

  if (itemsToShow.length === 0) {
    itemsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-boxes"></i>
                <h4>No items found</h4>
                <p>${inventory.length === 0 ? "Get started by adding your first inventory item." : "Try adjusting your search or filters."}</p>
            </div>
        `
    return
  }

  itemsList.innerHTML = itemsToShow
    .map((item) => {
      const stockStatus = item.stock === 0 ? "out-of-stock" : item.stock <= item.minStock ? "low-stock" : "in-stock"
      const stockStatusText = item.stock === 0 ? "Out of Stock" : item.stock <= item.minStock ? "Low Stock" : "In Stock"

      return `
            <div class="item-inventory-card">
                <div class="item-info">
                    <h4>${item.name} <span class="stock-status stock-${stockStatus}">${stockStatusText}</span></h4>
                    <div class="item-meta">
                        <p><strong>Category:</strong> ${item.category}</p>
                        <p><strong>Price:</strong> $${item.price.toFixed(2)} per ${item.unit}</p>
                        <p><strong>Stock:</strong> ${item.stock} ${item.unit} (Min: ${item.minStock})</p>
                        <p><strong>Value:</strong> $${(item.stock * item.price).toFixed(2)}</p>
                        ${item.description ? `<p><strong>Description:</strong> ${item.description}</p>` : ""}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-outline" onclick="editInventoryItem(${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-outline" onclick="deleteInventoryItem(${item.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `
    })
    .join("")
}

// Opening/Closing Balance Functions
function showOpeningBalanceModal() {
  if (inventory.length === 0) {
    alert("Please add some items to inventory first.")
    return
  }

  const balanceList = document.getElementById("openingBalanceList")
  balanceList.innerHTML = inventory
    .map(
      (item) => `
        <div class="balance-item">
            <div class="balance-item-info">
                <h5>${item.name}</h5>
                <p>Current: ${item.stock} ${item.unit} | Price: $${item.price.toFixed(2)}</p>
            </div>
            <div>
                <label>Opening Stock</label>
                <input type="number" class="balance-input" data-item-id="${item.id}" value="${item.stock}" min="0">
            </div>
            <div>
                <label>Unit</label>
                <p>${item.unit}</p>
            </div>
            <div>
                <label>Value</label>
                <p class="balance-value">$${(item.stock * item.price).toFixed(2)}</p>
            </div>
        </div>
    `,
    )
    .join("")

  // Add event listeners for real-time calculation
  balanceList.querySelectorAll(".balance-input").forEach((input) => {
    input.addEventListener("input", updateBalanceValues)
  })

  showModal("openingBalanceModal")
}

function updateBalanceValues() {
  document.querySelectorAll(".balance-item").forEach((item) => {
    const input = item.querySelector(".balance-input")
    const itemId = Number.parseInt(input.dataset.itemId)
    const inventoryItem = inventory.find((i) => i.id === itemId)
    const quantity = Number.parseInt(input.value) || 0
    const value = quantity * inventoryItem.price
    item.querySelector(".balance-value").textContent = `$${value.toFixed(2)}`
  })
}

function saveOpeningBalance() {
  const balanceInputs = document.querySelectorAll(".balance-input")
  const transaction = {
    id: Date.now(),
    type: "opening_balance",
    date: new Date().toISOString(),
    items: [],
  }

  balanceInputs.forEach((input) => {
    const itemId = Number.parseInt(input.dataset.itemId)
    const newStock = Number.parseInt(input.value) || 0
    const itemIndex = inventory.findIndex((i) => i.id === itemId)

    if (itemIndex !== -1) {
      const oldStock = inventory[itemIndex].stock
      inventory[itemIndex].stock = newStock

      transaction.items.push({
        itemId: itemId,
        itemName: inventory[itemIndex].name,
        oldStock: oldStock,
        newStock: newStock,
        difference: newStock - oldStock,
      })
    }
  })

  stockTransactions.push(transaction)
  saveData()
  updateInventoryList()
  closeModals()
  alert("Opening balance saved successfully!")
}

function showClosingBalanceModal() {
  if (inventory.length === 0) {
    alert("No inventory items found.")
    return
  }

  const balanceList = document.getElementById("closingBalanceList")
  balanceList.innerHTML = inventory
    .map(
      (item) => `
        <div class="balance-item">
            <div class="balance-item-info">
                <h5>${item.name}</h5>
                <p>Category: ${item.category} | Price: $${item.price.toFixed(2)}</p>
            </div>
            <div>
                <label>Current Stock</label>
                <p>${item.stock} ${item.unit}</p>
            </div>
            <div>
                <label>Min Stock</label>
                <p>${item.minStock} ${item.unit}</p>
            </div>
            <div>
                <label>Stock Value</label>
                <p>$${(item.stock * item.price).toFixed(2)}</p>
            </div>
        </div>
    `,
    )
    .join("")

  showModal("closingBalanceModal")
}

function generateClosingBalance() {
  const transaction = {
    id: Date.now(),
    type: "closing_balance",
    date: new Date().toISOString(),
    items: inventory.map((item) => ({
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      currentStock: item.stock,
      minStock: item.minStock,
      unitPrice: item.price,
      totalValue: item.stock * item.price,
      unit: item.unit,
      status: item.stock === 0 ? "out-of-stock" : item.stock <= item.minStock ? "low-stock" : "in-stock",
    })),
    totalValue: inventory.reduce((sum, item) => sum + item.stock * item.price, 0),
  }

  stockTransactions.push(transaction)
  saveData()
  closeModals()

  // Generate and download closing balance report
  exportClosingBalanceReport(transaction)
  alert("Closing balance report generated successfully!")
}

// Excel Export Functions
function exportInventoryToExcel() {
  if (inventory.length === 0) {
    alert("No inventory data to export.")
    return
  }

  const workbook = XLSX.utils.book_new()

  // Inventory Sheet
  const inventoryData = inventory.map((item) => ({
    "Item Name": item.name,
    Category: item.category,
    "Unit Price": item.price,
    "Current Stock": item.stock,
    Unit: item.unit,
    "Min Stock": item.minStock,
    "Stock Value": item.stock * item.price,
    Status: item.stock === 0 ? "Out of Stock" : item.stock <= item.minStock ? "Low Stock" : "In Stock",
    Description: item.description || "",
    "Created Date": new Date(item.createdAt).toLocaleDateString(),
  }))

  const inventorySheet = XLSX.utils.json_to_sheet(inventoryData)
  XLSX.utils.book_append_sheet(workbook, inventorySheet, "Inventory")

  // Bills Sheet
  if (bills.length > 0) {
    const billsData = bills.map((bill) => ({
      "Bill Number": bill.billNumber,
      Type: bill.type,
      "Customer Name": bill.customerName,
      "Customer Phone": bill.customerPhone || "",
      Date: new Date(bill.date).toLocaleDateString(),
      "Items Count": bill.items.length,
      Subtotal: bill.subtotal,
      "Discount %": bill.discount,
      "Tax %": bill.tax,
      "Total Amount": bill.total,
      Notes: bill.notes || "",
    }))

    const billsSheet = XLSX.utils.json_to_sheet(billsData)
    XLSX.utils.book_append_sheet(workbook, billsSheet, "Bills")

    // Bill Items Detail Sheet
    const billItemsData = []
    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        billItemsData.push({
          "Bill Number": bill.billNumber,
          Customer: bill.customerName,
          "Item Name": item.name,
          Quantity: item.quantity,
          "Unit Price": item.price,
          Total: item.total,
          Date: new Date(bill.date).toLocaleDateString(),
        })
      })
    })

    const billItemsSheet = XLSX.utils.json_to_sheet(billItemsData)
    XLSX.utils.book_append_sheet(workbook, billItemsSheet, "Bill Items")
  }

  // Stock Transactions Sheet
  if (stockTransactions.length > 0) {
    const transactionsData = []
    stockTransactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        transactionsData.push({
          "Transaction ID": transaction.id,
          Type: transaction.type.replace("_", " ").toUpperCase(),
          Date: new Date(transaction.date).toLocaleDateString(),
          "Item Name": item.itemName,
          "Old Stock": item.oldStock || item.currentStock,
          "New Stock": item.newStock || item.currentStock,
          Difference: item.difference || 0,
          Status: item.status || "",
        })
      })
    })

    const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData)
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Stock Transactions")
  }

  // Export file
  const fileName = `Billing_Report_${new Date().toISOString().split("T")[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

function exportClosingBalanceReport(transaction) {
  const workbook = XLSX.utils.book_new()

  const reportData = transaction.items.map((item) => ({
    "Item Name": item.itemName,
    Category: item.category,
    "Current Stock": item.currentStock,
    Unit: item.unit,
    "Unit Price": item.unitPrice,
    "Stock Value": item.totalValue,
    "Min Stock": item.minStock,
    Status: item.status.replace("-", " ").toUpperCase(),
  }))

  // Add summary row
  reportData.push({
    "Item Name": "TOTAL",
    Category: "",
    "Current Stock": "",
    Unit: "",
    "Unit Price": "",
    "Stock Value": transaction.totalValue,
    "Min Stock": "",
    Status: "",
  })

  const sheet = XLSX.utils.json_to_sheet(reportData)
  XLSX.utils.book_append_sheet(workbook, sheet, "Closing Balance")

  const fileName = `Closing_Balance_${new Date().toISOString().split("T")[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

// Updated Bill Form with Item Selection
function addBillItemWithDropdown() {
  const itemsList = document.getElementById("billItemsList")
  const itemId = Date.now()

  const itemHtml = `
        <div class="bill-item-card" data-item-id="${itemId}">
            <div class="bill-item-row">
                <div class="form-group">
                    <label>Select Item</label>
                    <div class="item-select-group">
                        <input type="text" class="form-control item-search" placeholder="Search and select item..." autocomplete="off">
                        <div class="item-dropdown">
                            ${inventory
                              .map(
                                (item) => `
                                <div class="item-option" data-item-id="${item.id}" data-price="${item.price}" data-stock="${item.stock}" data-unit="${item.unit}">
                                    <div class="item-option-name">${item.name}</div>
                                    <div class="item-option-details">Price: $${item.price.toFixed(2)} | Stock: ${item.stock} ${item.unit}</div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="form-control item-quantity" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" class="form-control item-price" min="0" step="0.01" value="0" required>
                </div>
                <div class="item-total">
                    <label>Total</label>
                    <div class="item-total-value">$0.00</div>
                </div>
                <div class="form-group">
                    ${
                      itemsList.children.length > 0
                        ? `
                        <button type="button" class="btn btn-outline remove-bill-item-btn">
                            <i class="fas fa-minus"></i>
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
            <div class="stock-warning" style="display: none;">
                <i class="fas fa-exclamation-triangle"></i>
                <span class="warning-text"></span>
            </div>
        </div>
    `

  itemsList.insertAdjacentHTML("beforeend", itemHtml)

  // Add event listeners for the new item
  const newItem = itemsList.lastElementChild
  const searchInput = newItem.querySelector(".item-search")
  const dropdown = newItem.querySelector(".item-dropdown")
  const quantityInput = newItem.querySelector(".item-quantity")
  const priceInput = newItem.querySelector(".item-price")
  const removeBtn = newItem.querySelector(".remove-bill-item-btn")

  // Search functionality
  searchInput.addEventListener("focus", () => {
    dropdown.classList.add("active")
  })

  searchInput.addEventListener("blur", (e) => {
    // Delay hiding to allow option selection
    setTimeout(() => {
      dropdown.classList.remove("active")
    }, 200)
  })

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const options = dropdown.querySelectorAll(".item-option")

    options.forEach((option) => {
      const itemName = option.querySelector(".item-option-name").textContent.toLowerCase()
      if (itemName.includes(searchTerm)) {
        option.style.display = "block"
      } else {
        option.style.display = "none"
      }
    })
  })

  // Item selection
  dropdown.querySelectorAll(".item-option").forEach((option) => {
    option.addEventListener("click", () => {
      const itemName = option.querySelector(".item-option-name").textContent
      const price = Number.parseFloat(option.dataset.price)
      const stock = Number.parseInt(option.dataset.stock)
      const selectedItemId = Number.parseInt(option.dataset.itemId)

      searchInput.value = itemName
      priceInput.value = price
      newItem.dataset.selectedItemId = selectedItemId
      newItem.dataset.availableStock = stock

      dropdown.classList.remove("active")
      calculateTotals()
      checkStockAvailability(newItem)
    })
  })

  quantityInput.addEventListener("input", () => {
    calculateTotals()
    checkStockAvailability(newItem)
  })
  priceInput.addEventListener("input", calculateTotals)

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      newItem.remove()
      calculateTotals()
    })
  }
}

function checkStockAvailability(itemElement) {
  const selectedItemId = itemElement.dataset.selectedItemId
  const availableStock = Number.parseInt(itemElement.dataset.availableStock)
  const requestedQuantity = Number.parseInt(itemElement.querySelector(".item-quantity").value) || 0
  const warningDiv = itemElement.querySelector(".stock-warning")
  const warningText = itemElement.querySelector(".warning-text")

  if (selectedItemId && requestedQuantity > availableStock) {
    warningDiv.style.display = "block"
    warningText.textContent = `Warning: Requested quantity (${requestedQuantity}) exceeds available stock (${availableStock})`
  } else {
    warningDiv.style.display = "none"
  }
}

// Update the handleCreateBill function to reduce inventory stock
function updateInventoryAfterBill(billItems) {
  billItems.forEach((billItem) => {
    const itemElement = document.querySelector(`[data-item-id="${billItem.elementId}"]`)
    if (itemElement && itemElement.dataset.selectedItemId) {
      const inventoryItemId = Number.parseInt(itemElement.dataset.selectedItemId)
      const inventoryItemIndex = inventory.findIndex((i) => i.id === inventoryItemId)

      if (inventoryItemIndex !== -1) {
        inventory[inventoryItemIndex].stock -= billItem.quantity
        if (inventory[inventoryItemIndex].stock < 0) {
          inventory[inventoryItemIndex].stock = 0
        }
      }
    }
  })
}

// Declare XLSX variable
const XLSX = require("xlsx")
