document.addEventListener('DOMContentLoaded', () => {
  // --- DYNAMIC CONTENT FETCHING ---
  const PROD_URL = 'https://backend-rapanportofolio.vercel.app/api'; 
  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                  ? 'http://localhost:5000/api' 
                  : PROD_URL;

  async function loadPortfolioData() {
    try {
      // 1. Fetch Biodata
      const bioRes = await fetch(`${API_URL}/biodata`);
      const bioData = await bioRes.json();
      if (bioData.length > 0) {
        const bio = bioData[0];
        document.getElementById('view-bio-header').innerText = bio.name ? 'Biodata' : '';
        document.getElementById('view-bio-img').src = bio.profileImg || 'assets/Foto Profil.png';
        document.getElementById('view-bio-description').innerHTML = `<p>${bio.description || ''}</p>`;
        document.getElementById('view-bio-quote').innerText = bio.quote ? `"${bio.quote}"` : '';
        
        // Typing Effect Setup (Re-run with new data)
        initTypingEffect(bio.name || "Rafan Parsa Putra Rustaman", bio.subtitle || "Pelajar");
      }

      // 2. Fetch Education
      const eduRes = await fetch(`${API_URL}/education`);
      const eduData = await eduRes.json();
      const eduList = document.getElementById('view-education-list');
      eduList.innerHTML = eduData.map(edu => `
        <div class="skill-app">
          <img src="${edu.logo}" alt="${edu.level}" class="app-logo loaded" loading="lazy">
          <h3>${edu.schoolName}</h3>
        </div>
      `).join('');

      // 3. Fetch Projects
      const projRes = await fetch(`${API_URL}/projects`);
      const projData = await projRes.json();
      renderProjects(projData);

      // 4. Fetch Achievements
      const achRes = await fetch(`${API_URL}/achievements`);
      const achData = await achRes.json();
      const achTimeline = document.getElementById('view-achievements-timeline');
      achTimeline.innerHTML = achData.map(ach => `
        <div class="timeline-item ${ach.side || 'left'}">
          <div class="timeline-date">${ach.date}</div>
          <div class="timeline-content">
            <h3>${ach.title}</h3>
            <p>${ach.description}</p>
          </div>
        </div>
      `).join('');
      initJourneyLoadMore();

      // 5. Fetch Skills
      const skillRes = await fetch(`${API_URL}/skills`);
      const skillData = await skillRes.json();
      const skillList = document.getElementById('view-skills-list');
      skillList.innerHTML = skillData.map(s => `
        <div class="skill-app">
          <img src="${s.logo}" alt="${s.name}" class="app-logo loaded" loading="lazy">
        </div>
      `).join('');

      // 6. Fetch Documentation
      const docRes = await fetch(`${API_URL}/documentation`);
      const docData = await docRes.json();
      const docGrid = document.getElementById('view-documentation-grid');
      docGrid.innerHTML = docData.map(doc => `
        <div class="certificate-card">
          <img src="${doc.imgUrl}" alt="${doc.title}" class="project-thumbnail loaded" loading="lazy">
          <h3>${doc.title}</h3>
          <p>${doc.date}</p>
          <a href="${doc.link}" class="btn" target="_blank">Lihat Dokumentasi</a>
        </div>
      `).join('');

      // 7. Fetch Contacts
      const contactRes = await fetch(`${API_URL}/contacts`);
      const contactData = await contactRes.json();
      const contactList = document.getElementById('view-contacts-list');
      contactList.innerHTML = contactData.map(c => `
        <a href="${c.url}" target="_blank" class="btn social-icon-link" aria-label="${c.platform}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="${c.iconSvg}"/>
          </svg>
          <span>${c.label}</span>
        </a>
      `).join('');

    } catch (err) { console.error("Error loading dynamic content:", err); }
  }

  function initTypingEffect(nameText, currentSubtitle) {
    const typingName = document.getElementById('typing-name');
    const typingSubtitle = document.getElementById('typing-subtitle');
    if (!typingName || !typingSubtitle) return;
    
    let nameIndex = 0;
    let subtitleIndex = 0;
    let nameForward = true;
    let subtitleForward = true;
    let subtitleStarted = false;

    function typeName() {
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
          subtitleForward = true;
          setTimeout(typeSubtitle, 500);
          return;
        }
      }
      typingSubtitle.innerHTML = currentSubtitle.substring(0, subtitleIndex) + '<span class="typing-cursor">|</span>';
      setTimeout(typeSubtitle, 150);
    }
    typeName();
  }

  function renderProjects(projects) {
    const projectGrid = document.getElementById('view-projects-grid');
    const paginationContainer = document.getElementById('projects-pagination');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const itemsPerPage = 9;
    let currentPage = 1;
    let currentFilter = 'semua';

    function updateDisplay() {
      const filtered = projects.filter(p => currentFilter === 'semua' || p.category === currentFilter);
      const totalPages = Math.ceil(filtered.length / itemsPerPage);
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;

      projectGrid.innerHTML = filtered.slice(start, end).map(p => `
        <div class="project-card" data-category="${p.category}">
          ${p.mediaType === 'video' 
            ? `<video src="${p.mediaUrl}" class="project-thumbnail loaded" muted preload="metadata"></video>`
            : `<img src="${p.mediaUrl}" class="project-thumbnail loaded" loading="lazy">`
          }
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <a href="${p.link || '#'}" class="btn detail-btn" data-media="${p.mediaUrl}" data-type="${p.mediaType}">Lihat Detail</a>
        </div>
      `).join('');
      
      renderPagination(totalPages, currentPage, (page) => {
        currentPage = page;
        updateDisplay();
        document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
      });
      initMediaModal();
    }

    filterButtons.forEach(btn => {
      btn.onclick = () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        currentPage = 1;
        updateDisplay();
      };
    });

    updateDisplay();
  }

  function renderPagination(totalPages, current, onPageChange) {
    const container = document.getElementById('projects-pagination');
    container.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `pagination-btn ${i === current ? 'active' : ''}`;
      btn.innerText = i;
      btn.onclick = () => onPageChange(i);
      container.appendChild(btn);
    }
  }

  function initJourneyLoadMore() {
    const items = document.querySelectorAll('.timeline-item');
    const btn = document.getElementById('load-more-journey');
    if (!btn || items.length === 0) return;
    let visible = 5;
    const update = () => {
      items.forEach((item, i) => {
        item.style.display = i < visible ? 'block' : 'none';
        item.style.opacity = i < visible ? '1' : '0';
      });
      btn.innerText = visible >= items.length ? 'Tampilkan Lebih Sedikit' : 'Pelajari Lebih Lanjut';
    };
    btn.onclick = () => {
      if (visible >= items.length) visible = 5;
      else visible += 5;
      update();
    };
    update();
  }

  function initMediaModal() {
    const modal = document.getElementById('mediaModal');
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const detailBtns = document.querySelectorAll('.detail-btn');
    
    detailBtns.forEach(btn => {
      btn.onclick = (e) => {
        if (btn.getAttribute('href') !== '#') return;
        e.preventDefault();
        const src = btn.dataset.media;
        const type = btn.dataset.type;
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
  }

  loadPortfolioData();

  // --- EXISTING COMMENT LOGIC ---
  const commentForm = document.getElementById('comment-form');
  const commentList = document.getElementById('comment-list');

  async function fetchComments() {
    try {
      const response = await fetch(`${API_URL}/comments`);
      const comments = await response.json();
      commentList.innerHTML = comments.length === 0 
        ? '<p class="no-comments">Belum ada komentar. Jadilah yang pertama!</p>'
        : comments.map(c => `
          <div class="comment-item">
            <div class="comment-header">
              <span class="comment-author">${c.name}</span>
              <span class="comment-date">${new Date(c.createdAt).toLocaleDateString('id-ID')}</span>
            </div>
            <p class="comment-message">${c.message}</p>
          </div>
        `).join('');
    } catch (error) {
      commentList.innerHTML = '<p class="error-comments">Gagal memuat komentar.</p>';
    }
  }

  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const commentData = {
        name: document.getElementById('comment-name').value,
        message: document.getElementById('comment-message').value
      };
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      });
      if (response.ok) {
        document.getElementById('comment-name').value = '';
        document.getElementById('comment-message').value = '';
        fetchComments();
      }
    });
    fetchComments();
  }
});
