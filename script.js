document.addEventListener('DOMContentLoaded', () => {
  // GANTI URL DI BAWAH INI DENGAN LINK BACKEND ANDA SETELAH DI-HOSTING
  // Contoh: 'https://nama-backend-anda.vercel.app/api'
  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://backend-rapanportofolio.vercel.app//api'; 

  // --- TYPING EFFECT ---
  let nameText = "Rafan Parsa Putra Rustaman";
  let subtitleTexts = ["Pelajarr", "Freelancee"];
  let currentSubtitleIndex = 0;
  let nameIndex = 0;
  let subtitleIndex = 0;
  let nameForward = true;
  let subtitleForward = true;
  let subtitleStarted = false;

  function typeName() {
    const typingName = document.getElementById('typing-name');
    if (!typingName) return;

    if (nameForward) {
      nameIndex++;
      if (nameIndex === nameText.length) {
        nameForward = false;
        if (!subtitleStarted) {
          subtitleStarted = true;
          typeSubtitle();
        }
        setTimeout(typeName, 1000);
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
    typingName.innerHTML = nameText.substring(0, nameIndex) + '<span class="typing-cursor">|</span>';
    setTimeout(typeName, 150);
  }

  function typeSubtitle() {
    const typingSubtitle = document.getElementById('typing-subtitle');
    if (!typingSubtitle) return;

    const currentSubtitle = subtitleTexts[currentSubtitleIndex];

    if (subtitleForward) {
      subtitleIndex++;
      if (subtitleIndex === currentSubtitle.length) {
        subtitleForward = false;
        setTimeout(typeSubtitle, 1000);
        return;
      }
    } else {
      subtitleIndex--;
      if (subtitleIndex === 0) {
        currentSubtitleIndex = (currentSubtitleIndex + 1) % subtitleTexts.length;
        subtitleForward = true;
        setTimeout(typeSubtitle, 500);
        return;
      }
    }
    typingSubtitle.innerHTML = currentSubtitle.substring(0, subtitleIndex) + '<span class="typing-cursor">|</span>';
    setTimeout(typeSubtitle, 150);
  }

  // --- FETCH & RENDER DATA ---
  
  // 1. BIODATA
  async function loadBiodata() {
    try {
      const res = await fetch(`${API_URL}/biodata`);
      const data = await res.json();
      if (data) {
        nameText = data.name || nameText;
        subtitleTexts = [data.subtitle || "Pelajar", "Freelance"];
        
        const container = document.getElementById('biodata-container');
        container.innerHTML = `
          <div class="profile-img-wrapper">
              <img src="${data.profileImage || 'assets/Foto Profil.png'}" alt="Foto Profil" class="profile-img" loading="lazy">
          </div>
          <div class="biodata-text">
              <h3 id="typing-name"></h3>
              <h4 id="typing-subtitle"></h4>
              <p>${data.description || ''}</p>
              ${data.quote ? `<p><b>"${data.quote}"</b></p>` : ''}
          </div>
        `;
        // Restart typing effect after container is replaced
        nameIndex = 0;
        subtitleIndex = 0;
        subtitleStarted = false;
        typeName();
      } else {
        typeName(); // Fallback to defaults
      }
    } catch (err) {
      console.error('Error loading biodata:', err);
      typeName();
    }
  }

  // 2. EDUCATION
  async function loadEducation() {
    try {
      const res = await fetch(`${API_URL}/education`);
      const data = await res.json();
      const container = document.getElementById('education-container');
      if (data && data.length > 0) {
        container.innerHTML = '';
        data.forEach(edu => {
          container.innerHTML += `
            <div class="skill-app">
                <img src="${edu.logo}" alt="${edu.level}" class="app-logo" loading="lazy">
                <h3>${edu.schoolName}</h3>
            </div>
          `;
        });
      }
    } catch (err) {
      console.error('Error loading education:', err);
    }
  }

  // 3. PROJECTS (with filtering and pagination)
  let allProjects = [];
  let currentFilter = 'semua';
  let currentPage = 1;
  const itemsPerPage = 9;

  async function loadProjects() {
    try {
      const res = await fetch(`${API_URL}/projects`);
      allProjects = await res.json();
      updateProjectsDisplay();
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }

  function updateProjectsDisplay() {
    const grid = document.getElementById('projects-grid');
    const filtered = allProjects.filter(p => currentFilter === 'semua' || p.category === currentFilter);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = filtered.slice(start, end);

    grid.innerHTML = '';
    paginated.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.setAttribute('data-category', p.category);
      
      let mediaHtml = '';
      if (p.mediaType === 'video') {
        mediaHtml = `<video src="${p.mediaUrl}" class="project-thumbnail" muted preload="metadata"></video>`;
      } else {
        mediaHtml = `<img src="${p.mediaUrl}" alt="${p.title}" class="project-thumbnail" loading="lazy">`;
      }

      card.innerHTML = `
        ${mediaHtml}
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="project-actions">
          <a href="#" class="btn detail-btn" data-media="${p.mediaUrl}" data-type="${p.mediaType}">Lihat Detail</a>
          ${p.link ? `<a href="${p.link}" class="btn" target="_blank">Kunjungi</a>` : ''}
        </div>
      `;
      grid.appendChild(card);
    });

    renderPagination(totalPages);
    setupModalEvents();
  }

  function renderPagination(totalPages) {
    const container = document.getElementById('projects-pagination');
    container.innerHTML = '';
    if (totalPages <= 1) return;

    const createBtn = (text, page, active = false, disabled = false) => {
      const btn = document.createElement('button');
      btn.className = `pagination-btn ${active ? 'active' : ''}`;
      btn.innerHTML = text;
      btn.disabled = disabled;
      btn.onclick = () => {
        currentPage = page;
        updateProjectsDisplay();
        document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
      };
      return btn;
    };

    container.appendChild(createBtn('«', 1, false, currentPage === 1));
    for (let i = 1; i <= totalPages; i++) {
      container.appendChild(createBtn(i, i, i === currentPage));
    }
    container.appendChild(createBtn('»', totalPages, false, currentPage === totalPages));
  }

  // 4. ACHIEVEMENTS (Journey)
  async function loadAchievements() {
    try {
      const res = await fetch(`${API_URL}/achievements`);
      const data = await res.json();
      const container = document.getElementById('journey-timeline');
      if (data && data.length > 0) {
        container.innerHTML = '';
        data.forEach((ach, index) => {
          const side = ach.side || (index % 2 === 0 ? 'left' : 'right');
          container.innerHTML += `
            <div class="timeline-item ${side}">
                <div class="timeline-date">${ach.date}</div>
                <div class="timeline-content">
                    <h3>${ach.title}</h3>
                    <p>${ach.description}</p>
                </div>
            </div>
          `;
        });
        updateJourneyVisibility();
      }
    } catch (err) {
      console.error('Error loading achievements:', err);
    }
  }

  // 5. SKILLS
  async function loadSkills() {
    try {
      const res = await fetch(`${API_URL}/skills`);
      const data = await res.json();
      const container = document.getElementById('skills-container');
      if (data && data.length > 0) {
        container.innerHTML = '';
        data.forEach(skill => {
          container.innerHTML += `
            <div class="skill-app">
                <img src="${skill.logo}" alt="${skill.name}" class="app-logo" loading="lazy">
                <h3>${skill.name}</h3>
            </div>
          `;
        });
      }
    } catch (err) {
      console.error('Error loading skills:', err);
    }
  }

  // --- MODAL & EVENTS ---
  function setupModalEvents() {
    const modal = document.getElementById('mediaModal');
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const closeModal = document.querySelector('.close-modal');
    const detailBtns = document.querySelectorAll('.detail-btn');

    detailBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const src = btn.getAttribute('data-media');
        const type = btn.getAttribute('data-type');

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
      };
    });

    closeModal.onclick = () => {
      modal.style.display = 'none';
      modalVideo.pause();
    };
    
    window.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        modalVideo.pause();
      }
    };
  }

  // Journey visibility logic
  const itemsPerLoad = 5;
  let visibleItemsCount = itemsPerLoad;

  function updateJourneyVisibility() {
    const journeyItems = document.querySelectorAll('.timeline-item');
    const loadMoreBtn = document.getElementById('load-more-journey');
    if (!loadMoreBtn) return;

    journeyItems.forEach((item, index) => {
      if (index < visibleItemsCount) {
        item.style.display = 'block';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      } else {
        item.style.display = 'none';
      }
    });

    if (visibleItemsCount >= journeyItems.length) {
      loadMoreBtn.innerText = 'Tampilkan Lebih Sedikit';
    } else {
      loadMoreBtn.innerText = 'Pelajari Lebih Lanjut';
    }
  }

  document.getElementById('load-more-journey').onclick = () => {
    const journeyItems = document.querySelectorAll('.timeline-item');
    if (visibleItemsCount >= journeyItems.length) {
      visibleItemsCount = itemsPerLoad;
      document.getElementById('journey').scrollIntoView({ behavior: 'smooth' });
    } else {
      visibleItemsCount += itemsPerLoad;
    }
    updateJourneyVisibility();
  };

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      currentPage = 1;
      updateProjectsDisplay();
    };
  });

  // Mobile Navbar
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  hamburger.onclick = () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  };
  navMenu.onclick = (e) => {
    if (e.target.tagName === 'A') {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  };

  // --- COMMENTS ---
  const commentForm = document.getElementById('comment-form');
  const commentList = document.getElementById('comment-list');

  async function fetchComments() {
    try {
      const res = await fetch(`${API_URL}/comments`);
      const comments = await res.json();
      commentList.innerHTML = comments.length ? '' : '<p class="no-comments">Belum ada komentar.</p>';
      comments.forEach(c => {
        const date = new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        commentList.innerHTML += `
          <div class="comment-item">
            <div class="comment-header"><span class="comment-author">${c.name}</span><span class="comment-date">${date}</span></div>
            <p class="comment-message">${c.message}</p>
          </div>
        `;
      });
    } catch (err) {
      commentList.innerHTML = '<p class="error">Gagal memuat komentar.</p>';
    }
  }

  commentForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('comment-name').value;
    const message = document.getElementById('comment-message').value;
    const res = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message })
    });
    if (res.ok) {
      commentForm.reset();
      fetchComments();
    }
  };

  // --- INITIALIZE ---
  loadBiodata();
  loadEducation();
  loadProjects();
  loadAchievements();
  loadSkills();
  fetchComments();
});
