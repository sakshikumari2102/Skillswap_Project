// Feedback and reviews functionality
let feedbacks = JSON.parse(localStorage.getItem('skillSwapFeedbacks')) || [];
let currentRating = 0;
let categoryRatings = {
    communication: 0,
    knowledge: 0,
    reliability: 0
};

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.authModule.requireAuth()) {
        return;
    }
    
    initializeFeedback();
    setupFeedbackEventListeners();
});

function initializeFeedback() {
    loadFeedbacks();
    loadReceivedFeedbacks();
    loadGivenFeedbacks();
    
    // Add sample feedbacks if none exist
    if (feedbacks.length === 0) {
        addSampleFeedbacks();
    }
}

function setupFeedbackEventListeners() {
    // Feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedback);
    }
    
    // Rating stars
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', handleStarClick);
        star.addEventListener('mouseover', handleStarHover);
        star.addEventListener('mouseout', handleStarOut);
    });
    
    // Category rating stars
    const categoryStars = document.querySelectorAll('.category-stars .star');
    categoryStars.forEach(star => {
        star.addEventListener('click', handleCategoryStarClick);
        star.addEventListener('mouseover', handleCategoryStarHover);
        star.addEventListener('mouseout', handleCategoryStarOut);
    });
}

function showFeedbackTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.feedback-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}FeedbackTab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load tab-specific content
    if (tabName === 'received') {
        loadReceivedFeedbacks();
    } else if (tabName === 'given') {
        loadGivenFeedbacks();
    }
}

function handleStarClick(e) {
    currentRating = parseInt(e.target.dataset.rating);
    document.getElementById('rating').value = currentRating;
    updateStarDisplay();
}

function handleStarHover(e) {
    const hoverRating = parseInt(e.target.dataset.rating);
    const stars = e.target.parentElement.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        if (index < hoverRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function handleStarOut(e) {
    updateStarDisplay();
}

function handleCategoryStarClick(e) {
    const category = e.target.parentElement.dataset.category;
    const rating = parseInt(e.target.dataset.rating);
    
    categoryRatings[category] = rating;
    updateCategoryStarDisplay(e.target.parentElement);
}

function handleCategoryStarHover(e) {
    const hoverRating = parseInt(e.target.dataset.rating);
    const stars = e.target.parentElement.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        if (index < hoverRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function handleCategoryStarOut(e) {
    updateCategoryStarDisplay(e.target.parentElement);
}

function updateStarDisplay() {
    const stars = document.querySelectorAll('.rating-stars:not(.category-stars) .star');
    stars.forEach((star, index) => {
        if (index < currentRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function updateCategoryStarDisplay(container) {
    const category = container.dataset.category;
    const rating = categoryRatings[category];
    const stars = container.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function handleFeedback(e) {
    e.preventDefault();
    
    if (currentRating === 0) {
        window.authModule.showNotification('Please select a rating before submitting feedback.', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const currentUser = window.authModule.getCurrentUser();
    
    const feedback = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.fullName,
        partnerName: formData.get('feedbackPartner'),
        exchangeType: formData.get('exchangeType'),
        rating: currentRating,
        categoryRatings: { ...categoryRatings },
        text: formData.get('feedbackText'),
        recommend: formData.get('recommendPartner') === 'on',
        date: new Date().toISOString()
    };
    
    feedbacks.push(feedback);
    localStorage.setItem('skillSwapFeedbacks', JSON.stringify(feedbacks));
    
    // Update completed swaps
    currentUser.completedSwaps = (currentUser.completedSwaps || 0) + 1;
    if (currentUser.activeMatches > 0) {
        currentUser.activeMatches--;
    }
    
    // Update user data
    window.authModule.updateUser(currentUser);
    
    // Reset form
    e.target.reset();
    currentRating = 0;
    categoryRatings = { communication: 0, knowledge: 0, reliability: 0 };
    updateStarDisplay();
    
    // Update category star displays
    document.querySelectorAll('.category-stars').forEach(container => {
        updateCategoryStarDisplay(container);
    });
    
    loadGivenFeedbacks();
    window.authModule.showNotification('Thank you for your feedback!', 'success');
    
    // Update dashboard if available
    if (window.dashboardModule) {
        window.dashboardModule.updateDashboardContent();
    }
}

function loadFeedbacks() {
    // This function can be used to load all feedbacks for admin purposes
    console.log('Total feedbacks:', feedbacks.length);
}

function loadReceivedFeedbacks() {
    const receivedFeedbackList = document.getElementById('receivedFeedbackList');
    if (!receivedFeedbackList) return;
    
    const currentUser = window.authModule.getCurrentUser();
    
    // Filter feedbacks where current user is the partner (received feedback)
    const receivedFeedbacks = feedbacks.filter(feedback => 
        feedback.partnerName.toLowerCase().includes(currentUser.fullName.toLowerCase())
    );
    
    if (receivedFeedbacks.length === 0) {
        receivedFeedbackList.innerHTML = `
            <div class="feedback-item">
                <p>No feedback received yet. Complete some skill exchanges to start receiving reviews!</p>
            </div>
        `;
        return;
    }
    
    receivedFeedbackList.innerHTML = receivedFeedbacks
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(feedback => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <span class="feedback-partner">${feedback.userName}</span>
                    <span class="feedback-rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</span>
                </div>
                <div class="feedback-categories">
                    <small>
                        Communication: ${'★'.repeat(feedback.categoryRatings?.communication || 0)}
                        Knowledge: ${'★'.repeat(feedback.categoryRatings?.knowledge || 0)}
                        Reliability: ${'★'.repeat(feedback.categoryRatings?.reliability || 0)}
                    </small>
                </div>
                <p class="feedback-text">${feedback.text}</p>
                <div class="feedback-meta">
                    <small>Exchange: ${feedback.exchangeType || 'Not specified'}</small>
                    <small>${new Date(feedback.date).toLocaleDateString()}</small>
                </div>
                ${feedback.recommend ? '<div class="recommend-badge">✓ Recommended</div>' : ''}
            </div>
        `).join('');
}

function loadGivenFeedbacks() {
    const givenFeedbackList = document.getElementById('givenFeedbackList');
    if (!givenFeedbackList) return;
    
    const currentUser = window.authModule.getCurrentUser();
    
    // Filter feedbacks given by current user
    const givenFeedbacks = feedbacks.filter(feedback => feedback.userId === currentUser.id);
    
    if (givenFeedbacks.length === 0) {
        givenFeedbackList.innerHTML = `
            <div class="feedback-item">
                <p>No feedback given yet. Complete a skill exchange and share your experience!</p>
            </div>
        `;
        return;
    }
    
    givenFeedbackList.innerHTML = givenFeedbacks
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(feedback => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <span class="feedback-partner">To: ${feedback.partnerName}</span>
                    <span class="feedback-rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</span>
                </div>
                <div class="feedback-categories">
                    <small>
                        Communication: ${'★'.repeat(feedback.categoryRatings?.communication || 0)}
                        Knowledge: ${'★'.repeat(feedback.categoryRatings?.knowledge || 0)}
                        Reliability: ${'★'.repeat(feedback.categoryRatings?.reliability || 0)}
                    </small>
                </div>
                <p class="feedback-text">${feedback.text}</p>
                <div class="feedback-meta">
                    <small>Exchange: ${feedback.exchangeType || 'Not specified'}</small>
                    <small>${new Date(feedback.date).toLocaleDateString()}</small>
                </div>
                ${feedback.recommend ? '<div class="recommend-badge">✓ Recommended</div>' : ''}
            </div>
        `).join('');
}

function addSampleFeedbacks() {
    const currentUser = window.authModule.getCurrentUser();
    if (!currentUser) return;
    
    const sampleFeedbacks = [
        {
            id: '1',
            userId: '1',
            userName: 'Alex Johnson',
            partnerName: 'Sarah Chen',
            exchangeType: 'mutual',
            rating: 5,
            categoryRatings: { communication: 5, knowledge: 5, reliability: 4 },
            text: 'Amazing photography teacher! Sarah helped me understand composition and lighting. Highly recommend!',
            recommend: true,
            date: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '2',
            userId: '2',
            userName: 'Sarah Chen',
            partnerName: 'Alex Johnson',
            exchangeType: 'learning',
            rating: 5,
            categoryRatings: { communication: 5, knowledge: 5, reliability: 5 },
            text: 'Alex is a fantastic web development mentor. Made React concepts so easy to understand!',
            recommend: true,
            date: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: '3',
            userId: '3',
            userName: 'Mike Rodriguez',
            partnerName: 'Emma Wilson',
            exchangeType: 'learning',
            rating: 4,
            categoryRatings: { communication: 4, knowledge: 5, reliability: 4 },
            text: 'Great Spanish lessons with Emma. Very patient and encouraging teacher!',
            recommend: true,
            date: new Date(Date.now() - 259200000).toISOString()
        },
        {
            id: '4',
            userId: '4',
            userName: 'Emma Wilson',
            partnerName: currentUser.fullName,
            exchangeType: 'teaching',
            rating: 5,
            categoryRatings: { communication: 5, knowledge: 4, reliability: 5 },
            text: `Excellent ${currentUser.skillsToTeach[0] || 'skill'} session! Very knowledgeable and patient instructor.`,
            recommend: true,
            date: new Date(Date.now() - 345600000).toISOString()
        }
    ];
    
    feedbacks = sampleFeedbacks;
    localStorage.setItem('skillSwapFeedbacks', JSON.stringify(feedbacks));
}

// Export functions
window.feedbackModule = {
    showFeedbackTab,
    handleFeedback,
    loadReceivedFeedbacks,
    loadGivenFeedbacks
};