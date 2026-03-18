// Secure messaging, calling, and video calling functionality
let conversations = JSON.parse(localStorage.getItem('skillSwapConversations')) || [];
let currentConversation = null;
let isCallActive = false;
let isMuted = false;
let isVideoEnabled = true;
let callTimer = null;
let callStartTime = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.authModule || !window.authModule.getCurrentUser()) {
        console.log('User not authenticated, redirecting...');
        window.location.href = 'index.html';
        return;
    }
    
    initializeMessaging();
    setupMessageEventListeners();
    loadConversations();
    
    // Add sample conversations if none exist
    if (conversations.length === 0) {
        addSampleConversations();
    }
});

function initializeMessaging() {
    console.log('Initializing secure messaging system...');
    
    // Initialize WebRTC for video/voice calls (simulated)
    initializeWebRTC();
    
    // Set up real-time messaging simulation
    setupRealtimeMessaging();
}

function setupMessageEventListeners() {
    // Message input enter key
    const messageInput = document.getElementById('messageText');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // File input change
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
}

function loadConversations() {
    const currentUser = window.authModule.getCurrentUser();
    const conversationsList = document.getElementById('conversationsList');
    
    if (!conversationsList || !currentUser) return;
    
    // Filter conversations for current user
    const userConversations = conversations.filter(conv => 
        conv.participants.includes(currentUser.id)
    );
    
    if (userConversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="no-conversations">
                <p>No conversations yet</p>
                <small>Start a new chat to begin messaging</small>
            </div>
        `;
        return;
    }
    
    conversationsList.innerHTML = userConversations.map(conv => {
        const otherParticipant = getOtherParticipant(conv, currentUser.id);
        const lastMessage = conv.messages[conv.messages.length - 1];
        const unreadCount = conv.messages.filter(msg => 
            !msg.read && msg.senderId !== currentUser.id
        ).length;
        
        return `
            <div class="conversation-item ${conv.id === currentConversation?.id ? 'active' : ''}" 
                 onclick="selectConversation('${conv.id}')">
                <div class="conversation-avatar">
                    <img src="${otherParticipant.avatar}" alt="${otherParticipant.name}">
                    <div class="status-indicator ${otherParticipant.online ? 'online' : 'offline'}"></div>
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <h4>${otherParticipant.name}</h4>
                        <span class="message-time">${formatTime(lastMessage?.timestamp)}</span>
                    </div>
                    <div class="conversation-preview">
                        <p>${lastMessage?.content || 'No messages yet'}</p>
                        ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function selectConversation(conversationId) {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return;
    
    currentConversation = conversation;
    
    // Update chat header
    const currentUser = window.authModule.getCurrentUser();
    const otherParticipant = getOtherParticipant(conversation, currentUser.id);
    
    document.getElementById('chatUserName').textContent = otherParticipant.name;
    document.getElementById('chatUserStatus').textContent = 
        otherParticipant.online ? 'Online' : 'Last seen recently';
    
    // Load messages
    loadMessages(conversation);
    
    // Mark messages as read
    markMessagesAsRead(conversation, currentUser.id);
    
    // Update conversations list
    loadConversations();
}

function loadMessages(conversation) {
    const messagesArea = document.getElementById('messagesArea');
    const currentUser = window.authModule.getCurrentUser();
    
    if (!messagesArea || !conversation) return;
    
    if (conversation.messages.length === 0) {
        messagesArea.innerHTML = `
            <div class="welcome-message">
                <h3>Start your conversation</h3>
                <p>🔒 This conversation is end-to-end encrypted</p>
                <p>Send your first message below!</p>
            </div>
        `;
        return;
    }
    
    messagesArea.innerHTML = conversation.messages.map(message => {
        const isOwn = message.senderId === currentUser.id;
        const messageTime = new Date(message.timestamp);
        
        return `
            <div class="message ${isOwn ? 'own-message' : 'other-message'}">
                <div class="message-content">
                    ${message.type === 'text' ? `
                        <p>${message.content}</p>
                    ` : message.type === 'file' ? `
                        <div class="file-message">
                            <div class="file-icon">${getFileIcon(message.fileName)}</div>
                            <div class="file-info">
                                <span class="file-name">${message.fileName}</span>
                                <span class="file-size">${message.fileSize}</span>
                            </div>
                            <button class="download-btn" onclick="downloadFile('${message.fileUrl}', '${message.fileName}')">
                                ⬇️
                            </button>
                        </div>
                    ` : message.type === 'call' ? `
                        <div class="call-message">
                            <span class="call-icon">${message.callType === 'video' ? '📹' : '📞'}</span>
                            <span>${message.content}</span>
                            <span class="call-duration">${message.duration || ''}</span>
                        </div>
                    ` : ''}
                    <div class="message-meta">
                        <span class="message-time">${formatTime(message.timestamp)}</span>
                        ${isOwn ? `<span class="message-status">${message.read ? '✓✓' : '✓'}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('messageText');
    const content = messageInput.value.trim();
    
    if (!content || !currentConversation) return;
    
    const currentUser = window.authModule.getCurrentUser();
    const message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        content: content,
        type: 'text',
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Add message to conversation
    currentConversation.messages.push(message);
    
    // Update conversations in storage
    const convIndex = conversations.findIndex(conv => conv.id === currentConversation.id);
    if (convIndex !== -1) {
        conversations[convIndex] = currentConversation;
        localStorage.setItem('skillSwapConversations', JSON.stringify(conversations));
    }
    
    // Clear input
    messageInput.value = '';
    
    // Reload messages and conversations
    loadMessages(currentConversation);
    loadConversations();
    
    // Simulate auto-reply after 2 seconds
    setTimeout(() => {
        simulateReply();
    }, 2000);
    
    // Show notification
    window.authModule.showNotification('Message sent securely', 'success');
}

function simulateReply() {
    if (!currentConversation) return;
    
    const currentUser = window.authModule.getCurrentUser();
    const otherParticipant = getOtherParticipant(currentConversation, currentUser.id);
    
    const replies = [
        "Thanks for your message! I'll get back to you soon.",
        "That sounds great! When would be a good time to start?",
        "I'm excited to help you learn this skill!",
        "Let me know if you have any questions.",
        "Perfect! I'll prepare some materials for our session."
    ];
    
    const reply = {
        id: Date.now().toString(),
        senderId: otherParticipant.id,
        content: replies[Math.floor(Math.random() * replies.length)],
        type: 'text',
        timestamp: new Date().toISOString(),
        read: false
    };
    
    currentConversation.messages.push(reply);
    
    // Update storage
    const convIndex = conversations.findIndex(conv => conv.id === currentConversation.id);
    if (convIndex !== -1) {
        conversations[convIndex] = currentConversation;
        localStorage.setItem('skillSwapConversations', JSON.stringify(conversations));
    }
    
    // Reload messages and conversations
    loadMessages(currentConversation);
    loadConversations();
}

// Voice and Video Calling Functions
function startVoiceCall() {
    if (!currentConversation) {
        window.authModule.showNotification('Please select a conversation first', 'error');
        return;
    }
    
    const otherParticipant = getOtherParticipant(currentConversation, window.authModule.getCurrentUser().id);
    
    // Show voice call modal
    const modal = document.getElementById('voiceCallModal');
    document.getElementById('voiceCallUserName').textContent = otherParticipant.name;
    document.getElementById('voiceCallStatus').textContent = 'Calling...';
    modal.style.display = 'block';
    
    // Simulate call connection
    setTimeout(() => {
        document.getElementById('voiceCallStatus').textContent = 'Connected';
        startCallTimer();
        isCallActive = true;
        
        // Add call message to conversation
        addCallMessage('voice', 'Voice call started');
        
        window.authModule.showNotification('Voice call connected', 'success');
    }, 3000);
}

function startVideoCall() {
    if (!currentConversation) {
        window.authModule.showNotification('Please select a conversation first', 'error');
        return;
    }
    
    const otherParticipant = getOtherParticipant(currentConversation, window.authModule.getCurrentUser().id);
    
    // Show video call modal
    const modal = document.getElementById('videoCallModal');
    document.getElementById('callUserName').textContent = `Video Call with ${otherParticipant.name}`;
    modal.style.display = 'block';
    
    // Simulate camera access
    initializeCamera();
    
    // Simulate call connection
    setTimeout(() => {
        startCallTimer();
        isCallActive = true;
        
        // Add call message to conversation
        addCallMessage('video', 'Video call started');
        
        window.authModule.showNotification('Video call connected', 'success');
    }, 3000);
}

function shareScreen() {
    if (!isCallActive) {
        window.authModule.showNotification('Start a call first to share screen', 'error');
        return;
    }
    
    // Simulate screen sharing
    window.authModule.showNotification('Screen sharing started', 'success');
    
    // Add screen share message
    addCallMessage('screen', 'Screen sharing started');
}

function initializeCamera() {
    // Simulate camera initialization
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    
    if (localVideo && remoteVideo) {
        // Hide placeholders and show video elements (simulated)
        setTimeout(() => {
            localVideo.style.display = 'block';
            remoteVideo.style.display = 'block';
        }, 2000);
    }
}

function toggleMute() {
    isMuted = !isMuted;
    const muteButtons = document.querySelectorAll('.mute-btn');
    
    muteButtons.forEach(btn => {
        btn.textContent = isMuted ? '🎤❌' : '🎤';
        btn.style.background = isMuted ? 'var(--error-color)' : '';
    });
    
    window.authModule.showNotification(isMuted ? 'Microphone muted' : 'Microphone unmuted', 'info');
}

function toggleVideo() {
    isVideoEnabled = !isVideoEnabled;
    const videoButtons = document.querySelectorAll('.video-btn');
    
    videoButtons.forEach(btn => {
        btn.textContent = isVideoEnabled ? '📹' : '📹❌';
        btn.style.background = isVideoEnabled ? '' : 'var(--error-color)';
    });
    
    window.authModule.showNotification(isVideoEnabled ? 'Camera enabled' : 'Camera disabled', 'info');
}

function toggleScreenShare() {
    // Toggle screen sharing
    shareScreen();
}

function toggleSpeaker() {
    window.authModule.showNotification('Speaker toggled', 'info');
}

function endCall() {
    isCallActive = false;
    
    // Stop call timer
    if (callTimer) {
        clearInterval(callTimer);
        callTimer = null;
    }
    
    // Calculate call duration
    const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
    const durationText = formatDuration(duration);
    
    // Hide modals
    document.getElementById('voiceCallModal').style.display = 'none';
    document.getElementById('videoCallModal').style.display = 'none';
    
    // Add call end message
    addCallMessage('end', `Call ended - Duration: ${durationText}`, durationText);
    
    window.authModule.showNotification('Call ended', 'info');
}

function startCallTimer() {
    callStartTime = Date.now();
    const timerElements = document.querySelectorAll('.call-timer, .voice-call-timer');
    
    callTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
        const timeString = formatDuration(elapsed);
        
        timerElements.forEach(el => {
            el.textContent = timeString;
        });
    }, 1000);
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// File Sharing Functions
function attachFile() {
    document.getElementById('fileShareModal').style.display = 'block';
}

function selectFile() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const files = event.target.files;
    const selectedFilesDiv = document.getElementById('selectedFiles');
    
    if (!files.length) return;
    
    selectedFilesDiv.innerHTML = '';
    
    Array.from(files).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-preview">
                <span class="file-icon">${getFileIcon(file.name)}</span>
                <div class="file-details">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                </div>
                <button class="btn-primary" onclick="sendFile('${file.name}', '${formatFileSize(file.size)}')">
                    Send
                </button>
            </div>
        `;
        selectedFilesDiv.appendChild(fileItem);
    });
}

function sendFile(fileName, fileSize) {
    if (!currentConversation) return;
    
    const currentUser = window.authModule.getCurrentUser();
    const fileMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        content: `Shared file: ${fileName}`,
        type: 'file',
        fileName: fileName,
        fileSize: fileSize,
        fileUrl: '#', // In real app, this would be the actual file URL
        timestamp: new Date().toISOString(),
        read: false
    };
    
    currentConversation.messages.push(fileMessage);
    
    // Update storage
    const convIndex = conversations.findIndex(conv => conv.id === currentConversation.id);
    if (convIndex !== -1) {
        conversations[convIndex] = currentConversation;
        localStorage.setItem('skillSwapConversations', JSON.stringify(conversations));
    }
    
    // Close modal and reload messages
    closeFileShare();
    loadMessages(currentConversation);
    loadConversations();
    
    window.authModule.showNotification('File shared securely', 'success');
}

function closeFileShare() {
    document.getElementById('fileShareModal').style.display = 'none';
    document.getElementById('selectedFiles').innerHTML = '';
    document.getElementById('fileInput').value = '';
}

// Utility Functions
function getOtherParticipant(conversation, currentUserId) {
    const users = JSON.parse(localStorage.getItem('skillSwapUsers')) || [];
    const otherUserId = conversation.participants.find(id => id !== currentUserId);
    const user = users.find(u => u.id === otherUserId);
    
    return {
        id: otherUserId,
        name: user?.fullName || 'Unknown User',
        avatar: user?.avatar || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1',
        online: Math.random() > 0.5 // Simulate online status
    };
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const icons = {
        pdf: '📄',
        doc: '📝',
        docx: '📝',
        txt: '📝',
        jpg: '🖼️',
        jpeg: '🖼️',
        png: '🖼️',
        gif: '🖼️',
        mp4: '🎥',
        mp3: '🎵',
        zip: '📦',
        default: '📁'
    };
    
    return icons[extension] || icons.default;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function markMessagesAsRead(conversation, userId) {
    conversation.messages.forEach(message => {
        if (message.senderId !== userId) {
            message.read = true;
        }
    });
    
    // Update storage
    const convIndex = conversations.findIndex(conv => conv.id === conversation.id);
    if (convIndex !== -1) {
        conversations[convIndex] = conversation;
        localStorage.setItem('skillSwapConversations', JSON.stringify(conversations));
    }
}

function addCallMessage(callType, content, duration = '') {
    if (!currentConversation) return;
    
    const currentUser = window.authModule.getCurrentUser();
    const callMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        content: content,
        type: 'call',
        callType: callType,
        duration: duration,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    currentConversation.messages.push(callMessage);
    
    // Update storage
    const convIndex = conversations.findIndex(conv => conv.id === currentConversation.id);
    if (convIndex !== -1) {
        conversations[convIndex] = currentConversation;
        localStorage.setItem('skillSwapConversations', JSON.stringify(conversations));
    }
    
    loadMessages(currentConversation);
    loadConversations();
}

// Sample Data Functions
function addSampleConversations() {
    const currentUser = window.authModule.getCurrentUser();
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('skillSwapUsers')) || [];
    const otherUsers = users.filter(u => u.id !== currentUser.id);
    
    const sampleConversations = otherUsers.slice(0, 3).map((user, index) => ({
        id: `conv_${Date.now()}_${index}`,
        participants: [currentUser.id, user.id],
        messages: [
            {
                id: `msg_${Date.now()}_${index}_1`,
                senderId: user.id,
                content: `Hi ${currentUser.fullName}! I saw your profile and I'm interested in learning ${currentUser.skillsToTeach[0] || 'your skills'}. Would you be available for a skill exchange?`,
                type: 'text',
                timestamp: new Date(Date.now() - 86400000 + index * 3600000).toISOString(),
                read: true
            },
            {
                id: `msg_${Date.now()}_${index}_2`,
                senderId: currentUser.id,
                content: `Hello! Yes, I'd be happy to help you learn ${currentUser.skillsToTeach[0] || 'that skill'}. In return, I'd love to learn ${user.skillsToTeach[0] || 'from you'}.`,
                type: 'text',
                timestamp: new Date(Date.now() - 82800000 + index * 3600000).toISOString(),
                read: true
            }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString()
    }));
    
    conversations = sampleConversations;
    localStorage.setItem('skillSwapConversations', JSON.stringify(conversations));
}

// Initialize WebRTC (simulated)
function initializeWebRTC() {
    console.log('WebRTC initialized for voice and video calls');
    // In a real application, this would set up WebRTC peer connections
}

function setupRealtimeMessaging() {
    console.log('Real-time messaging initialized');
    // In a real application, this would set up WebSocket connections
}

// Additional Functions
function startNewConversation() {
    window.authModule.showNotification('New conversation feature coming soon!', 'info');
}

function showEmojiPicker() {
    const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥'];
    const messageInput = document.getElementById('messageText');
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    messageInput.value += randomEmoji;
}

function downloadFile(url, fileName) {
    window.authModule.showNotification(`Downloading ${fileName}...`, 'info');
}

function scheduleSession() {
    window.authModule.showNotification('Session scheduling feature coming soon!', 'info');
}

function toggleChatInCall() {
    window.authModule.showNotification('In-call chat feature coming soon!', 'info');
}

// Export functions
window.messagesModule = {
    startVoiceCall,
    startVideoCall,
    shareScreen,
    sendMessage,
    attachFile
};

// Make functions globally available
window.startVoiceCall = startVoiceCall;
window.startVideoCall = startVideoCall;
window.shareScreen = shareScreen;
window.sendMessage = sendMessage;
window.attachFile = attachFile;
window.selectFile = selectFile;
window.sendFile = sendFile;
window.closeFileShare = closeFileShare;
window.handleFileSelect = handleFileSelect;
window.selectConversation = selectConversation;
window.startNewConversation = startNewConversation;
window.showEmojiPicker = showEmojiPicker;
window.downloadFile = downloadFile;
window.scheduleSession = scheduleSession;
window.toggleMute = toggleMute;
window.toggleVideo = toggleVideo;
window.toggleScreenShare = toggleScreenShare;
window.toggleSpeaker = toggleSpeaker;
window.endCall = endCall;
window.toggleChatInCall = toggleChatInCall;

console.log('Messages module loaded successfully');