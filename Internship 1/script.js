$(document).ready(function() {
    // Initialize date fields with today's date
    const today = new Date().toISOString().split('T')[0];
    $('#date').val(today);
    
    // Load expenses from localStorage
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // Display expenses and summary
    displayExpenses();
    updateSummary();
    
    // Handle form submission
    $('#expenseForm').submit(function(e) {
        e.preventDefault();
        
        // Get form values
        const amount = parseFloat($('#amount').val());
        const category = $('#category').val();
        const date = $('#date').val();
        const description = $('#description').val().trim();
        
        // Create new expense object
        const newExpense = {
            id: Date.now(), // Unique ID based on timestamp
            amount: amount,
            category: category,
            date: date,
            description: description
        };
        
        // Add to expenses array
        expenses.push(newExpense);
        
        // Save to localStorage
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        // Update UI
        displayExpenses();
        updateSummary();
        
        // Reset form
        $('#expenseForm')[0].reset();
        $('#date').val(today);
        $('#amount').focus();
    });
    
    // Handle filter application
    $('#applyFilters').click(function() {
        displayExpenses();
    });
    
    // Function to display expenses
    function displayExpenses() {
        const expenseList = $('#expenseList');
        expenseList.empty();
        
        // Get filter values
        const categoryFilter = $('#filterCategory').val();
        const dateFrom = $('#filterDateFrom').val();
        const dateTo = $('#filterDateTo').val();
        
        // Filter expenses
        let filteredExpenses = [...expenses];
        
        if (categoryFilter) {
            filteredExpenses = filteredExpenses.filter(exp => exp.category === categoryFilter);
        }
        
        if (dateFrom) {
            filteredExpenses = filteredExpenses.filter(exp => exp.date >= dateFrom);
        }
        
        if (dateTo) {
            filteredExpenses = filteredExpenses.filter(exp => exp.date <= dateTo);
        }
        
        // Display filtered expenses or message if empty
        if (filteredExpenses.length === 0) {
            expenseList.append('<p class="text-muted text-center">No expenses found.</p>');
            return;
        }
        
        // Sort by date (newest first)
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add each expense to the list
        filteredExpenses.forEach(expense => {
            const expenseItem = $(`
                <div class="expense-item" data-id="${expense.id}">
                    <div class="expense-details">
                        <div class="d-flex justify-content-between">
                            <span class="expense-amount">₹${expense.amount.toFixed(2)}</span>
                            <span class="expense-category">${expense.category}</span>
                        </div>
                        <div class="expense-description">${expense.description || 'No description'}</div>
                        <div class="expense-date">${formatDate(expense.date)}</div>
                    </div>
                    <button class="delete-btn" title="Delete expense">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `);
            
            expenseList.append(expenseItem);
        });
        
        // Add delete event handlers
        $('.delete-btn').click(function() {
            const expenseId = parseInt($(this).closest('.expense-item').data('id'));
            deleteExpense(expenseId);
        });
    }
    
    // Function to delete an expense
    function deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            expenses = expenses.filter(exp => exp.id !== id);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            displayExpenses();
            updateSummary();
        }
    }
    
    // Function to update summary
    function updateSummary() {
        // Calculate total expenses
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        $('#totalExpenses').text(`₹${total.toFixed(2)}`);
        
        // Calculate category breakdown
        const categorySummary = $('#categorySummary');
        categorySummary.empty();
        
        if (expenses.length === 0) {
            categorySummary.append('<p class="text-muted">No expenses to categorize.</p>');
            return;
        }
        
        // Group by category
        const categories = {};
        expenses.forEach(exp => {
            if (!categories[exp.category]) {
                categories[exp.category] = 0;
            }
            categories[exp.category] += exp.amount;
        });
        
        // Sort categories by amount (descending)
        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1]);
        
        // Display each category
        sortedCategories.forEach(([category, amount]) => {
            const percentage = ((amount / total) * 100).toFixed(1);
            
            const categoryItem = $(`
                <div class="category-item">
                    <span class="category-name">${category}</span>
                    <span>
                        <span class="me-2">₹${amount.toFixed(2)}</span>
                        <span class="category-percentage">${percentage}%</span>
                    </span>
                </div>
            `);
            
            categorySummary.append(categoryItem);
        });
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
});