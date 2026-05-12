document.addEventListener('DOMContentLoaded', () => {
  const typingName = document.getElementById('typing-name');
  const typingSubtitle = document.getElementById('typing-subtitle');
  const nameText = "Rafan Parsa Putra Rustamann";
  let currentSubtitle = "Pelajarr";
  let subtitleTexts = ["Pelajar", "Freelance"];
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
          typeSubtitle(); // Start subtitle when name is full first time
        }
        setTimeout(typeName, 1000); // Pause at full text
        return;
      }
    } else {
      nameIndex--;
      if (nameIndex === 0) {
        nameForward = true;
        setTimeout(typeName, 500); // Pause at empty text
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
        setTimeout(typeSubtitle, 1000); // Pause at full text
        return;
      }
    } else {
      subtitleIndex--;
      if (subtitleIndex === 0) {
        // Switch to the other subtitle
        currentSubtitle = currentSubtitle === "Pelajarr" ? "Freelancee" : "Pelajarr";
        subtitleForward = true;
        setTimeout(typeSubtitle, 500); // Pause at empty text
        return;
      }
    }
    typingSubtitle.innerHTML = currentSubtitle.substring(0, subtitleIndex) + '<span class="typing-cursor">|</span>';
    setTimeout(typeSubtitle, 150);
  }

  typeName();

  // Handle image/video fade-in after load
  const mediaElements = document.querySelectorAll('img, video');
  mediaElements.forEach(media => {
    if (media.complete) {
      media.classList.add('loaded');
    } else {
      media.addEventListener('load', () => media.classList.add('loaded'));
      media.addEventListener('loadeddata', () => media.classList.add('loaded')); // for videos
    }
  });

  // Project Filter & Pagination Functionality
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = Array.from(document.querySelectorAll('.project-card'));
  const paginationContainer = document.getElementById('projects-pagination');
  const itemsPerPage = 9;
  let currentPage = 1;
  let currentFilter = 'semua';

  function updateProjects() {
    const filteredCards = projectCards.filter(card => {
      const category = card.getAttribute('data-category');
      return currentFilter === 'semua' || category === currentFilter;
    });

    const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
    
    // Ensure currentPage is valid
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // Show/Hide cards based on current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    projectCards.forEach(card => {
      card.style.display = 'none';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.8)';
    });

    filteredCards.forEach((card, index) => {
      if (index >= startIndex && index < endIndex) {
        card.style.display = 'block';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, 10);
      }
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    // First page button
    const firstBtn = createPaginationBtn('«', () => {
      currentPage = 1;
      updateProjects();
      scrollToProjects();
    }, currentPage === 1);
    paginationContainer.appendChild(firstBtn);

    // Prev button
    const prevBtn = createPaginationBtn('‹', () => {
      if (currentPage > 1) {
        currentPage--;
        updateProjects();
        scrollToProjects();
      }
    }, currentPage === 1);
    paginationContainer.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = createPaginationBtn(i, () => {
        currentPage = i;
        updateProjects();
        scrollToProjects();
      }, false, i === currentPage);
      paginationContainer.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = createPaginationBtn('›', () => {
      if (currentPage < totalPages) {
        currentPage++;
        updateProjects();
        scrollToProjects();
      }
    }, currentPage === totalPages);
    paginationContainer.appendChild(nextBtn);

    // Last page button
    const lastBtn = createPaginationBtn('»', () => {
      currentPage = totalPages;
      updateProjects();
      scrollToProjects();
    }, currentPage === totalPages);
    paginationContainer.appendChild(lastBtn);
  }

  function createPaginationBtn(text, onClick, disabled, active = false) {
    const btn = document.createElement('button');
    btn.className = `pagination-btn ${active ? 'active' : ''}`;
    btn.innerHTML = text;
    btn.disabled = disabled;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function scrollToProjects() {
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.getAttribute('data-filter');
      currentPage = 1;

      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      updateProjects();
    });
  });

  // Initial call
  updateProjects();

  // Media Modal Functionality
  const modal = document.getElementById('mediaModal');
  const modalImage = document.getElementById('modalImage');
  const modalVideo = document.getElementById('modalVideo');
  const closeModal = document.querySelector('.close-modal');
  const detailBtns = document.querySelectorAll('.detail-btn');

  detailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mediaSrc = btn.getAttribute('data-media');
      const mediaType = btn.getAttribute('data-type');

      if (mediaType === 'image') {
        modalImage.src = mediaSrc;
        modalImage.style.display = 'block';
        modalVideo.style.display = 'none';
      } else if (mediaType === 'video') {
        modalVideo.querySelector('source').src = mediaSrc;
        modalVideo.load();
        modalVideo.style.display = 'block';
        modalImage.style.display = 'none';
      }

      modal.style.display = 'block';
    });
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    modalVideo.pause();
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      modalVideo.pause();
    }
  });

  // Prevent modal close when clicking inside modal content
  document.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Mobile Navbar Toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }

  // Journey "Load More" Functionality
  const journeyItems = document.querySelectorAll('.timeline-item');
  const loadMoreBtn = document.getElementById('load-more-journey');
  const itemsPerLoad = 5;
  let visibleItemsCount = itemsPerLoad;

  function updateJourneyVisibility() {
    journeyItems.forEach((item, index) => {
      if (index < visibleItemsCount) {
        item.style.display = 'block';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 10);
      } else {
        item.style.display = 'none';
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
      }
    });

    // Toggle button text and functionality
    if (visibleItemsCount >= journeyItems.length) {
      loadMoreBtn.innerText = 'Tampilkan Lebih Sedikit';
    } else {
      loadMoreBtn.innerText = 'Pelajari Lebih Lanjut';
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      if (visibleItemsCount >= journeyItems.length) {
        // Collapse logic
        visibleItemsCount = itemsPerLoad;
        updateJourneyVisibility();
        document.getElementById('journey').scrollIntoView({ behavior: 'smooth' });
      } else {
        // Expand logic
        const prevCount = visibleItemsCount;
        visibleItemsCount += itemsPerLoad;
        updateJourneyVisibility();
        
        // Scroll to the first newly shown item
        const firstNewItem = journeyItems[prevCount];
        if (firstNewItem) {
          firstNewItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    // Initial call
    updateJourneyVisibility();
  }

  // Smooth Scroll for Navigation

  // Comment Feature Logic
  const commentForm = document.getElementById('comment-form');
  const commentList = document.getElementById('comment-list');
  
  // URL Backend Anda setelah di-deploy nanti
   const PROD_URL = 'https://backend-rapanportofolio.vercel.app/api'; 
   const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                   ? 'http://localhost:5000/api' 
                   : PROD_URL;

  async function fetchComments() {
    try {
      const response = await fetch(`${API_URL}/comments`);
      const comments = await response.json();
      
      commentList.innerHTML = '';
      if (comments.length === 0) {
        commentList.innerHTML = '<p class="no-comments">Belum ada komentar. Jadilah yang pertama!</p>';
        return;
      }

      comments.forEach(comment => {
        const date = new Date(comment.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item';
        commentElement.innerHTML = `
          <div class="comment-header">
            <span class="comment-author">${comment.name}</span>
            <span class="comment-date">${date}</span>
          </div>
          <p class="comment-message">${comment.message}</p>
        `;
        commentList.appendChild(commentElement);
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      commentList.innerHTML = '<p class="error-comments">Gagal memuat komentar. Pastikan server backend berjalan.</p>';
    }
  }

  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('comment-name');
      const messageInput = document.getElementById('comment-message');
      
      const commentData = {
        name: nameInput.value,
        message: messageInput.value
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(commentData)
        });

        if (response.ok) {
          nameInput.value = '';
          messageInput.value = '';
          fetchComments(); // Refresh list
        } else {
          alert('Gagal mengirim komentar.');
        }
      } catch (error) {
        console.error('Error posting comment:', error);
        alert('Gagal mengirim komentar. Pastikan server backend berjalan.');
      }
    });

    // Initial fetch
    fetchComments();
  }
});
