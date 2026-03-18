// Skill matching functionality - Enhanced for local development
let savedMatches = JSON.parse(localStorage.getItem('savedMatches')) || [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Skill matching module loading...');
    
    // Check if we're in a local environment or if auth module is available
    const isLocalEnvironment = !window.authModule || !window.authModule.getCurrentUser();
    
    if (isLocalEnvironment) {
        console.log('Running in local mode - using fallback data');
        initializeLocalMode();
    } else {
        console.log('Running with full auth system');
        initializeWithAuth();
    }
    
    setupMatchingEventListeners();
});

function initializeLocalMode() {
    // Create a mock user for local testing
    const mockUser = {
        id: 'local_user',
        fullName: 'Demo User',
        skillsToTeach: ['Web Development', 'JavaScript', 'React'],
        skillsToLearn: ['Photography', 'Guitar', 'Spanish']
    };
    
    // Store mock user
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    
    // Load matches with mock data
    loadLocalMatches();
    loadSavedMatches();
}

function initializeWithAuth() {
    // Check authentication
    if (!window.authModule.requireAuth()) {
        return;
    }
    
    loadMatches();
    loadSavedMatches();
}

function setupMatchingEventListeners() {
    // Search functionality
    const skillFilter = document.getElementById('skillFilter');
    if (skillFilter) {
        skillFilter.addEventListener('input', debounce(findMatches, 300));
    }
    
    // Filter change events
    const filters = ['skillCategory', 'experienceLevel', 'availability'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', findMatches);
        }
    });
}

function loadLocalMatches() {
    const matchResults = document.getElementById('matchResults');
    const matchCount = document.getElementById('matchCount');
    
    if (!matchResults) return;
    
    // Sample matches for local testing
    const sampleMatches = [
        {
            id: '2',
            name: 'Sarah Chen',
            skillsToTeach: ['Photography', 'Photoshop', 'Digital Art'],
            skillsToLearn: ['Web Development', 'Marketing', 'Cooking'],
            level: 'Advanced',
            availability: 'Weekends',
            rating: 4.9,
            location: 'New York, NY',
            bio: 'Professional photographer and digital artist'
        },
        {
            id: '3',
            name: 'Mike Rodriguez',
            skillsToTeach: ['Guitar', 'Music Theory', 'Songwriting'],
            skillsToLearn: ['Programming', 'Video Editing', 'French'],
            level: 'Expert',
            availability: 'Evenings',
            rating: 4.7,
            location: 'Austin, TX',
            bio: 'Musician and guitar instructor with 10+ years experience'
        },
        {
            id: '4',
            name: 'Emma Wilson',
            skillsToTeach: ['Spanish', 'French', 'Translation'],
            skillsToLearn: ['Graphic Design', 'Photography', 'Cooking'],
            level: 'Intermediate',
            availability: 'Flexible',
            rating: 4.8,
            location: 'Los Angeles, CA',
            bio: 'Language teacher and translator'
        },
        {
            id: '5',
            name: 'David Kim',
            skillsToTeach: ['Cooking', 'Korean Cuisine', 'Food Photography'],
            skillsToLearn: ['Web Development', 'Digital Marketing', 'Guitar'],
            level: 'Advanced',
            availability: 'Weekends',
            rating: 4.6,
            location: 'Seattle, WA',
            bio: 'Professional chef and food photographer'
        }
    ];
    
    if (matchCount) {
        matchCount.textContent = `${sampleMatches.length} matches found`;
    }
    
    matchResults.innerHTML = sampleMatches.map(user => {
        const isSaved = savedMatches.includes(user.id);
        
        return `
            <div class="match-card ${isSaved ? 'saved' : ''}">
                <div class="match-header">
                    <h3>${user.name}</h3>
                    <button class="save-btn ${isSaved ? 'saved' : ''}" onclick="toggleSaveMatch('${user.id}')">
                        ${isSaved ? '❤️' : '🤍'}
                    </button>
                </div>
                <div class="match-skills">
                    <p><strong>Can teach:</strong> ${user.skillsToTeach.join(', ')}</p>
                    <p><strong>Wants to learn:</strong> ${user.skillsToLearn.join(', ')}</p>
                </div>
                <div class="match-details">
                    <span class="match-level">${user.level}</span>
                    <span class="match-availability">${user.availability}</span>
                    <span class="match-rating">⭐ ${user.rating}</span>
                </div>
                <div class="match-reason">
                    <p><strong>Match reason:</strong> Complementary skills and learning goals</p>
                </div>
                <div class="match-actions">
                    <button class="btn-primary" onclick="connectWithUser('${user.id}')">Connect</button>
                    <button class="btn-secondary" onclick="viewProfile('${user.id}')">View Profile</button>
                </div>
            </div>
        `;
    }).join('');
}

function findMatches() {
    const searchTerm = document.getElementById('skillFilter')?.value.toLowerCase() || '';
    const category = document.getElementById('skillCategory')?.value || '';
    const level = document.getElementById('experienceLevel')?.value || '';
    const availability = document.getElementById('availability')?.value || '';
    
    // Check if we're in local mode
    const isLocalMode = !window.authModule || !window.authModule.getCurrentUser();
    
    if (isLocalMode) {
        findLocalMatches(searchTerm, { category, level, availability });
    } else {
        loadMatches(searchTerm, { category, level, availability });
    }
}

function findLocalMatches(searchTerm, filters) {
    const matchResults = document.getElementById('matchResults');
    const matchCount = document.getElementById('matchCount');
    
    if (!matchResults) return;
    
    // Simulate filtering
    let resultText = 'matches found';
    if (searchTerm) {
        resultText = `matches found for "${searchTerm}"`;
    }
    
    if (matchCount) {
        matchCount.textContent = `Searching...`;
        setTimeout(() => {
            matchCount.textContent = `3 ${resultText}`;
        }, 500);
    }
    
    // Reload matches (in a real app, this would filter the results)
    setTimeout(() => {
        loadLocalMatches();
    }, 500);
}

function loadMatches(searchTerm = '', filters = {}) {
    // This function works with the full auth system
    if (!window.authModule) {
        loadLocalMatches();
        return;
    }
    
    const currentUser = window.authModule.getCurrentUser();
    if (!currentUser) {
        loadLocalMatches();
        return;
    }
    
    const matchResults = document.getElementById('matchResults');
    const matchCount = document.getElementById('matchCount');
    if (!matchResults) return;
    
    // Get all users except current user
    const users = JSON.parse(localStorage.getItem('skillSwapUsers')) || [];
    
    // Find potential matches
    const potentialMatches = users.filter(user => {
        if (user.id === currentUser.id) return false;
        
        // Check if they can teach what current user wants to learn
        const canTeach = user.skillsToTeach.some(skill => 
            currentUser.skillsToLearn.some(wantedSkill => 
                skill.toLowerCase().includes(wantedSkill.toLowerCase()) ||
                wantedSkill.toLowerCase().includes(skill.toLowerCase())
            )
        );
        
        // Check if current user can teach what they want to learn
        const canLearn = currentUser.skillsToTeach.some(skill => 
            user.skillsToLearn.some(wantedSkill => 
                skill.toLowerCase().includes(wantedSkill.toLowerCase()) ||
                wantedSkill.toLowerCase().includes(skill.toLowerCase())
            )
        );
        
        // Apply search filter
        const matchesSearch = searchTerm === '' || 
            user.fullName.toLowerCase().includes(searchTerm) ||
            user.skillsToTeach.some(skill => skill.toLowerCase().includes(searchTerm)) ||
            user.skillsToLearn.some(skill => skill.toLowerCase().includes(searchTerm));
        
        return (canTeach || canLearn) && matchesSearch;
    });
    
    // Update match count
    if (matchCount) {
        matchCount.textContent = `${potentialMatches.length} matches found`;
    }
    
    if (potentialMatches.length === 0) {
        matchResults.innerHTML = `
            <div class="match-card">
                <h3>No matches found</h3>
                <p>Try adjusting your search or filters, or check back later for new members!</p>
            </div>
        `;
        return;
    }
    
    matchResults.innerHTML = potentialMatches.map(user => {
        const commonSkills = findCommonSkills(currentUser, user);
        const isSaved = savedMatches.includes(user.id);
        const experienceLevel = getExperienceLevel(user);
        const availabilityText = getAvailabilityText(user);
        
        return `
            <div class="match-card ${isSaved ? 'saved' : ''}">
                <div class="match-header">
                    <h3>${user.fullName}</h3>
                    <button class="save-btn ${isSaved ? 'saved' : ''}" onclick="toggleSaveMatch('${user.id}')">
                        ${isSaved ? '❤️' : '🤍'}
                    </button>
                </div>
                <div class="match-skills">
                    <p><strong>Can teach:</strong> ${user.skillsToTeach.join(', ')}</p>
                    <p><strong>Wants to learn:</strong> ${user.skillsToLearn.join(', ')}</p>
                </div>
                <div class="match-details">
                    <span class="match-level">${experienceLevel}</span>
                    <span class="match-availability">${availabilityText}</span>
                    <span class="match-rating">⭐ ${user.rating || 4.5}</span>
                </div>
                <div class="match-reason">
                    <p><strong>Match reason:</strong> ${commonSkills}</p>
                </div>
                <div class="match-actions">
                    <button class="btn-primary" onclick="connectWithUser('${user.id}')">Connect</button>
                    <button class="btn-secondary" onclick="viewProfile('${user.id}')">View Profile</button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleSaveMatch(userId) {
    const index = savedMatches.indexOf(userId);
    
    if (index > -1) {
        savedMatches.splice(index, 1);
        showNotification('Match removed from saved list', 'info');
    } else {
        savedMatches.push(userId);
        showNotification('Match saved successfully!', 'success');
    }
    
    localStorage.setItem('savedMatches', JSON.stringify(savedMatches));
    
    // Refresh the matches display
    findMatches();
    loadSavedMatches();
}

function loadSavedMatches() {
    const savedMatchesContainer = document.getElementById('savedMatches');
    if (!savedMatchesContainer) return;
    
    if (savedMatches.length === 0) {
        savedMatchesContainer.innerHTML = `
            <div class="match-card">
                <h3>No saved matches</h3>
                <p>Save interesting matches by clicking the heart icon to easily find them later!</p>
            </div>
        `;
        return;
    }
    
    // In local mode, show saved match placeholders
    savedMatchesContainer.innerHTML = savedMatches.map(userId => `
        <div class="match-card saved">
            <div class="match-header">
                <h3>Saved Match</h3>
                <button class="save-btn saved" onclick="toggleSaveMatch('${userId}')">❤️</button>
            </div>
            <p>This match has been saved to your list.</p>
        </div>
    `).join('');
}

function connectWithUser(userId) {
    showNotification('Connection request sent! Start your skill exchange journey.', 'success');
    
    // Update active matches if auth system is available
    if (window.authModule && window.authModule.getCurrentUser()) {
        const currentUser = window.authModule.getCurrentUser();
        currentUser.activeMatches = (currentUser.activeMatches || 0) + 1;
        window.authModule.updateUser(currentUser);
    }
}

function viewProfile(userId) {
    const profiles = {
        '2': `Name: Sarah Chen
Location: New York, NY
Bio: Professional photographer and digital artist with 8+ years of experience
Skills to teach: Photography, Photoshop, Digital Art
Skills to learn: Web Development, Marketing, Cooking
Rating: 4.9/5 (15 reviews)
Completed swaps: 12`,
        '3': `Name: Mike Rodriguez
Location: Austin, TX
Bio: Musician and guitar instructor with 10+ years of experience
Skills to teach: Guitar, Music Theory, Songwriting
Skills to learn: Programming, Video Editing, French
Rating: 4.7/5 (22 reviews)
Completed swaps: 18`,
        '4': `Name: Emma Wilson
Location: Los Angeles, CA
Bio: Language teacher and translator, native Spanish speaker
Skills to teach: Spanish, French, Translation
Skills to learn: Graphic Design, Photography, Cooking
Rating: 4.8/5 (11 reviews)
Completed swaps: 8`,
        '5': `Name: David Kim
Location: Seattle, WA
Bio: Professional chef and food photographer
Skills to teach: Cooking, Korean Cuisine, Food Photography
Skills to learn: Web Development, Digital Marketing, Guitar
Rating: 4.6/5 (9 reviews)
Completed swaps: 6`
    };
    
    alert(profiles[userId] || 'Profile information not available');
}

// Helper functions
function findCommonSkills(user1, user2) {
    const reasons = [];
    
    // Check what user1 can teach that user2 wants to learn
    user1.skillsToTeach.forEach(skill => {
        user2.skillsToLearn.forEach(wantedSkill => {
            if (skill.toLowerCase().includes(wantedSkill.toLowerCase()) ||
                wantedSkill.toLowerCase().includes(skill.toLowerCase())) {
                reasons.push(`You can teach ${skill}`);
            }
        });
    });
    
    // Check what user2 can teach that user1 wants to learn
    user2.skillsToTeach.forEach(skill => {
        user1.skillsToLearn.forEach(wantedSkill => {
            if (skill.toLowerCase().includes(wantedSkill.toLowerCase()) ||
                wantedSkill.toLowerCase().includes(skill.toLowerCase())) {
                reasons.push(`They can teach ${skill}`);
            }
        });
    });
    
    return reasons.length > 0 ? reasons.slice(0, 2).join(', ') : 'Similar interests';
}

function getExperienceLevel(user) {
    const swaps = user.completedSwaps || 0;
    if (swaps >= 10) return 'Expert';
    if (swaps >= 5) return 'Advanced';
    if (swaps >= 2) return 'Intermediate';
    return 'Beginner';
}

function getAvailabilityText(user) {
    if (!user.availability || Object.keys(user.availability).length === 0) {
        return 'Flexible';
    }
    
    const availableDays = Object.keys(user.availability).filter(day => 
        user.availability[day].available
    );
    
    if (availableDays.length === 0) return 'By appointment';
    if (availableDays.length <= 2) return 'Limited availability';
    if (availableDays.includes('saturday') || availableDays.includes('sunday')) {
        return 'Weekends available';
    }
    return 'Weekdays available';
}

function showNotification(message, type = 'info') {
    // Use auth module notification if available, otherwise create our own
    if (window.authModule && window.authModule.showNotification) {
        window.authModule.showNotification(message, type);
        return;
    }
    
    // Fallback notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#00bcd4'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        font-family: 'Inter', sans-serif;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 300);
}

// Utility function for debouncing search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally available
window.findMatches = findMatches;
window.toggleSaveMatch = toggleSaveMatch;
window.connectWithUser = connectWithUser;
window.viewProfile = viewProfile;

// Export for other modules
window.skillMatchingModule = {
    findMatches,
    toggleSaveMatch,
    connectWithUser,
    viewProfile,
    loadMatches,
    loadSavedMatches
};

console.log('Skill matching module loaded successfully');