// Authentication and user management
console.log('Auth module loading...');

let currentUser = null;
let users = JSON.parse(localStorage.getItem('skillSwapUsers')) || [];

// Initialize authentication when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth module initializing...');
    initializeAuth();
    setupAuthEventListeners();
});

function initializeAuth() {
    console.log('Initializing authentication...');
    
    try {
        // Check if user is logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            console.log('User logged in:', currentUser.fullName);
        }
        
        // Add sample users if none exist
        if (users.length === 0) {
            console.log('Adding sample users...');
            addSampleUsers();
        }
        
        // Check if we're on a protected page and redirect if needed
        const protectedPages = ['dashboard.html', 'skill-matching.html', 'profile.html', 'feedback.html', 'messages.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Only redirect if user is not authenticated AND we're on a protected page
        if (protectedPages.includes(currentPage) && !currentUser) {
            console.log('Redirecting to home - user not authenticated');
            // Don't redirect immediately, give time for demo login
            setTimeout(() => {
                if (!currentUser) {
                    window.location.href = 'index.html';
                }
            }, 1000);
            return;
        }
        
        console.log('Auth initialization complete');
        
    } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('currentUser');
        currentUser = null;
    }
}

function setupAuthEventListeners() {
    console.log('Setting up auth event listeners...');
    
    try {
        // Registration form
        const registrationForm = document.getElementById('registrationForm');
        if (registrationForm) {
            registrationForm.addEventListener('submit', handleRegistration);
            console.log('Registration form listener added');
        }
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            console.log('Login form listener added');
        }
        
        // Modal close on outside click
        window.addEventListener('click', function(event) {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Modal functions
function showRegistration() {
    console.log('Showing registration modal');
    hideLogin();
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Registration modal not found');
    }
}

function hideRegistration() {
    console.log('Hiding registration modal');
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showLogin() {
    console.log('Showing login modal');
    hideRegistration();
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Login modal not found');
    }
}

function hideLogin() {
    console.log('Hiding login modal');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Authentication functions
function handleRegistration(e) {
    e.preventDefault();
    console.log('Handling registration...');
    
    try {
        const formData = new FormData(e.target);
        const userData = {
            id: Date.now().toString(),
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            password: formData.get('password'),
            skillsToTeach: formData.get('skillsToTeach').split(',').map(s => s.trim()).filter(s => s),
            skillsToLearn: formData.get('skillsToLearn').split(',').map(s => s.trim()).filter(s => s),
            joinDate: new Date().toISOString(),
            activeMatches: Math.floor(Math.random() * 3) + 1,
            completedSwaps: Math.floor(Math.random() * 5),
            bio: '',
            location: '',
            timezone: 'UTC-5',
            availability: {},
            rating: 4.5 + Math.random() * 0.5,
            totalRatings: Math.floor(Math.random() * 20) + 5
        };
        
        // Check if email already exists
        if (users.find(user => user.email === userData.email)) {
            showNotification('Email already exists. Please use a different email or sign in.', 'error');
            return;
        }
        
        // Add user to storage
        users.push(userData);
        localStorage.setItem('skillSwapUsers', JSON.stringify(users));
        
        // Auto login
        currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        hideRegistration();
        
        showNotification('Welcome to Skill Swap! Your account has been created successfully.', 'success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

function handleLogin(e) {
    e.preventDefault();
    console.log('Handling login...');
    
    try {
        const formData = new FormData(e.target);
        const email = formData.get('loginEmail');
        const password = formData.get('loginPassword');
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            hideLogin();
            
            showNotification(`Welcome back, ${user.fullName}!`, 'success');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showNotification('Invalid email or password. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

function logout() {
    console.log('Logging out user...');
    
    try {
        currentUser = null;
        localStorage.removeItem('currentUser');
        
        showNotification('You have been logged out successfully.', 'success');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'index.html';
    }
}

// Check if user is authenticated (for protected pages)
function requireAuth() {
    if (!currentUser) {
        console.log('Authentication required - redirecting to home');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Update user data
function updateUser(updatedData) {
    if (!currentUser) return false;
    
    try {
        // Update current user object
        Object.assign(currentUser, updatedData);
        
        // Update in users array
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('skillSwapUsers', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    console.log('Showing notification:', message, type);
    
    try {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'var(--error-color)' : type === 'success' ? 'var(--success-color)' : 'var(--gradient-primary)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px var(--shadow-color);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-family: 'Inter', sans-serif;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
    } catch (error) {
        console.error('Error showing notification:', error);
        // Fallback to alert
        alert(message);
    }
}

function addSampleUsers() {
    console.log('Adding sample users...');
    
    try {
        const sampleUsers = [
            {
                id: '1',
                fullName: 'Alex Johnson',
                email: 'alex@example.com',
                password: 'password123',
                skillsToTeach: ['Web Development', 'JavaScript', 'React'],
                skillsToLearn: ['Photography', 'Guitar', 'Spanish'],
                joinDate: new Date().toISOString(),
                activeMatches: 2,
                completedSwaps: 5,
                bio: 'Passionate web developer with 5 years of experience. Love teaching and learning new technologies.',
                location: 'San Francisco, CA',
                timezone: 'UTC-8',
                availability: {
                    monday: { available: true, start: '09:00', end: '17:00' },
                    tuesday: { available: true, start: '09:00', end: '17:00' },
                    wednesday: { available: true, start: '09:00', end: '17:00' },
                    thursday: { available: true, start: '09:00', end: '17:00' },
                    friday: { available: true, start: '09:00', end: '17:00' }
                },
                rating: 4.8,
                totalRatings: 12
            },
            {
                id: '2',
                fullName: 'Sarah Chen',
                email: 'sarah@example.com',
                password: 'password123',
                skillsToTeach: ['Photography', 'Photoshop', 'Digital Art'],
                skillsToLearn: ['Web Development', 'Marketing', 'Cooking'],
                joinDate: new Date().toISOString(),
                activeMatches: 1,
                completedSwaps: 3,
                bio: 'Professional photographer and digital artist. Excited to share my creative skills and learn new ones.',
                location: 'New York, NY',
                timezone: 'UTC-5',
                availability: {
                    saturday: { available: true, start: '10:00', end: '16:00' },
                    sunday: { available: true, start: '10:00', end: '16:00' }
                },
                rating: 4.9,
                totalRatings: 8
            },
            {
                id: '3',
                fullName: 'Mike Rodriguez',
                email: 'mike@example.com',
                password: 'password123',
                skillsToTeach: ['Guitar', 'Music Theory', 'Songwriting'],
                skillsToLearn: ['Programming', 'Video Editing', 'French'],
                joinDate: new Date().toISOString(),
                activeMatches: 3,
                completedSwaps: 7,
                bio: 'Musician and guitar instructor with 10+ years of experience. Always eager to learn new skills.',
                location: 'Austin, TX',
                timezone: 'UTC-6',
                availability: {
                    monday: { available: true, start: '18:00', end: '21:00' },
                    wednesday: { available: true, start: '18:00', end: '21:00' },
                    friday: { available: true, start: '18:00', end: '21:00' },
                    saturday: { available: true, start: '10:00', end: '18:00' }
                },
                rating: 4.7,
                totalRatings: 15
            }
        ];
        
        users = sampleUsers;
        localStorage.setItem('skillSwapUsers', JSON.stringify(users));
        console.log('Sample users added successfully');
        
    } catch (error) {
        console.error('Error adding sample users:', error);
    }
}

// Create a demo login function for easy testing
function demoLogin() {
    console.log('Demo login initiated...');
    
    try {
        const demoUser = users.find(u => u.email === 'alex@example.com') || users[0];
        if (demoUser) {
            currentUser = demoUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showNotification(`Demo login successful! Welcome ${demoUser.fullName}`, 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            console.error('Demo user not found');
            showNotification('Demo user not available. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Demo login error:', error);
        showNotification('Demo login failed. Please try again.', 'error');
    }
}

// Export functions for use in other files
window.authModule = {
    getCurrentUser,
    updateUser,
    requireAuth,
    showNotification,
    logout,
    demoLogin
};

// Make functions globally available
window.showRegistration = showRegistration;
window.hideRegistration = hideRegistration;
window.showLogin = showLogin;
window.hideLogin = hideLogin;
window.demoLogin = demoLogin;
window.logout = logout;

console.log('Auth module loaded successfully');