// =============================================
// ===== NAVIGATION =====
// =============================================
function navigateTo(page) {
    window.history.pushState({ page: page }, '', window.location.pathname + '?page=' + page);
    
    document.querySelectorAll('.page-content').forEach(function(el) {
        el.classList.remove('active');
    });
    var target = document.getElementById('page-' + page);
    if (target) {
        target.classList.add('active');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    document.querySelectorAll('.nav-links .nav-item').forEach(function(el) {
        el.classList.remove('active');
    });
    document.querySelectorAll('.nav-links .nav-item').forEach(function(el) {
        var text = el.textContent.toLowerCase().trim();
        if (text.includes(page) || (page === 'home' && text === 'home')) {
            el.classList.add('active');
        }
    });
    
    if (page === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    
    fetch('/api/analytics/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: page })
    }).catch(function() {});
}

window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) navigateTo(event.state.page);
});

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded');
    var params = new URLSearchParams(window.location.search);
    var page = params.get('page') || 'home';
    navigateTo(page);
    
    // Load posts
    loadHomePosts();
    loadAllPosts();
});

// =============================================
// ===== LOAD POSTS =====
// =============================================
async function loadHomePosts() {
    try {
        console.log('🔍 Loading home posts...');
        var response = await fetch('/api/posts');
        console.log('📡 Response status:', response.status);
        var posts = await response.json();
        console.log('📚 Posts received:', posts.length);
        
        var container = document.getElementById('home-posts-grid');
        if (!container) {
            console.error('❌ home-posts-grid not found');
            return;
        }
        
        if (!posts || posts.length === 0) {
            container.innerHTML = '<div class="text-muted text-center" style="padding:2rem;">No posts yet. Check back soon</div>';
            return;
        }
        
        container.innerHTML = posts.slice(0, 4).map(function(post) {
            var imageHtml = post.image ? '<img src="' + post.image + '" alt="' + post.title + '">' : '<i class="fas fa-newspaper" style="font-size:3rem; color:#7bc5ff;"></i>';
            return '<div class="post-card" onclick="viewPost(\'' + post.id + '\')">' +
                '<div class="post-image" style="background:linear-gradient(135deg, rgba(64,164,212,0.2), rgba(123,197,255,0.1));">' +
                    imageHtml +
                '</div>' +
                '<span class="post-tag"><i class="fas fa-tag"></i> ' + (post.type === 'image' ? 'Image Post' : 'Article') + '</span>' +
                '<h3>' + post.title + '</h3>' +
                '<p>' + (post.content ? post.content.substring(0, 120) : '') + (post.content && post.content.length > 120 ? '...' : '') + '</p>' +
                '<div class="post-stats">' +
                    '<span><i class="fas fa-eye"></i> ' + (post.views || 0) + '</span>' +
                    '<span><i class="fas fa-heart"></i> ' + (post.likes || 0) + '</span>' +
                '</div>' +
                '<div class="post-date"><i class="far fa-calendar-alt"></i> ' + (post.timestamp ? new Date(post.timestamp).toLocaleDateString() : '') + '</div>' +
            '</div>';
        }).join('');
        console.log('✅ Posts rendered successfully');
    } catch (error) {
        console.error('❌ Error loading posts:', error);
    }
}

async function loadAllPosts() {
    try {
        console.log('🔍 Loading all posts...');
        var response = await fetch('/api/posts');
        var posts = await response.json();
        var container = document.getElementById('all-posts-grid');
        
        if (!container) {
            console.error('❌ all-posts-grid not found');
            return;
        }
        
        if (!posts || posts.length === 0) {
            container.innerHTML = '<div class="text-muted text-center" style="padding:2rem;">No posts yet</div>';
            return;
        }
        
        container.innerHTML = posts.map(function(post) {
            var imageHtml = post.image ? '<img src="' + post.image + '" alt="' + post.title + '">' : '<i class="fas fa-newspaper" style="font-size:3rem; color:#7bc5ff;"></i>';
            return '<div class="post-card" onclick="viewPost(\'' + post.id + '\')">' +
                '<div class="post-image" style="background:linear-gradient(135deg, rgba(64,164,212,0.2), rgba(123,197,255,0.1));">' +
                    imageHtml +
                '</div>' +
                '<span class="post-tag"><i class="fas fa-tag"></i> ' + (post.type === 'image' ? 'Image Post' : 'Article') + '</span>' +
                '<h3>' + post.title + '</h3>' +
                '<p>' + (post.content ? post.content.substring(0, 120) : '') + (post.content && post.content.length > 120 ? '...' : '') + '</p>' +
                '<div class="post-stats">' +
                    '<span><i class="fas fa-eye"></i> ' + (post.views || 0) + '</span>' +
                    '<span><i class="fas fa-heart"></i> ' + (post.likes || 0) + '</span>' +
                '</div>' +
                '<div class="post-date"><i class="far fa-calendar-alt"></i> ' + (post.timestamp ? new Date(post.timestamp).toLocaleDateString() : '') + '</div>' +
            '</div>';
        }).join('');
        console.log('✅ All posts rendered');
    } catch (error) {
        console.error('❌ Error loading all posts:', error);
    }
}

function viewPost(id) {
    fetch('/api/posts/' + id + '/view', { method: 'POST' }).catch(function() {});
    showToast('Opening post...');
}

// =============================================
// ===== CONTACT FORM =====
// =============================================
async function submitContactForm(event) {
    event.preventDefault();
    var name = document.getElementById('contact-name').value.trim();
    var email = document.getElementById('contact-email').value.trim();
    var phone = document.getElementById('contact-phone').value.trim();
    var message = document.getElementById('contact-message').value.trim();
    
    if (!name || !message) {
        showToast('Please fill in all fields');
        return;
    }
    
    try {
        var response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, phone: phone, message: message, type: 'contact' })
        });
        
        if (response.ok) {
            showToast('Message sent. We will get back to you within 24 hours.');
            document.getElementById('contactForm').reset();
        } else {
            showToast('Failed to send message. Please try again.');
        }
    } catch (error) {
        showToast('Network error. Please try again.');
    }
}

// =============================================
// ===== AI CHAT =====
// =============================================
function sendChatMessage() {
    var input = document.getElementById('chatInput');
    var message = input.value.trim();
    if (!message) return;
    
    var container = document.getElementById('chatMessages');
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerHTML = '<div class="msg-sender"><i class="fas fa-user"></i> You</div><p>' + message + '</p>';
    container.appendChild(userMsg);
    input.value = '';
    
    fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        var aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message ai';
        aiMsg.innerHTML = '<div class="msg-sender"><i class="fas fa-robot"></i> AILife Assistant</div><p>' + (data.response || 'I could not process that request.') + '</p>';
        container.appendChild(aiMsg);
        container.scrollTop = container.scrollHeight;
    })
    .catch(function() {
        var aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message ai';
        aiMsg.innerHTML = '<div class="msg-sender"><i class="fas fa-robot"></i> AILife Assistant</div><p>Sorry, I am having trouble connecting. Please try again later.</p>';
        container.appendChild(aiMsg);
        container.scrollTop = container.scrollHeight;
    });
    
    container.scrollTop = container.scrollHeight;
}

document.getElementById('chatInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendChatMessage();
});

// =============================================
// ===== TOAST =====
// =============================================
function showToast(message) {
    var toast = document.getElementById('toast');
    var toastMsg = document.getElementById('toastMessage');
    toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

// =============================================
// ===== MODAL =====
// =============================================
function openDemoModal() {
    document.getElementById('demoModal').classList.add('active');
}
function closeDemoModal() {
    document.getElementById('demoModal').classList.remove('active');
}
document.getElementById('demoModal').addEventListener('click', function(e) {
    if (e.target === this) closeDemoModal();
});

// =============================================
// ===== REFRESH POSTS =====
// =============================================
function refreshPosts() {
    console.log('🔄 Refreshing posts...');
    loadHomePosts();
    loadAllPosts();
}
