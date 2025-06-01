// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.querySelector('.theme-toggle');
const themeToggleDropdown = document.querySelector('.theme-toggle-dropdown');
const profileDropdown = document.querySelector('.profile-dropdown');
const profileImg = document.querySelector('.profile-img');
const onboardingModal = document.getElementById('onboarding-modal');
const onboardingSteps = document.querySelectorAll('.onboarding-step');
const progressBar = document.getElementById('onboarding-progress');
const userNameInput = document.getElementById('user-name');
const initialAmountInput = document.getElementById('initial-amount');
const profitPercentageInput = document.getElementById('profit-percentage');
const activityModal = document.getElementById('activity-modal');
const activityDaySelect = document.getElementById('activity-day');
const activityAchievedSelect = document.getElementById('activity-achieved');
const activityLostInput = document.getElementById('activity-lost');
const imageModal = document.getElementById('image-modal');
const imagePreview = document.getElementById('image-preview');
const profileImageUpload = document.getElementById('profile-image-upload');
const profileDisplayImg = document.getElementById('profile-display-img');
const editNameInput = document.getElementById('edit-name');
const editAmountInput = document.getElementById('edit-amount');
const editPercentageInput = document.getElementById('edit-percentage');
const toast = document.getElementById('toast');
const contactForm = document.getElementById('contact-form');
const currentBalanceEl = document.getElementById('current-balance');
const profitToMakeEl = document.getElementById('profit-to-make');
const lostMoneyEl = document.getElementById('lost-money');
const savingAmountEl = document.getElementById('saving-amount');
const activitiesList = document.getElementById('activities-list');
const tradingTableBody = document.getElementById('trading-table-body');
const profileInitialAmount = document.getElementById('profile-initial-amount');
const profileCurrentProfit = document.getElementById('profile-current-profit');
const profileTotalLost = document.getElementById('profile-total-lost');
const profileTotalSaved = document.getElementById('profile-total-saved');

// Chart Variables
let progressChart;

// App State
let state = {
    user: {
        name: '',
        initialAmount: 0,
        profitPercentage: 0,
        image: '',
        darkMode: false
    },
    tradingData: [],
    activities: []
};

// Initialize the app
function init() {
    loadState();
    setupEventListeners();
    renderProfile();
    renderTradingData();
    renderActivities();
    updateDashboard();
    checkOnboarding();
}

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('tradingAppState');
    if (savedState) {
        state = JSON.parse(savedState);
        
        // Initialize trading data if empty
        if (state.tradingData.length === 0 && state.user.initialAmount > 0) {
            initializeTradingData();
        }
        
        // Apply dark mode if enabled
        if (state.user.darkMode) {
            document.body.setAttribute('data-theme', 'dark');
            updateThemeToggleIcon();
        }
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('tradingAppState', JSON.stringify(state));
}


// Setup event listeners
function setupEventListeners() {
    // Navigation - Handle both navbar links and dropdown links
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Skip if this is the theme toggle
            if (this.classList.contains('theme-toggle') || 
                this.classList.contains('theme-toggle-dropdown')) {
                return;
            }
            
            e.preventDefault();
            const page = this.getAttribute('data-page');
            
            // Handle navigation
            showPage(page);
            
            // Update active states in both navbar and dropdown
            updateActiveNavState(page);
            
            // Close dropdown if it's open
            const dropdown = document.querySelector('.dropdown-content');
            if (dropdown && dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            }
        });
    });
    
    // Profile dropdown toggle
    profileImg.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent document click from closing immediately
        const dropdown = document.querySelector('.dropdown-content');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.profile-dropdown')) {
            const dropdown = document.querySelector('.dropdown-content');
            if (dropdown) dropdown.style.display = 'none';
        }
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleDarkMode);
    if (themeToggleDropdown) {
        themeToggleDropdown.addEventListener('click', toggleDarkMode);
    }
    
    // Profile image upload
    profileImageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.src = event.target.result;
                openImageModal();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const subject = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value;
            
            // In a real app, you would send this data to a server
            console.log('Contact form submitted:', { name, email, subject, message });
            
            // Show success message
            showToast('Message sent successfully!');
            
            // Reset form
            contactForm.reset();
        });
    }
}

// Helper function to update active navigation states
function updateActiveNavState(page) {
    document.querySelectorAll('[data-page]').forEach(link => {
        // Skip theme toggle links
        if (link.classList.contains('theme-toggle') || 
            link.classList.contains('theme-toggle-dropdown')) {
            return;
        }
        
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
}





// Check if onboarding is needed
function checkOnboarding() {
    if (!state.user.name || state.user.initialAmount === 0 || state.user.profitPercentage === 0) {
        openOnboardingModal();
    }
}

// Onboarding modal functions
function openOnboardingModal() {
    onboardingModal.classList.add('active');
}

function closeOnboardingModal() {
    onboardingModal.classList.remove('active');
}

function nextStep() {
    const currentStep = document.querySelector('.onboarding-step.active');
    const currentStepNum = parseInt(currentStep.getAttribute('data-step'));
    
    // Validate current step
    if (currentStepNum === 1 && !userNameInput.value.trim()) {
        showToast('Please enter your name');
        return;
    }
    
    if (currentStepNum === 2 && !initialAmountInput.value) {
        showToast('Please enter your initial amount');
        return;
    }
    
    if (currentStepNum === 3 && !profitPercentageInput.value) {
        showToast('Please enter your profit percentage');
        return;
    }
    
    // Hide current step
    currentStep.classList.remove('active');
    
    // Show next step
    const nextStepNum = currentStepNum + 1;
    const nextStep = document.querySelector(`.onboarding-step[data-step="${nextStepNum}"]`);
    
    if (nextStep) {
        nextStep.classList.add('active');
        progressBar.style.width = `${(nextStepNum / 3) * 100}%`;
    }
}

function prevStep() {
    const currentStep = document.querySelector('.onboarding-step.active');
    const currentStepNum = parseInt(currentStep.getAttribute('data-step'));
    
    // Hide current step
    currentStep.classList.remove('active');
    
    // Show previous step
    const prevStepNum = currentStepNum - 1;
    const prevStep = document.querySelector(`.onboarding-step[data-step="${prevStepNum}"]`);
    
    if (prevStep) {
        prevStep.classList.add('active');
        progressBar.style.width = `${(prevStepNum / 3) * 100}%`;
    }
}

function finishOnboarding() {
    // Save user data
    state.user = {
        ...state.user,
        name: userNameInput.value.trim(),
        initialAmount: parseFloat(initialAmountInput.value),
        profitPercentage: parseFloat(profitPercentageInput.value)
    };
    
    // Initialize trading data
    initializeTradingData();
    
    // Save state
    saveState();
    
    // Close modal
    closeOnboardingModal();
    
    // Update UI
    renderProfile();
    renderTradingData();
    updateDashboard();
    
    // Show welcome message
    showToast(`Welcome, ${state.user.name}! Let's start trading.`);
}

function setAmount(amount) {
    initialAmountInput.value = amount;
}

function setPercentage(percentage) {
    profitPercentageInput.value = percentage;
}

// Initialize trading data
function initializeTradingData() {
    state.tradingData = [];
    let balance = state.user.initialAmount;
    
    for (let day = 1; day <= 30; day++) {
        const profitToBeMade = balance * (state.user.profitPercentage / 100);
        const halfProfit = profitToBeMade / 2;
        const expectedBalance = balance + halfProfit;
        const lostMoney = 0;
        const savingBalance = halfProfit - lostMoney;
        
        state.tradingData.push({
            day,
            balance,
            profitToBeMade,
            expectedBalance,
            lostMoney,
            savingBalance,
            achieved: 'auto'
        });
        
        balance = expectedBalance;
        
        
    }
    
    saveState();
}

// Show page
function showPage(page) {
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}-page`).classList.add('active');
    
    // Special handling for chart page
    if (page === 'home') {
        renderChart();
    }
}

// Toggle dark mode
function toggleDarkMode() {
    state.user.darkMode = !state.user.darkMode;
    
    if (state.user.darkMode) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }
    
    updateThemeToggleIcon();
    saveState();
}

function updateThemeToggleIcon() {
    const icons = document.querySelectorAll('.theme-toggle i, .theme-toggle-dropdown i');
    icons.forEach(icon => {
        icon.className = state.user.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    });
}

// Render profile data
function renderProfile() {
    if (!state.user.name) return;
    
    // Update profile image
    if (state.user.image) {
        profileImg.src = state.user.image;
        profileDisplayImg.src = state.user.image;
    } else {
        // Generate avatar based on name
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(state.user.name)}&background=random`;
        profileImg.src = avatarUrl;
        profileDisplayImg.src = avatarUrl;
    }
    
    // Update form fields
    editNameInput.value = state.user.name;
    editAmountInput.value = state.user.initialAmount;
    editPercentageInput.value = state.user.profitPercentage;
    
    // Update profile stats
    const totalAmount = calculateTotalAmount();
  const totalElement = document.getElementById('profile-total-amount');
  if (totalElement) {
    totalElement.textContent = `$${totalAmount.toFixed(2)}`;
  }
    profileInitialAmount.textContent = `$${state.user.initialAmount.toFixed(2)}`;
    
    const totalProfit = calculateTotalProfit();
    const totalLost = calculateTotalLost();
    const totalSaved = calculateTotalSaved();
    
    profileCurrentProfit.textContent = `$${totalProfit.toFixed(2)}`;
    profileTotalLost.textContent = `$${totalLost.toFixed(2)}`;
    profileTotalSaved.textContent = `$${totalSaved.toFixed(2)}`;
}

// Save profile changes
function saveProfile() {
    const newName = editNameInput.value.trim();
    const newAmount = parseFloat(editAmountInput.value);
    const newPercentage = parseFloat(editPercentageInput.value);
    
    if (!newName || isNaN(newAmount) || isNaN(newPercentage)) {
        showToast('Please fill all fields correctly');
        return;
    }
    
    state.user = {
        ...state.user,
        name: newName,
        initialAmount: newAmount,
        profitPercentage: newPercentage
    };
    
    // Reinitialize trading data with new amounts
    initializeTradingData();
    
    saveState();
    renderProfile();
    renderTradingData();
    updateDashboard();
    renderActivities();
    
    showToast('Profile updated successfully');
}

// Open image upload modal
function openImageUpload() {
    profileImageUpload.click();
}

// Open image modal
function openImageModal() {
    imageModal.classList.add('active');
}

// Close image modal
function closeImageModal() {
    imageModal.classList.remove('active');
}

// Save profile image
function saveProfileImage() {
    state.user.image = imagePreview.src;
    saveState();
    renderProfile();
    closeImageModal();
    showToast('Profile image updated');
}

// Render trading data table
function renderTradingData() {
    if (!state.tradingData || state.tradingData.length === 0) return;
    
    tradingTableBody.innerHTML = '';
    
    state.tradingData.forEach((data, index) => {
        const row = document.createElement('tr');
        
        if (data.achieved === 'no') {
            row.classList.add('cancelled-row');
        }
        
        row.innerHTML = `
            <td>${data.day}</td>
            <td>$${data.balance.toFixed(2)}</td>
            <td>$${data.profitToBeMade.toFixed(2)}</td>
            <td>$${data.expectedBalance.toFixed(2)}</td>
            <td>$${data.lostMoney.toFixed(2)}</td>
            <td>$${data.savingBalance.toFixed(2)}</td>
            <td class="${getAchievedClass(data.achieved)}">
                ${formatAchieved(data.achieved)}
            </td>
            <td class="table-actions">
                <button class="action-btn edit-btn" onclick="editDay(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteDay(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tradingTableBody.appendChild(row);
    });
}

function getAchievedClass(achieved) {
    switch (achieved) {
        case 'yes': return 'achieved-yes';
        case 'no': return 'achieved-no';
        default: return 'achieved-auto';
    }
}

function formatAchieved(achieved) {
    switch (achieved) {
        case 'yes': return 'Yes';
        case 'no': return 'No';
        default: return 'Auto';
    }
}

// Edit day data
function editDay(index) {
    const dayData = state.tradingData[index];
    
    // Populate activity modal
    activityDaySelect.innerHTML = '';
    const option = document.createElement('option');
    option.value = dayData.day;
    option.textContent = `Day ${dayData.day}`;
    option.selected = true;
    activityDaySelect.appendChild(option);
    
    activityAchievedSelect.value = dayData.achieved;
    activityLostInput.value = dayData.lostMoney;
    
    // Show modal
    activityModal.classList.add('active');
    
    // Store the index of the day being edited
    activityModal.setAttribute('data-edit-index', index);
}

// Delete day data
function deleteDay(index) {
    if (confirm('Are you sure you want to reset this day?')) {
        const dayData = state.tradingData[index];
        
        // Reset the day
        state.tradingData[index] = {
            ...dayData,
            profitToBeMade: 0,
            expectedBalance: dayData.balance,
            lostMoney: 0,
            savingBalance: 0,
            achieved: 'no'
        };
        
        // Recalculate subsequent days
        recalculateDaysFrom(index + 1);
        
        saveState();
        renderTradingData();
        updateDashboard();
        renderActivities();
        
        showToast('Day reset successfully');
    }
}

// Recalculate days from a specific index
function recalculateDaysFrom(startIndex) {
    let balance = startIndex > 0 ? state.tradingData[startIndex - 1].expectedBalance : state.user.initialAmount;
    
    for (let i = startIndex; i < state.tradingData.length; i++) {
        const dayData = state.tradingData[i];
        
        if (dayData.achieved !== 'no') {
            const profitToBeMade = balance * (state.user.profitPercentage / 100);
            const expectedBalance = balance + profitToBeMade;
            const savingBalance = (profitToBeMade / 2) - dayData.lostMoney;
            
            state.tradingData[i] = {
                ...dayData,
                balance,
                profitToBeMade,
                expectedBalance,
                savingBalance
            };
            
            balance = expectedBalance;
        } else {
            // For cancelled days, keep the same balance
            state.tradingData[i] = {
                ...dayData,
                balance,
                profitToBeMade: 0,
                expectedBalance: balance,
                savingBalance: 0
            };
        }
    }
    
    saveState();
}

// Show add activity modal
function showAddActivityModal() {
    // Populate day select
    activityDaySelect.innerHTML = '';
    
    state.tradingData.forEach(dayData => {
        const option = document.createElement('option');
        option.value = dayData.day;
        option.textContent = `Day ${dayData.day}`;
        activityDaySelect.appendChild(option);
    });
    
    // Reset other fields
    activityAchievedSelect.value = 'auto';
    activityLostInput.value = '0';
    
    // Remove edit index attribute
    activityModal.removeAttribute('data-edit-index');
    
    // Show modal
    activityModal.classList.add('active');
}

// Close activity modal
function closeActivityModal() {
    activityModal.classList.remove('active');
}

// Save activity
function saveActivity() {
    const day = parseInt(activityDaySelect.value);
    const achieved = activityAchievedSelect.value;
    const lostMoney = parseFloat(activityLostInput.value) || 0;
    
    const dayIndex = state.tradingData.findIndex(d => d.day === day);
    if (dayIndex === -1) return;
    
    const dayData = state.tradingData[dayIndex];
    let newDayData = { ...dayData };
    
    // Check if we're editing an existing day or adding new data
    const isEdit = activityModal.hasAttribute('data-edit-index');
    
    if (isEdit) {
        // Update existing day
        newDayData = {
            ...dayData,
            achieved,
            lostMoney
        };
        
        // Recalculate saving balance
        newDayData.savingBalance = (newDayData.profitToBeMade / 2) - newDayData.lostMoney;
        
        // If marked as no, zero out profit values
        if (achieved === 'no') {
            newDayData.profitToBeMade = 0;
            newDayData.expectedBalance = newDayData.balance;
            newDayData.savingBalance = 0;
        }
        
        state.tradingData[dayIndex] = newDayData;
    } else {
        // For new activity, we'll just update the existing day
        newDayData = {
            ...dayData,
            achieved,
            lostMoney,
            savingBalance: (dayData.profitToBeMade / 2) - lostMoney
        };
        
        if (achieved === 'no') {
            newDayData.profitToBeMade = 0;
            newDayData.expectedBalance = dayData.balance;
            newDayData.savingBalance = 0;
        }
        
        state.tradingData[dayIndex] = newDayData;
    }
    
    // Recalculate subsequent days
    recalculateDaysFrom(dayIndex + 1);
    
    // Save and update UI
    saveState();
    renderTradingData();
    updateDashboard();
    renderActivities();
    closeActivityModal();
    
    showToast('Activity saved successfully');
}

// Render recent activities
function renderActivities() {
    if (!state.tradingData || state.tradingData.length === 0) return;
    
    // Filter days with actual activity (lost money or achieved status changed)
    const activeDays = state.tradingData.filter(day => 
        day.lostMoney > 0 || day.achieved !== 'auto'
    );
    
    // Get last 5 activities
    const recentActivities = activeDays.slice(-5).reverse();
    
    activitiesList.innerHTML = '';
    
    if (recentActivities.length === 0) {
        activitiesList.innerHTML = '<p class="no-activities">No recent activities yet</p>';
        return;
    }
    
    recentActivities.forEach(day => {
        const activityItem = document.createElement('div');
        activityItem.classList.add('activity-item');
        
        let activityText = '';
        let amountClass = 'activity-neutral';
        let amountText = '';
        
        if (day.achieved === 'no') {
            activityText = `Day ${day.day} marked as not achieved`;
            amountClass = 'activity-negative';
            amountText = '-$0.00';
        } else if (day.lostMoney > 0) {
            activityText = `Lost $${day.lostMoney.toFixed(2)} on Day ${day.day}`;
            amountClass = 'activity-negative';
            amountText = `-$${day.lostMoney.toFixed(2)}`;
        } else if (day.achieved === 'yes') {
            activityText = `Day ${day.day} manually marked as achieved`;
            amountClass = 'activity-positive';
            amountText = `+$${day.profitToBeMade.toFixed(2)}`;
        } else {
            activityText = `Day ${day.day} completed normally`;
            amountClass = 'activity-positive';
            amountText = `+$${day.profitToBeMade.toFixed(2)}`;
        }
        
        activityItem.innerHTML = `
            <div class="activity-info">
                <span class="activity-day">${day.day}</span>
                <div class="activity-details">${activityText}</div>
            </div>
            <div class="activity-amount ${amountClass}">${amountText}</div>
        `;
        
        activitiesList.appendChild(activityItem);
    });
}

// Update dashboard stats
function updateDashboard() {
    if (!state.tradingData || state.tradingData.length === 0) return;
    
    const currentDayIndex = getCurrentDayIndex();
    const currentDayData = state.tradingData[currentDayIndex];
    
    if (!currentDayData) return;
    
    currentBalanceEl.textContent = `$${currentDayData.balance.toFixed(2)}`;
    profitToMakeEl.textContent = `$${currentDayData.profitToBeMade.toFixed(2)}`;
    lostMoneyEl.textContent = `$${currentDayData.lostMoney.toFixed(2)}`;
    savingAmountEl.textContent = `$${currentDayData.savingBalance.toFixed(2)}`;
    document.getElementById('total-amount').textContent = 
    `$${calculateTotalAmount().toFixed(2)}`;
    // Update chart
    renderChart();
}

// Get current day index (0-based)
function getCurrentDayIndex() {
    if (!state.tradingData || state.tradingData.length === 0) return -1;
    
    // Find the first day that hasn't been completed (achieved = 'no' or not 'yes')
    const incompleteDay = state.tradingData.find(day => day.achieved !== 'yes');
    
    // If all days are marked as yes, return the last day
    if (!incompleteDay) return state.tradingData.length - 1;
    
    // Otherwise return the previous day (or 0 if it's the first day)
    return Math.max(incompleteDay.day - 2, 0);
}

function calculateTotalAmount() {
  const initialAmount = state.user.initialAmount || 0;
  
  const totalProfit = state.tradingData.reduce((sum, day) => {
    return day.achieved === 'yes' ? sum + day.profitToBeMade : sum;
  }, 0);
  
  return initialAmount + totalProfit;
}

// Calculate total profit
function calculateTotalProfit() {
    if (!state.tradingData || state.tradingData.length === 0) return 0;
    
    return state.tradingData.reduce((total, day) => {
        return day.achieved === 'no' ? total : total + day.profitToBeMade;
    }, 0);
}

// Calculate total lost money
function calculateTotalLost() {
    if (!state.tradingData || state.tradingData.length === 0) return 0;
    
    return state.tradingData.reduce((total, day) => {
        return total + day.lostMoney;
    }, 0);
}

// Calculate total saved amount
function calculateTotalSaved() {
    if (!state.tradingData || state.tradingData.length === 0) return 0;
    
    return state.tradingData.reduce((total, day) => {
        return day.achieved === 'no' ? total : total + day.savingBalance;
    }, 0);
}

// Render chart
function renderChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (progressChart) {
        progressChart.destroy();
    }
    
    // Prepare data
    const labels = state.tradingData.map(day => `Day ${day.day}`);
    const balanceData = state.tradingData.map(day => day.balance);
    const profitData = state.tradingData.map(day => day.profitToBeMade);
    const savingData = state.tradingData.map(day => day.savingBalance);
    
    // Get current day index
    const currentDayIndex = getCurrentDayIndex();
    
    // Create chart
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Balance',
                    data: balanceData,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Profit',
                    data: profitData,
                    borderColor: '#4cc9f0',
                    backgroundColor: 'rgba(76, 201, 240, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Savings',
                    data: savingData,
                    borderColor: '#43aa8b',
                    backgroundColor: 'rgba(67, 170, 139, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--dark-color')
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--light-gray')
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--dark-color')
                    }
                },
                y: {
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--light-gray')
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--dark-color'),
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            },
            annotation: {
                annotations: [
                    {
                        type: 'line',
                        mode: 'vertical',
                        scaleID: 'x',
                        value: currentDayIndex,
                        borderColor: '#f72585',
                        borderWidth: 2,
                        label: {
                            content: 'Current',
                            enabled: true,
                            position: 'top'
                        }
                    }
                ]
            }
        }
    });
}

// Import data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // Validate imported data
                if (!importedData.user || !importedData.tradingData) {
                    throw new Error('Invalid data format');
                }
                
                // Update state
                state = importedData;
                saveState();
                
                // Update UI
                renderProfile();
                renderTradingData();
                updateDashboard();
                renderActivities();
                
                showToast('Data imported successfully');
            } catch (error) {
                console.error('Import error:', error);
                showToast('Failed to import data');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportName = `trading-data-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
    
    showToast('Data exported successfully');
}

// Print data
// Updated printData function with loading state
function printData() {
    const printButton = document.querySelector('.btn-print');
    if (printButton) {
        printButton.classList.add('loading');
        printButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
    }

    try {
        const printContent = `
            <html>
                <head>
                    <title>Trading Data for ${state.user.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #000; background: #fff; }
                        h1 { color: #4361ee; margin-bottom: 10px; }
                        p.subtitle { margin-bottom: 20px; color: #555; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .achieved-no { text-decoration: line-through; color: #f00; }
                        .achieved-yes { color: #090; }
                        @page { size: auto; margin: 10mm; }
                        @media print {
                            body { margin: 0; padding: 10px; }
                            .no-print { display: none !important; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Trading Data for ${state.user.name}</h1>
                    <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
                    <p class="subtitle">Initial Amount: $${state.user.initialAmount.toFixed(2)} | Profit Percentage: ${state.user.profitPercentage}%</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Day #</th>
                                <th>Balance</th>
                                <th>Profit To Be Made</th>
                                <th>Expected Balance</th>
                                <th>Lost Money</th>
                                <th>Saving Balance</th>
                                <th>Achieved</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.tradingData.map(day => `
                                <tr>
                                    <td>${day.day}</td>
                                    <td>$${day.balance.toFixed(2)}</td>
                                    <td>$${day.profitToBeMade.toFixed(2)}</td>
                                    <td>$${day.expectedBalance.toFixed(2)}</td>
                                    <td>$${day.lostMoney.toFixed(2)}</td>
                                    <td>$${day.savingBalance.toFixed(2)}</td>
                                    <td class="${getAchievedClass(day.achieved)}">
                                        ${formatAchieved(day.achieved)}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <script>
                        window.addEventListener('load', function() {
                            setTimeout(function() {
                                window.print();
                                setTimeout(function() {
                                    window.close();
                                }, 300);
                            }, 500);
                        });
                    </script>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            throw new Error('Popup blocked. Please allow popups for this site.');
        }

        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

    } catch (error) {
        showToast(error.message);
    } finally {
        if (printButton) {
            setTimeout(() => {
                printButton.classList.remove('loading');
                printButton.innerHTML = '<i class="fas fa-print"></i> Print';
            }, 1000);
        }
    }
}


// New PDF Export function
// Global variable to track PDF generation state
let isGeneratingPDF = false;

// Enhanced print function with proper loading states
async function printData() {
    const printButton = document.querySelector('.btn-print');
    
    try {
        // Set loading state
        if (printButton) {
            printButton.classList.add('loading');
            printButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
            printButton.disabled = true;
        }

        // Create print content
        const printContent = createPrintContent();
        
        // Open print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            throw new Error('Popup blocked. Please allow popups for this site.');
        }

        // Write content to print window
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load
        await new Promise(resolve => {
            printWindow.onload = resolve;
            setTimeout(resolve, 1000); // Fallback timeout
        });

        // Trigger print dialog
        printWindow.print();

        // Close window after printing
        setTimeout(() => {
            printWindow.close();
        }, 500);

    } catch (error) {
        showToast(`Printing failed: ${error.message}`);
        console.error('Print error:', error);
    } finally {
        // Reset button state
        if (printButton) {
            printButton.classList.remove('loading');
            printButton.innerHTML = '<i class="fas fa-print"></i> Print';
            printButton.disabled = false;
        }
    }
}

// Create print content HTML
function createPrintContent() {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Trading Data for ${state.user.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 15mm; color: #000; }
                    h1 { color: #4361ee; margin-bottom: 5mm; font-size: 16pt; }
                    .subtitle { margin-bottom: 5mm; color: #555; font-size: 10pt; }
                    table { width: 100%; border-collapse: collapse; margin-top: 5mm; font-size: 9pt; }
                    th, td { border: 1px solid #ddd; padding: 2mm; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .achieved-no { text-decoration: line-through; color: #f00; }
                    .achieved-yes { color: #090; }
                    @page { size: Letter; margin: 15mm; }
                </style>
            </head>
            <body>
                <h1>Trading Data for ${state.user.name}</h1>
                <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
                <p class="subtitle">Initial Amount: $${state.user.initialAmount.toFixed(2)} | Profit Percentage: ${state.user.profitPercentage}%</p>
                <table>
                    <thead>
                        <tr>
                            <th>Day #</th>
                            <th>Balance</th>
                            <th>Profit</th>
                            <th>Expected</th>
                            <th>Lost</th>
                            <th>Saving</th>
                            <th>Achieved</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.tradingData.map(day => `
                            <tr>
                                <td>${day.day}</td>
                                <td>$${day.balance.toFixed(2)}</td>
                                <td>$${day.profitToBeMade.toFixed(2)}</td>
                                <td>$${day.expectedBalance.toFixed(2)}</td>
                                <td>$${day.lostMoney.toFixed(2)}</td>
                                <td>$${day.savingBalance.toFixed(2)}</td>
                                <td class="${getAchievedClass(day.achieved)}">
                                    ${formatAchieved(day.achieved)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `;
}

// Reliable PDF export function
async function exportAsPDF() {
    if (isGeneratingPDF) return;
    isGeneratingPDF = true;
    
    const pdfButton = document.querySelector('.btn-pdf');
    
    try {
        // Set loading state
        if (pdfButton) {
            pdfButton.classList.add('loading');
            pdfButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            pdfButton.disabled = true;
        }

        // Load jsPDF dynamically if not already loaded
        if (!window.jspdf) {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'letter'
        });

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(67, 97, 238);
        doc.text(`Trading Data for ${state.user.name}`, 20, 15);

        // Add subtitle
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 22);
        doc.text(`Initial Amount: $${state.user.initialAmount.toFixed(2)} | Profit Percentage: ${state.user.profitPercentage}%`, 20, 28);

        // Prepare table data
        const headers = [
            'Day #',
            'Balance',
            'Profit',
            'Expected',
            'Lost',
            'Saving',
            'Achieved'
        ];

        const data = state.tradingData.map(day => [
            day.day,
            `$${day.balance.toFixed(2)}`,
            `$${day.profitToBeMade.toFixed(2)}`,
            `$${day.expectedBalance.toFixed(2)}`,
            `$${day.lostMoney.toFixed(2)}`,
            `$${day.savingBalance.toFixed(2)}`,
            formatAchieved(day.achieved)
        ]);

        // Add table
        doc.autoTable({
            head: [headers],
            body: data,
            startY: 35,
            margin: { left: 20, right: 20 },
            styles: {
                fontSize: 8,
                cellPadding: 2,
                valign: 'middle',
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [67, 97, 238],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            },
            didDrawCell: function(data) {
                if (data.column.index === 6) {
                    if (data.cell.raw === 'No') {
                        doc.setTextColor(255, 0, 0);
                    } else if (data.cell.raw === 'Yes') {
                        doc.setTextColor(0, 128, 0);
                    }
                }
            }
        });

        // Save the PDF
        doc.save(`trading-data-${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (error) {
        showToast(`PDF generation failed: ${error.message}`);
        console.error('PDF error:', error);
    } finally {
        isGeneratingPDF = false;
        if (pdfButton) {
            pdfButton.classList.remove('loading');
            pdfButton.innerHTML = '<i class="fas fa-file-pdf"></i> Export PDF';
            pdfButton.disabled = false;
        }
    }
}

// Helper function to load scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}


// Reset trading data
function resetTradingData() {
    if (confirm('Are you sure you want to reset all trading data? This cannot be undone.')) {
        initializeTradingData();
        saveState();
        renderTradingData();
        updateDashboard();
        renderActivities();
        showToast('Trading data reset successfully');
    }
}

// Show toast notification
function showToast(message) {
    const toastMessage = toast.querySelector('.toast-message');
    toastMessage.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);