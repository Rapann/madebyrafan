const API_BASE_URL = 'https://backend-rapanportofolio.vercel.app/api';

document.addEventListener('DOMContentLoaded', () => {
    // Initial data load
    initPortfolio();

    // Mobile Navbar Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Media Modal Logic
    const modal = document.getElementById('mediaModal');
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const closeModal = document.querySelector('.close-modal');

    if (closeModal) {
        closeModal.onclick = () => {
            modal.style.display = 'none';
            if (modalVideo) modalVideo.pause();
        };
    }

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            if (modalVideo) modalVideo.pause();
        }
    };

    // Comment Form Submission
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('comment-name').value;
            const message = document.getElementById('comment-message').value;

            try {
                const res = await fetch(`${API_BASE_URL}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, message })
                });

                if (res.ok) {
                    commentForm.reset();
                    showToast('Komentar berhasil dikirim!', 'success');
                    loadComments();
                } else {
                    showToast('Gagal mengirim komentar.', 'error');
                }
            } catch (err) {
                console.error('Error sending comment:', err);
                showToast('Terjadi kesalahan saat mengirim komentar.', 'error');
            }
        });
    }
});

// Modern Toast Notification
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function initPortfolio() {
    try {
        await Promise.all([
            loadProfile(),
            loadEducation(),
            loadProjects(),
            loadAchievements(),
        loadSkills(),
        loadDocumentation(),
        loadComments()
    ]);
} catch (err) {
        console.error('Gagal memuat data portofolio:', err);
        // Show warning if server is not running
        const warning = document.createElement('div');
        warning.style.cssText = "background: #ff4444; color: white; text-align: center; padding: 10px; position: fixed; top: 0; width: 100%; z-index: 9999;";
        warning.innerHTML = 'Server Backend belum jalan! Jalankan <code>node server.js</code> untuk melihat isi portofolio.';
        document.body.prepend(warning);
    }
}

async function loadProfile() {
    const res = await fetch(`${API_BASE_URL}/profile`);
    const data = await res.json();
    if (data) {
        const descEl = document.getElementById('profile-desc');
        const quoteEl = document.getElementById('profile-quote');
        const imgEl = document.getElementById('profile-img');
        
        if (descEl) descEl.innerText = data.description || '';
        if (quoteEl) quoteEl.innerText = data.quote || '';
        if (imgEl && data.profileImg) imgEl.src = data.profileImg;
        
        startTypingEffect(data.name || "Rafan Parsa", data.subtitle || "Pelajar");
    }
}

function startTypingEffect(name, subtitle) {
    const typingName = document.getElementById('typing-name');
    const typingSubtitle = document.getElementById('typing-subtitle');
    if (!typingName || !typingSubtitle) return;

    // Handle multiple subtitles if comma-separated
    const subtitles = subtitle.split(',').map(s => s.trim());
    let currentSubtitleIndex = 0;

    let nameIndex = 0;
    let subtitleIndex = 0;
    let nameForward = true;
    let subtitleForward = true;

    function typeName() {
        if (nameForward) {
            nameIndex++;
            if (nameIndex === name.length) {
                nameForward = false;
                setTimeout(typeName, 2000);
                return;
            }
        } else {
            nameIndex--;
            if (nameIndex === 0) {
                nameForward = true;
                setTimeout(typeName, 500);
                return;
            }
        }
        typingName.innerHTML = name.substring(0, nameIndex) + '<span class="typing-cursor">|</span>';
        setTimeout(typeName, 150);
    }

    function typeSubtitle() {
        const text = subtitles[currentSubtitleIndex];
        if (subtitleForward) {
            subtitleIndex++;
            if (subtitleIndex === text.length) {
                subtitleForward = false;
                setTimeout(typeSubtitle, 2000);
                return;
            }
        } else {
            subtitleIndex--;
            if (subtitleIndex === 0) {
                subtitleForward = true;
                // Move to next subtitle
                currentSubtitleIndex = (currentSubtitleIndex + 1) % subtitles.length;
                setTimeout(typeSubtitle, 500);
                return;
            }
        }
        typingSubtitle.innerHTML = text.substring(0, subtitleIndex) + '<span class="typing-cursor">|</span>';
        setTimeout(typeSubtitle, 100);
    }

    typeName();
    typeSubtitle();
}

async function loadEducation() {
    const res = await fetch(`${API_BASE_URL}/education`);
    const data = await res.json();
    const container = document.getElementById('education-list');
    if (container) {
        container.innerHTML = data.map(edu => `
            <div class="skill-app">
                <img src="${edu.logo}" alt="${edu.institution}" class="app-logo loaded" loading="lazy">
                <h3>${edu.institution}</h3>
            </div>
        `).join('');
    }
}

let allProjects = [];
async function loadProjects() {
    const res = await fetch(`${API_BASE_URL}/projects`);
    allProjects = await res.json();
    setupProjectFilters();
    renderProjects('semua');
}

function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.onclick = () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProjects(btn.dataset.filter);
        };
    });
}

function renderProjects(filter) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    const filtered = allProjects.filter(p => filter === 'semua' || p.category === filter);
    
    grid.innerHTML = filtered.map(p => `
        <div class="project-card" data-category="${p.category}">
            <img src="${p.media}" alt="${p.title}" class="project-thumbnail loaded" loading="lazy">
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <a href="${p.link || '#'}" class="btn detail-btn" onclick="openMediaModal(event, '${p.media}', '${p.mediaType}')">Lihat Detail</a>
        </div>
    `).join('');
}

function openMediaModal(e, src, type) {
    if (!src || src === '#') return;
    
    // If it's an external link, let it open normally
    if (src.startsWith('http') && !src.includes(window.location.host)) return;

    e.preventDefault();
    const modal = document.getElementById('mediaModal');
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');

    if (type === 'image') {
        modalImage.src = src;
        modalImage.style.display = 'block';
        modalVideo.style.display = 'none';
    } else {
        modalVideo.querySelector('source').src = src;
        modalVideo.load();
        modalVideo.style.display = 'block';
        modalImage.style.display = 'none';
    }
    modal.style.display = 'block';
}

async function loadAchievements() {
    const res = await fetch(`${API_BASE_URL}/achievements`);
    const data = await res.json();
    const container = document.getElementById('journey-timeline');
    if (container) {
        container.innerHTML = data.map((ach, index) => `
            <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}">
                <div class="timeline-date">${ach.date}</div>
                <div class="timeline-content">
                    <h3>${ach.title}</h3>
                    <p>${ach.description}</p>
                </div>
            </div>
        `).join('');
    }
}

async function loadSkills() {
    const res = await fetch(`${API_BASE_URL}/skills`);
    const data = await res.json();
    const container = document.getElementById('skills-list');
    if (container) {
        container.innerHTML = data.map(skill => `
            <div class="skill-app">
                <img src="${skill.icon}" alt="${skill.name}" class="app-logo loaded" loading="lazy">
                <p>${skill.name}</p>
            </div>
        `).join('');
    }
}

async function loadDocumentation() {
    const res = await fetch(`${API_BASE_URL}/documentation`);
    const data = await res.json();
    const container = document.getElementById('documentation-list');
    if (container) {
        container.innerHTML = data.map(doc => `
            <div class="certificate-card">
                <img src="${doc.media}" alt="${doc.title}" class="project-thumbnail loaded" loading="lazy">
                <h3>${doc.title}</h3>
                <p>${doc.date}</p>
                <a href="${doc.link || '#'}" class="btn" target="_blank">Lihat Dokumentasi</a>
            </div>
        `).join('');
    }
}

async function loadComments() {
    const res = await fetch(`${API_BASE_URL}/comments`);
    const data = await res.json();
    const container = document.getElementById('comment-list');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = '<p>Belum ada komentar.</p>';
        return;
    }
    container.innerHTML = data.map(c => {
        const date = new Date(c.createdAt);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('id-ID', options);
        
        return `
            <div class="comment-item">
                <strong>${c.name}</strong>
                <small>${formattedDate}</small>
                <p>${c.message}</p>
            </div>
        `;
    }).join('');
}
