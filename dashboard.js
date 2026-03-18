// Dashboard functionality
console.log('Dashboard script loading...');

// Wait for DOM and auth module to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard DOM loaded');
    
    // Wait a bit for auth module to initialize
    setTimeout(() => {
        initializeDashboard();
    }, 100);
});

function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    // Check if auth module is available
    if (!window.authModule) {
        console.error('Auth module not available');
        showError('Authentication system not loaded. Please refresh the page.');
        return;
    }
    
    // Check authentication
    const currentUser = window.authModule.getCurrentUser();
    if (!currentUser) {
        console.log('No authenticated user found, redirecting to home');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('User authenticated:', currentUser.fullName);
    updateDashboardContent(currentUser);
    loadRecentActivity(currentUser);
}

function updateDashboardContent(user) {
    console.log('Updating dashboard content for:', user.fullName);
    
    try {
        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome back, ${user.fullName}!`;
        }
        
        // Update skills to teach
        const skillsToTeachContainer = document.getElementById('userSkillsToTeach');
        if (skillsToTeachContainer && user.skillsToTeach && user.skillsToTeach.length > 0) {
            skillsToTeachContainer.innerHTML = user.skillsToTeach
                .map(skill => `<span class="skill-tag">${skill}</span>`)
                .join('');
        } else if (skillsToTeachContainer) {
            skillsToTeachContainer.innerHTML = '<span class="skill-tag">No skills added yet</span>';
        }
        
        // Update skills to learn
        const skillsToLearnContainer = document.getElementById('userSkillsToLearn');
        if (skillsToLearnContainer && user.skillsToLearn && user.skillsToLearn.length > 0) {
            skillsToLearnContainer.innerHTML = user.skillsToLearn
                .map(skill => `<span class="skill-tag">${skill}</span>`)
                .join('');
        } else if (skillsToLearnContainer) {
            skillsToLearnContainer.innerHTML = '<span class="skill-tag">No learning goals set</span>';
        }
        
        // Update stats
        const activeMatchesEl = document.getElementById('activeMatches');
        if (activeMatchesEl) {
            activeMatchesEl.textContent = user.activeMatches || 0;
        }
        
        const completedSwapsEl = document.getElementById('completedSwaps');
        if (completedSwapsEl) {
            completedSwapsEl.textContent = user.completedSwaps || 0;
        }
        
        console.log('Dashboard content updated successfully');
        
    } catch (error) {
        console.error('Error updating dashboard content:', error);
        showError('Error loading dashboard data');
    }
}

function loadRecentActivity(user) {
    console.log('Loading recent activity...');
    
    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) {
        console.error('Activity container not found');
        return;
    }
    
    try {
        // Generate dynamic activity based on user data
        const activities = generateUserActivity(user);
        
        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">🎯</div>
                    <div class="activity-content">
                        <h4>Welcome to Skill Swap!</h4>
                        <p>Start by finding your first skill exchange partner</p>
                        <small>Just now</small>
                    </div>
                </div>
            `;
        } else {
            activityContainer.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <h4>${activity.title}</h4>
                        <p>${activity.description}</p>
                        <small>${activity.time}</small>
                    </div>
                </div>
            `).join('');
        }
        
        console.log('Recent activity loaded successfully');
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
        activityContainer.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">⚠️</div>
                <div class="activity-content">
                    <h4>Error Loading Activity</h4>
                    <p>Unable to load recent activity. Please refresh the page.</p>
                    <small>Now</small>
                </div>
            </div>
        `;
    }
}

function generateUserActivity(user) {
    const activities = [];
    
    // Add activity based on user's skills and stats
    if (user.skillsToTeach && user.skillsToTeach.length > 0) {
        activities.push({
            icon: '🎯',
            title: 'New Match Found',
            description: `You've been matched with Sarah Chen for ${user.skillsToLearn[0] || 'skill'} lessons`,
            time: '2 hours ago'
        });
    }
    
    if (user.completedSwaps > 0) {
        activities.push({
            icon: '⭐',
            title: 'Feedback Received',
            description: `Mike Rodriguez rated your ${user.skillsToTeach[0] || 'skill'} lesson 5 stars`,
            time: '1 day ago'
        });
        
        activities.push({
            icon: '🎓',
            title: 'Skill Exchange Completed',
            description: `Successfully completed ${user.skillsToLearn[0] || 'skill'} lessons with Emma Wilson`,
            time: '3 days ago'
        });
    }
    
    if (user.activeMatches > 0) {
        activities.push({
            icon: '💬',
            title: 'New Message',
            description: 'David Kim sent you a message about your upcoming session',
            time: '5 days ago'
        });
    }
    
    return activities;
}

function scheduleSession() {
    console.log('Schedule session clicked');
    
    if (window.authModule && window.authModule.showNotification) {
        window.authModule.showNotification('Session scheduling feature coming soon!', 'info');
    } else {
        alert('Session scheduling feature coming soon!');
    }
}

function showError(message) {
    console.error('Dashboard error:', message);
    
    const dashboardContent = document.querySelector('.dashboard-content');
    if (dashboardContent) {
        dashboardContent.innerHTML = `
            <div class="welcome-card" style="background: var(--error-color);">
                <h1>Error Loading Dashboard</h1>
                <p>${message}</p>
                <button class="btn-primary" onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }
}

// Make functions globally available
window.scheduleSession = scheduleSession;
window.initializeDashboard = initializeDashboard;

// Export for other modules
window.dashboardModule = {
    updateDashboardContent,
    loadRecentActivity,
    scheduleSession,
    initializeDashboard
};

console.log('Dashboard script loaded successfully');