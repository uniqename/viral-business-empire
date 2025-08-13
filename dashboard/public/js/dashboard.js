// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.socket = null;
        this.revenueChart = null;
        this.isConnected = false;
        this.data = {
            revenue: {
                total: 0,
                today: 0,
                available: 0,
                platforms: {}
            },
            health: {
                systemHealth: 'unknown',
                platforms: {}
            },
            automation: {
                activeWorkflows: 0,
                contentGenerated: 0
            }
        };
        
        this.init();
    }

    init() {
        console.log('🎛️ Initializing Business Dashboard...');
        
        // Initialize Socket.IO connection
        this.initSocket();
        
        // Initialize charts
        this.initCharts();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start periodic updates
        this.startPeriodicUpdates();
        
        console.log('✅ Dashboard initialized successfully');
    }

    initSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('🔗 Connected to dashboard server');
            this.isConnected = true;
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from dashboard server');
            this.isConnected = false;
            this.updateConnectionStatus(false);
        });

        // Revenue updates
        this.socket.on('revenue-update', (data) => {
            this.updateRevenueData(data);
        });

        // Health updates
        this.socket.on('health-update', (data) => {
            this.updateHealthData(data);
        });

        // Automation updates
        this.socket.on('automation-update', (data) => {
            this.updateAutomationData(data);
        });

        // Alerts
        this.socket.on('new-alert', (alert) => {
            this.showAlert(alert.message, alert.type);
        });

        // Critical alerts
        this.socket.on('critical-alert', (alert) => {
            this.showAlert(alert.message, 'critical');
            this.playAlertSound();
        });

        // Payout results
        this.socket.on('payout-success', (result) => {
            this.handlePayoutSuccess(result);
        });

        this.socket.on('payout-error', (error) => {
            this.handlePayoutError(error);
        });

        // Initial data
        this.socket.on('initial-data', (data) => {
            console.log('📊 Received initial dashboard data');
            this.data.revenue = data.revenue || this.data.revenue;
            this.data.health = data.health || this.data.health;
            this.data.automation = data.automation || this.data.automation;
            
            this.updateAllDisplays();
        });
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        const icon = statusElement.querySelector('i');
        const text = statusElement.querySelector('span');
        
        if (connected) {
            icon.className = 'fas fa-circle';
            icon.style.color = '#28a745';
            text.textContent = 'Connected';
        } else {
            icon.className = 'fas fa-exclamation-circle';
            icon.style.color = '#dc3545';
            text.textContent = 'Disconnected';
        }
    }

    initCharts() {
        // Revenue Chart
        const ctx = document.getElementById('revenue-chart').getContext('2d');
        this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(7),
                datasets: [{
                    label: 'Total Revenue',
                    data: this.generateMockRevenueData(7),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Mobile Apps',
                    data: this.generateMockRevenueData(7, 0.3),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'YouTube',
                    data: this.generateMockRevenueData(7, 0.25),
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Print-on-Demand',
                    data: this.generateMockRevenueData(7, 0.35),
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Courses',
                    data: this.generateMockRevenueData(7, 0.4),
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    generateTimeLabels(days) {
        const labels = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return labels;
    }

    generateMockRevenueData(days, multiplier = 1) {
        const data = [];
        let base = Math.random() * 1000 * multiplier;
        
        for (let i = 0; i < days; i++) {
            base += (Math.random() - 0.5) * 200 * multiplier;
            base = Math.max(0, base);
            data.push(Math.round(base));
        }
        return data;
    }

    setupEventListeners() {
        // Payout button
        const payoutBtn = document.querySelector('[onclick="requestPayout()"]');
        if (payoutBtn) {
            payoutBtn.removeAttribute('onclick');
            payoutBtn.addEventListener('click', () => this.requestPayout());
        }

        // Automation controls
        const pauseAllBtn = document.querySelector('[onclick="pauseAllAutomation()"]');
        if (pauseAllBtn) {
            pauseAllBtn.removeAttribute('onclick');
            pauseAllBtn.addEventListener('click', () => this.pauseAllAutomation());
        }

        const resumeAllBtn = document.querySelector('[onclick="resumeAllAutomation()"]');
        if (resumeAllBtn) {
            resumeAllBtn.removeAttribute('onclick');
            resumeAllBtn.addEventListener('click', () => this.resumeAllAutomation());
        }

        // Platform status clicks
        document.querySelectorAll('.platform-status').forEach(element => {
            element.addEventListener('click', () => {
                const platform = element.dataset.platform;
                this.showPlatformDetails(platform);
            });
        });

        // Revenue timeframe selector
        const timeframeSelect = document.getElementById('revenue-timeframe');
        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', () => this.updateRevenueChart());
        }
    }

    startPeriodicUpdates() {
        // Request fresh data every 30 seconds
        setInterval(() => {
            if (this.isConnected) {
                this.socket.emit('request-fresh-data');
            }
        }, 30000);

        // Update time displays every second
        setInterval(() => {
            this.updateTimeDisplays();
        }, 1000);
    }

    updateRevenueData(revenueData) {
        console.log('💰 Updating revenue data:', revenueData);
        this.data.revenue = { ...this.data.revenue, ...revenueData };
        
        // Update display elements
        document.getElementById('total-revenue').textContent = this.formatCurrency(this.data.revenue.total);
        document.getElementById('today-revenue').textContent = this.formatCurrency(this.data.revenue.today);
        document.getElementById('available-balance').textContent = this.formatCurrency(this.data.revenue.availableBalance || 0);

        // Update modal balance
        const modalBalance = document.getElementById('modal-available-balance');
        if (modalBalance) {
            modalBalance.textContent = this.formatCurrency(this.data.revenue.availableBalance || 0);
        }

        // Add activity feed item
        this.addActivityItem('Revenue updated', 'fas fa-dollar-sign');
    }

    updateHealthData(healthData) {
        console.log('🏥 Updating health data:', healthData);
        this.data.health = { ...this.data.health, ...healthData };

        // Update system health indicator
        const systemHealth = document.getElementById('system-health');
        const statusIcon = systemHealth.querySelector('.status-icon');
        const statusText = systemHealth.querySelector('span');

        const overallHealth = this.data.health.systemHealth?.overallHealth || 'unknown';
        statusIcon.className = `status-icon ${overallHealth}`;
        statusText.textContent = this.formatHealthStatus(overallHealth);

        // Update individual platform statuses
        Object.entries(this.data.health.platforms || {}).forEach(([platform, data]) => {
            const platformElement = document.querySelector(`[data-platform="${platform}"]`);
            if (platformElement) {
                const indicator = platformElement.querySelector('.status-indicator');
                indicator.className = `status-indicator ${data.status || 'unknown'}`;
            }
        });

        // Update incident count
        const incidentCount = document.getElementById('incident-count');
        if (incidentCount) {
            const incidents = this.data.health.systemHealth?.incidents?.length || 0;
            incidentCount.textContent = incidents;
        }

        // Add activity item for status changes
        const downPlatforms = Object.entries(this.data.health.platforms || {})
            .filter(([, data]) => data.status === 'down')
            .map(([name]) => name);

        if (downPlatforms.length > 0) {
            this.addActivityItem(`${downPlatforms.length} platform(s) experiencing issues`, 'fas fa-exclamation-triangle', 'warning');
        }
    }

    updateAutomationData(automationData) {
        console.log('🤖 Updating automation data:', automationData);
        this.data.automation = { ...this.data.automation, ...automationData };

        document.getElementById('active-workflows').textContent = this.data.automation.activeWorkflows || 0;
        document.getElementById('content-generated').textContent = this.data.automation.contentGenerated || 0;
    }

    updateAllDisplays() {
        this.updateRevenueData(this.data.revenue);
        this.updateHealthData(this.data.health);
        this.updateAutomationData(this.data.automation);
        this.updatePlatformPerformance();
    }

    updatePlatformPerformance() {
        const performanceGrid = document.getElementById('platform-performance');
        performanceGrid.innerHTML = '';

        const platforms = ['Mobile Apps', 'YouTube', 'Print-on-Demand', 'Online Courses'];
        
        platforms.forEach(platform => {
            const platformKey = platform.toLowerCase().replace(/\s+/g, '-');
            const revenue = this.data.revenue.platforms?.[platformKey]?.revenue || Math.random() * 1000;
            const transactions = this.data.revenue.platforms?.[platformKey]?.transactions || Math.floor(Math.random() * 100);

            const performanceItem = document.createElement('div');
            performanceItem.className = 'performance-item';
            performanceItem.innerHTML = `
                <h4>${platform}</h4>
                <div class="performance-metrics">
                    <span>Revenue:</span>
                    <span>$${this.formatNumber(revenue)}</span>
                </div>
                <div class="performance-metrics">
                    <span>Transactions:</span>
                    <span>${transactions}</span>
                </div>
                <div class="performance-metrics">
                    <span>Avg. Value:</span>
                    <span>$${this.formatNumber(transactions > 0 ? revenue / transactions : 0)}</span>
                </div>
            `;
            
            performanceGrid.appendChild(performanceItem);
        });
    }

    requestPayout() {
        const modal = document.getElementById('payout-modal');
        modal.classList.add('active');
    }

    processPayout() {
        const amount = parseFloat(document.getElementById('payout-amount').value);
        const platform = document.getElementById('payout-platform').value;
        const destination = document.getElementById('payout-destination').value;

        if (!amount || amount < 10) {
            this.showAlert('Minimum payout amount is $10', 'warning');
            return;
        }

        if (amount > this.data.revenue.availableBalance) {
            this.showAlert('Insufficient balance for payout', 'error');
            return;
        }

        console.log('💸 Processing payout request:', { amount, platform, destination });

        // Emit payout request to server
        this.socket.emit('trigger-payout', {
            amount,
            destination,
            platform
        });

        // Close modal
        this.closePayoutModal();

        // Show loading state
        this.showAlert('Processing payout request...', 'info');
    }

    handlePayoutSuccess(result) {
        console.log('✅ Payout successful:', result);
        this.showAlert(`Payout of $${result.payout.amount} initiated successfully!`, 'success');
        this.addActivityItem(`Payout initiated: $${result.payout.amount}`, 'fas fa-paper-plane', 'success');
        
        // Refresh revenue data
        this.socket.emit('request-fresh-data');
    }

    handlePayoutError(error) {
        console.error('❌ Payout failed:', error);
        this.showAlert(`Payout failed: ${error.error}`, 'error');
    }

    closePayoutModal() {
        const modal = document.getElementById('payout-modal');
        modal.classList.remove('active');
        
        // Reset form
        document.getElementById('payout-amount').value = '';
        document.getElementById('payout-platform').value = 'all';
        document.getElementById('payout-destination').value = 'primary';
    }

    pauseAllAutomation() {
        console.log('⏸️ Pausing all automation');
        this.socket.emit('pause-all-automation');
        this.showAlert('Pausing all automation workflows...', 'info');
    }

    resumeAllAutomation() {
        console.log('▶️ Resuming all automation');
        this.socket.emit('resume-all-automation');
        this.showAlert('Resuming all automation workflows...', 'info');
    }

    showPlatformDetails(platform) {
        console.log('📊 Showing details for platform:', platform);
        this.socket.emit('request-platform-data', platform);
    }

    updateRevenueChart() {
        const timeframe = document.getElementById('revenue-timeframe').value;
        console.log('📈 Updating revenue chart for timeframe:', timeframe);
        
        // Update chart data based on timeframe
        let days;
        switch(timeframe) {
            case '24h': days = 24; break;
            case '30d': days = 30; break;
            default: days = 7;
        }

        this.revenueChart.data.labels = this.generateTimeLabels(days);
        this.revenueChart.data.datasets.forEach(dataset => {
            const multiplier = dataset.label === 'Total Revenue' ? 1 : 
                             dataset.label === 'Courses' ? 0.4 :
                             dataset.label === 'Print-on-Demand' ? 0.35 :
                             dataset.label === 'Mobile Apps' ? 0.3 : 0.25;
            dataset.data = this.generateMockRevenueData(days, multiplier);
        });
        this.revenueChart.update();
    }

    showAlert(message, type = 'info') {
        const alertBar = document.getElementById('alert-bar');
        const alertMessage = document.getElementById('alert-message');
        
        alertMessage.textContent = message;
        alertBar.className = `alert-bar ${type}`;
        alertBar.classList.remove('hidden');

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            this.dismissAlert();
        }, 5000);
    }

    dismissAlert() {
        const alertBar = document.getElementById('alert-bar');
        alertBar.classList.add('hidden');
    }

    addActivityItem(text, icon = 'fas fa-info-circle', type = 'info') {
        const activityFeed = document.getElementById('activity-feed');
        const activityItem = document.createElement('div');
        activityItem.className = `activity-item ${type}`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });

        activityItem.innerHTML = `
            <i class="${icon}"></i>
            <span>${text}</span>
            <time>${timeString}</time>
        `;

        // Insert at the top
        activityFeed.insertBefore(activityItem, activityFeed.firstChild);

        // Keep only the last 20 items
        while (activityFeed.children.length > 20) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
    }

    updateTimeDisplays() {
        // Update uptime display
        const uptimeElement = document.getElementById('system-uptime');
        if (uptimeElement && this.data.health.systemHealth?.uptime) {
            const uptimeHours = ((Date.now() - this.data.health.systemHealth.uptime) / (1000 * 60 * 60)).toFixed(1);
            uptimeElement.textContent = `${uptimeHours}h`;
        }
    }

    playAlertSound() {
        // Create audio context for alert sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Cannot play alert sound:', error);
        }
    }

    formatCurrency(amount) {
        return parseFloat(amount || 0).toFixed(2);
    }

    formatNumber(number) {
        return parseFloat(number || 0).toFixed(0);
    }

    formatHealthStatus(status) {
        const statusMap = {
            'healthy': 'All Systems Operational',
            'degraded': 'Minor Issues Detected',
            'critical': 'Critical Issues - Attention Required',
            'unknown': 'Checking System Status...'
        };
        return statusMap[status] || 'Unknown Status';
    }
}

// Global functions for HTML onclick handlers (legacy support)
function requestPayout() {
    if (window.dashboard) window.dashboard.requestPayout();
}

function processPayout() {
    if (window.dashboard) window.dashboard.processPayout();
}

function closePayoutModal() {
    if (window.dashboard) window.dashboard.closePayoutModal();
}

function pauseAllAutomation() {
    if (window.dashboard) window.dashboard.pauseAllAutomation();
}

function resumeAllAutomation() {
    if (window.dashboard) window.dashboard.resumeAllAutomation();
}

function dismissAlert() {
    if (window.dashboard) window.dashboard.dismissAlert();
}

function updateRevenueChart() {
    if (window.dashboard) window.dashboard.updateRevenueChart();
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.dashboard && window.dashboard.isConnected) {
        // Page became visible, request fresh data
        window.dashboard.socket.emit('request-fresh-data');
    }
});