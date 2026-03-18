// Profile management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.authModule.requireAuth()) {
        return;
    }
    
    initializeProfile();
    setupProfileEventListeners();
});

function initializeProfile() {
    const currentUser = window.authModule.getCurrentUser();
    if (!currentUser) return;
    
    loadProfileData();
    loadTeachingSkills();
    loadLearningSkills();
    loadAvailability();
}

function setupProfileEventListeners() {
    // Personal info form
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', handlePersonalInfoUpdate);
    }
    
    // Teaching skills form
    const teachingSkillsForm = document.getElementById('teachingSkillsForm');
    if (teachingSkillsForm) {
        teachingSkillsForm.addEventListener('submit', handleTeachingSkillsUpdate);
    }
    
    // Learning skills form
    const learningSkillsForm = document.getElementById('learningSkillsForm');
    if (learningSkillsForm) {
        learningSkillsForm.addEventListener('submit', handleLearningSkillsUpdate);
    }
    
    // Availability form
    const availabilityForm = document.getElementById('availabilityForm');
    if (availabilityForm) {
        availabilityForm.addEventListener('submit', handleAvailabilityUpdate);
    }
}

function loadProfileData() {
    const currentUser = window.authModule.getCurrentUser();
    if (!currentUser) return;
    
    // Update profile header
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.textContent = currentUser.fullName;
    }
    
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) {
        profileEmail.textContent = currentUser.email;
    }
    
    const memberSince = document.getElementById('memberSince');
    if (memberSince) {
        const joinDate = new Date(currentUser.joinDate);
        memberSince.textContent = joinDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
    }
    
    // Update stats
    const profileActiveMatches = document.getElementById('profileActiveMatches');
    if (profileActiveMatches) {
        profileActiveMatches.textContent = currentUser.activeMatches || 0;
    }
    
    const profileCompletedSwaps = document.getElementById('profileCompletedSwaps');
    if (profileCompletedSwaps) {
        profileCompletedSwaps.textContent = currentUser.completedSwaps || 0;
    }
    
    const profileRating = document.getElementById('profileRating');
    if (profileRating) {
        profileRating.textContent = currentUser.rating || '4.5';
    }
    
    // Load form data
    const [firstName, lastName] = currentUser.fullName.split(' ');
    
    const firstNameInput = document.getElementById('firstName');
    if (firstNameInput) {
        firstNameInput.value = firstName || '';
    }
    
    const lastNameInput = document.getElementById('lastName');
    if (lastNameInput) {
        lastNameInput.value = lastName || '';
    }
    
    const bioInput = document.getElementById('bio');
    if (bioInput) {
        bioInput.value = currentUser.bio || '';
    }
    
    const locationInput = document.getElementById('location');
    if (locationInput) {
        locationInput.value = currentUser.location || '';
    }
    
    const timezoneSelect = document.getElementById('timezone');
    if (timezoneSelect) {
        timezoneSelect.value = currentUser.timezone || 'UTC-5';
    }
}

function loadTeachingSkills() {
    const currentUser = window.authModule.getCurrentUser();
    if (!currentUser) return;
    
    const teachingSkillsList = document.getElementById('teachingSkillsList');
    if (!teachingSkillsList) return;
    
    teachingSkillsList.innerHTML = currentUser.skillsToTeach.map((skill, index) => `
        <div class="skill-item">
            <span class="skill-name">${skill}</span>
            <span class="skill-level">Intermediate</span>
            <button type="button" class="remove-skill" onclick="removeTeachingSkill(${index})">×</button>
        </div>
    `).join('');
}

function loadLearningSkills() {
    const currentUser = window.authModule.getCurrentUser();
    if (!currentUser) return;
    
    const learningSkillsList = document.getElementById('learningSkillsList');
    if (!learningSkillsList) return;
    
    learningSkillsList.innerHTML = currentUser.skillsToLearn.map((skill, index) => `
        <div class="skill-item">
            <span class="skill-name">${skill}</span>
            <span class="skill-level">High Priority</span>
            <button type="button" class="remove-skill" onclick="removeLearningSkill(${index})">×</button>
        </div>
    `).join('');
}

function loadAvailability() {
    const currentUser = window.authModule.getCurrentUser();
    if (!currentUser || !currentUser.availability) return;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        const checkbox = document.querySelector(`input[value="${day}"]`);
        const startTime = document.querySelector(`input[name="${day}-start"]`);
        const endTime = document.querySelector(`input[name="${day}-end"]`);
        
        if (currentUser.availability[day]) {
            if (checkbox) checkbox.checked = currentUser.availability[day].available;
            if (startTime) startTime.value = currentUser.availability[day].start || '09:00';
            if (endTime) endTime.value = currentUser.availability[day].end || '17:00';
        }
    });
}

function handlePersonalInfoUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const currentUser = window.authModule.getCurrentUser();
    
    const updatedData = {
        fullName: `${formData.get('firstName')} ${formData.get('lastName')}`,
        bio: formData.get('bio'),
        location: formData.get('location'),
        timezone: formData.get('timezone')
    };
    
    if (window.authModule.updateUser(updatedData)) {
        window.authModule.showNotification('Personal information updated successfully!', 'success');
        loadProfileData();
    } else {
        window.authModule.showNotification('Failed to update personal information', 'error');
    }
}

function handleTeachingSkillsUpdate(e) {
    e.preventDefault();
    
    const currentUser = window.authModule.getCurrentUser();
    
    if (window.authModule.updateUser({ skillsToTeach: currentUser.skillsToTeach })) {
        window.authModule.showNotification('Teaching skills updated successfully!', 'success');
    } else {
        window.authModule.showNotification('Failed to update teaching skills', 'error');
    }
}

function handleLearningSkillsUpdate(e) {
    e.preventDefault();
    
    const currentUser = window.authModule.getCurrentUser();
    
    if (window.authModule.updateUser({ skillsToLearn: currentUser.skillsToLearn })) {
        window.authModule.showNotification('Learning goals updated successfully!', 'success');
    } else {
        window.authModule.showNotification('Failed to update learning goals', 'error');
    }
}

function handleAvailabilityUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const availability = {};
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        const isAvailable = formData.getAll('availability').includes(day);
        const startTime = formData.get(`${day}-start`);
        const endTime = formData.get(`${day}-end`);
        
        availability[day] = {
            available: isAvailable,
            start: startTime || '09:00',
            end: endTime || '17:00'
        };
    });
    
    if (window.authModule.updateUser({ availability })) {
        window.authModule.showNotification('Availability updated successfully!', 'success');
    } else {
        window.authModule.showNotification('Failed to update availability', 'error');
    }
}

function addTeachingSkill() {
    const skillInput = document.getElementById('newTeachingSkill');
    const levelSelect = document.getElementById('teachingSkillLevel');
    
    if (!skillInput || !levelSelect) return;
    
    const skill = skillInput.value.trim();
    const level = levelSelect.value;
    
    if (!skill) {
        window.authModule.showNotification('Please enter a skill name', 'error');
        return;
    }
    
    const currentUser = window.authModule.getCurrentUser();
    
    if (currentUser.skillsToTeach.includes(skill)) {
        window.authModule.showNotification('You already have this skill listed', 'error');
        return;
    }
    
    currentUser.skillsToTeach.push(skill);
    skillInput.value = '';
    
    loadTeachingSkills();
    window.authModule.showNotification('Skill added successfully!', 'success');
}

function addLearningSkill() {
    const skillInput = document.getElementById('newLearningSkill');
    const prioritySelect = document.getElementById('learningSkillPriority');
    
    if (!skillInput || !prioritySelect) return;
    
    const skill = skillInput.value.trim();
    const priority = prioritySelect.value;
    
    if (!skill) {
        window.authModule.showNotification('Please enter a skill name', 'error');
        return;
    }
    
    const currentUser = window.authModule.getCurrentUser();
    
    if (currentUser.skillsToLearn.includes(skill)) {
        window.authModule.showNotification('You already have this skill in your learning goals', 'error');
        return;
    }
    
    currentUser.skillsToLearn.push(skill);
    skillInput.value = '';
    
    loadLearningSkills();
    window.authModule.showNotification('Learning goal added successfully!', 'success');
}

function removeTeachingSkill(index) {
    const currentUser = window.authModule.getCurrentUser();
    
    if (index >= 0 && index < currentUser.skillsToTeach.length) {
        currentUser.skillsToTeach.splice(index, 1);
        loadTeachingSkills();
        window.authModule.showNotification('Skill removed successfully!', 'success');
    }
}

function removeLearningSkill(index) {
    const currentUser = window.authModule.getCurrentUser();
    
    if (index >= 0 && index < currentUser.skillsToLearn.length) {
        currentUser.skillsToLearn.splice(index, 1);
        loadLearningSkills();
        window.authModule.showNotification('Learning goal removed successfully!', 'success');
    }
}

function changeAvatar() {
    // In a real app, this would open a file picker or avatar selection modal
    window.authModule.showNotification('Avatar change feature coming soon!', 'info');
}

// Export functions
window.profileModule = {
    addTeachingSkill,
    addLearningSkill,
    removeTeachingSkill,
    removeLearningSkill,
    changeAvatar
};