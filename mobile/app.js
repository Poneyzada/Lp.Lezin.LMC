/* ==========================================================================
   LEZIN LANDING PAGE - INTERAÇÕES MOBILE E SCROLL VIDEO SCRUBBING
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('progress-bar');
  const loaderStatus = document.getElementById('loader-status');
  const dobraCPanel = document.querySelector('.text-glass-panel');

  // Configuração dos Vídeos com Scroll Scrubbing
  const videoScrubbers = [
    {
      section: document.getElementById('hero'),
      video: document.getElementById('hero-video'),
      targetTime: 0,
      currentTime: 0,
      loaded: false
    },
    {
      section: document.getElementById('dobra-c'),
      video: document.getElementById('dobra-c-video'),
      targetTime: 0,
      currentTime: 0,
      loaded: false
    }
  ];

  let loadedVideosCount = 0;

  // 1. CARREGAMENTO DOS VÍDEOS & LOADER
  function checkAllAssetsLoaded() {
    loadedVideosCount++;
    const progress = Math.min((loadedVideosCount / videoScrubbers.length) * 100, 100);
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (loaderStatus) loaderStatus.textContent = `Carregado: ${loadedVideosCount}/${videoScrubbers.length}`;

    if (loadedVideosCount >= videoScrubbers.length) {
      setTimeout(() => {
        if (loader) loader.classList.add('loaded');
      }, 500);
    }
  }

  videoScrubbers.forEach(scrubber => {
    const v = scrubber.video;
    if (!v) return;

    // Força o carregamento do recurso no mobile
    v.load();

    // Timeout de segurança (2.5s) caso o navegador mobile bloqueie o carregamento prévio
    const timeoutId = setTimeout(() => {
      if (!scrubber.loaded) {
        console.log("Pre-load fallback mobile acionado para:", v.id);
        scrubber.loaded = true;
        checkAllAssetsLoaded();
      }
    }, 2500);

    const onVideoLoaded = () => {
      clearTimeout(timeoutId);
      if (!scrubber.loaded) {
        scrubber.loaded = true;
        
        // Force pre-play and pause to load buffer and render first frame on mobile
        const playPromise = v.play();
        if (playPromise !== undefined && typeof playPromise.then === 'function') {
          playPromise.then(() => {
            v.pause();
            try {
              v.currentTime = 0.001;
            } catch (e) {}
          }).catch(err => {
            console.warn("Mobile auto-play blocked or play/pause init failed:", err);
            try {
              v.currentTime = 0.001;
            } catch (e) {}
          });
        } else {
          v.pause();
          try {
            v.currentTime = 0.001;
          } catch (e) {}
        }

        checkAllAssetsLoaded();
      }
    };

    if (v.readyState >= 1) {
      onVideoLoaded();
    } else {
      v.addEventListener('loadedmetadata', onVideoLoaded);
    }

    v.addEventListener('error', () => {
      clearTimeout(timeoutId);
      console.warn('Erro ao carregar vídeo no mobile, continuando...');
      scrubber.loaded = true;
      checkAllAssetsLoaded();
    });
  });

  window.addEventListener('load', () => {
    if (progressBar) progressBar.style.width = '100%';
    setTimeout(() => {
      if (loader && !loader.classList.contains('loaded')) {
        loader.classList.add('loaded');
      }
    }, 300);
  });


  // 2. AUTOPLAY MOBILE: Vídeos tocam automaticamente quando visíveis (mais confiável no mobile)
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.bottom >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    );
  }

  function handleMobileAutoplay() {
    videoScrubbers.forEach(scrubber => {
      if (!scrubber.video) return;
      
      if (isElementInViewport(scrubber.section)) {
        if (scrubber.video.paused) {
          scrubber.video.loop = true;
          scrubber.video.muted = true;
          const p = scrubber.video.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      } else {
        if (!scrubber.video.paused) {
          scrubber.video.pause();
        }
      }
    });
  }

  window.addEventListener('scroll', () => {
    handleMobileAutoplay();
    animateOnScroll();
  });

  // Trigger initial check
  setTimeout(handleMobileAutoplay, 1000);


  // 3. ANIMAÇÃO DE FADE-IN NO SCROLL
  function animateOnScroll() {
    const dobraCSection = document.getElementById('dobra-c');
    if (dobraCSection && dobraCPanel) {
      const rect = dobraCSection.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      if (rect.top <= viewHeight * 0.4 && rect.bottom >= viewHeight * 0.2) {
        dobraCPanel.classList.add('visible');
      } else {
        dobraCPanel.classList.remove('visible');
      }
    }
  }


  // 4. CONFIGURAÇÃO DE DADOS (COM ROTAS RELATIVAS PARA O ROOT)
  const CONFIG = {
    discography: [
      {
        title: "JUDAS",
        type: "Single",
        year: "2024",
        cover: "/lezin-pray.jpg",
        links: {
          spotify: "https://open.spotify.com/artist/2JcdqbrYd99HWzPaBRCSfp?si=BgWX8qozQ8e9PHqzZj8geg",
          youtube: "https://www.youtube.com/watch?v=q6tF4Xn25q4",
          apple: "https://music.apple.com/br/artist/lezin/1455820327",
          deezer: "https://www.deezer.com/br/artist/13406783"
        }
      },
      {
        title: "GANA",
        type: "Single",
        year: "2024",
        cover: "/lezin-corrente.jpg",
        links: {
          spotify: "https://open.spotify.com/artist/2JcdqbrYd99HWzPaBRCSfp?si=BgWX8qozQ8e9PHqzZj8geg",
          youtube: "https://www.youtube.com/watch?v=wXQJ5_fM18I",
          apple: "https://music.apple.com/br/artist/lezin/1455820327",
          deezer: "https://www.deezer.com/br/artist/13406783"
        }
      },
      {
        title: "MUSTANG",
        type: "Single",
        year: "2023",
        cover: "/lezin-blur.jpg",
        links: {
          spotify: "https://open.spotify.com/artist/2JcdqbrYd99HWzPaBRCSfp?si=BgWX8qozQ8e9PHqzZj8geg",
          youtube: "https://www.youtube.com/watch?v=pWb8X95qU4w",
          apple: "https://music.apple.com/br/artist/lezin/1455820327"
        }
      },
      {
        title: "ALICE",
        type: "Single",
        year: "2023",
        cover: "/lezin-dpe.jpg",
        links: {
          spotify: "https://open.spotify.com/artist/2JcdqbrYd99HWzPaBRCSfp?si=BgWX8qozQ8e9PHqzZj8geg",
          youtube: "https://www.youtube.com/watch?v=W79U4U879y0",
          apple: "https://music.apple.com/br/artist/lezin/1455820327",
          deezer: "https://www.deezer.com/br/artist/13406783"
        }
      },
      {
        title: "BERÇO DO TRAP",
        type: "Single",
        year: "2022",
        cover: "/lezin-pray.jpg",
        links: {
          spotify: "https://open.spotify.com/artist/2JcdqbrYd99HWzPaBRCSfp?si=BgWX8qozQ8e9PHqzZj8geg",
          youtube: "https://www.youtube.com/watch?v=cM3kZ3J5q5k",
          deezer: "https://www.deezer.com/br/artist/13406783"
        }
      },
      {
        title: "O Dono das Ruas",
        type: "Álbum",
        year: "2024",
        cover: "/lezin-dpe.jpg",
        links: {
          spotify: "https://open.spotify.com/artist/2JcdqbrYd99HWzPaBRCSfp?si=BgWX8qozQ8e9PHqzZj8geg",
          youtube: "https://www.youtube.com/@lezinlmc",
          apple: "https://music.apple.com/br/artist/lezin/1455820327",
          deezer: "https://www.deezer.com/br/artist/13406783"
        }
      }
    ],
    compositions: [
      {
        title: "Sereia",
        artist: "Orochi, Ryan SP, Lezin",
        cover: "/lezin-corrente.jpg",
        links: {
          spotify: "https://open.spotify.com/artist/2JcdqbrYd99HWzPaBRCSfp?si=BgWX8qozQ8e9PHqzZj8geg"
        }
      },
      {
        title: "Aura",
        artist: "Azevedo, Lezin",
        cover: "/lezin-blur.jpg",
        links: {
          spotify: "https://open.spotify.com/artist/2JcdqbrYd99HWzPaBRCSfp?si=BgWX8qozQ8e9PHqzZj8geg"
        }
      }
    ],
    videos: [
      { title: "JUDAS", type: "Clipe Oficial", id: "q6tF4Xn25q4" },
      { title: "GANA", type: "Clipe Oficial", id: "wXQJ5_fM18I" },
      { title: "MUSTANG", type: "Clipe Oficial", id: "pWb8X95qU4w" },
      { title: "ALICE", type: "Clipe Oficial", id: "W79U4U879y0" },
      { title: "BERÇO DO TRAP", type: "Clipe Oficial", id: "cM3kZ3J5q5k" }
    ]
  };

  // 5. RENDERIZAÇÃO DA DISCOGRAFIA E FILTROS
  function renderDiscography(filter = 'Tudo') {
    const grid = document.getElementById('discography-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const items = filter === 'Tudo' 
      ? CONFIG.discography 
      : CONFIG.discography.filter(item => item.type === filter);

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'disc-card';
      card.addEventListener('click', () => openSmartLink(item));
      
      card.innerHTML = `
        <img src="${item.cover}" alt="${item.title}" class="disc-card-img">
        <div class="disc-card-overlay">
          <span class="disc-card-tag">${item.type} · ${item.year}</span>
          <h4 class="disc-card-title">${item.title}</h4>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // 6. RENDERIZAÇÃO DAS COMPOSIÇÕES
  function renderCompositions() {
    const grid = document.getElementById('compositions-grid');
    if (!grid) return;
    
    grid.innerHTML = '';

    CONFIG.compositions.forEach(item => {
      const card = document.createElement('div');
      card.className = 'comp-card';
      card.addEventListener('click', () => openSmartLink({
        title: item.title,
        type: 'Composição',
        year: 'Escrita por Lezin',
        cover: item.cover,
        links: item.links
      }));

      card.innerHTML = `
        <div class="comp-card-img-wrapper">
          <img src="${item.cover}" alt="${item.title}" class="comp-card-img">
        </div>
        <div class="comp-card-info">
          <h4 class="comp-card-title">${item.title}</h4>
          <p class="comp-card-artist">${item.artist}</p>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Controladores de botões de filtro
  window.filterDiscography = function(filter) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      if (btn.textContent.trim() === filter || (filter === 'Tudo' && btn.textContent.trim() === 'Tudo')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    renderDiscography(filter);
  };

  // 7. RENDERIZAÇÃO DO HUB VISUAL (YOUTUBE VIDEOS)
  let currentVideoId = CONFIG.videos[0].id;

  window.playMainVideo = function(id) {
    if (id) currentVideoId = id;
    
    const poster = document.getElementById('main-video-poster');
    const iframe = document.getElementById('main-video-frame');
    
    if (poster && iframe) {
      poster.classList.add('hidden');
      iframe.classList.remove('hidden');
      iframe.src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1`;
    }
  };

  function renderVideos() {
    const thumb = document.getElementById('main-video-thumb');
    if (thumb) {
      thumb.src = `https://img.youtube.com/vi/${CONFIG.videos[0].id}/hqdefault.jpg`;
    }

    const playlist = document.getElementById('video-playlist');
    if (!playlist) return;
    
    playlist.innerHTML = '';

    CONFIG.videos.forEach((video, index) => {
      const row = document.createElement('div');
      row.className = `playlist-item ${index === 0 ? 'active' : ''}`;
      row.addEventListener('click', () => {
        document.querySelectorAll('.playlist-item').forEach(item => item.classList.remove('active'));
        row.classList.add('active');

        currentVideoId = video.id;
        const poster = document.getElementById('main-video-poster');
        const iframe = document.getElementById('main-video-frame');

        if (iframe && !iframe.classList.contains('hidden')) {
          iframe.src = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
        } else if (thumb) {
          thumb.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
        }
      });

      row.innerHTML = `
        <div class="playlist-item-thumb-wrapper">
          <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${video.title}" class="playlist-item-thumb">
          <div class="playlist-item-play-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
        <div class="playlist-item-details">
          <span class="playlist-item-tag">${video.type}</span>
          <h4 class="playlist-item-title">${video.title}</h4>
        </div>
      `;
      playlist.appendChild(row);
    });
  }

  // 8. POPUP SMART LINK
  const modal = document.getElementById('smart-link-modal');
  const modalCover = document.getElementById('modal-cover');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalLinksGrid = document.getElementById('modal-links-grid');

  function openSmartLink(item) {
    if (!modal) return;

    modalCover.src = item.cover;
    modalTitle.textContent = item.title;
    modalSubtitle.textContent = `${item.type} · ${item.year}`;

    modalLinksGrid.innerHTML = '';

    const platforms = [
      { name: 'Spotify', key: 'spotify', class: 'spotify', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.075-.336.135-.668.47-.743 3.856-.88 7.15-.51 9.817 1.127.294.18.387.563.207.861zm1.226-2.723c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.183-.412.125-.845-.107-.97-.52-.125-.412.107-.845.52-.97 3.666-1.112 8.246-.575 11.34 1.327.367.227.488.708.26 1.086zm.106-2.833C14.492 8.78 8.72 8.59 5.38 9.602c-.515.156-1.05-.133-1.206-.648-.156-.514.133-1.05.648-1.206 3.83-1.162 10.202-.943 14.164 1.41.463.275.614.873.34 1.336-.275.463-.873.614-1.336.34z"/></svg>' },
      { name: 'YouTube Music', key: 'youtube', class: 'youtube', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.872.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
      { name: 'Apple Music', key: 'apple', class: 'apple', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>' },
      { name: 'Deezer', key: 'deezer', class: 'deezer', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="18" width="3" height="3" rx="1"/><rect x="7" y="16" width="3" height="5" rx="1"/><rect x="12" y="14" width="3" height="7" rx="1"/><rect x="17" y="12" width="3" height="9" rx="1"/><rect x="22" y="10" width="3" height="11" rx="1"/></svg>' }
    ];

    platforms.forEach(platform => {
      if (item.links && item.links[platform.key]) {
        const row = document.createElement('a');
        row.href = item.links[platform.key];
        row.target = '_blank';
        row.className = `modal-link-row ${platform.class}`;
        
        row.innerHTML = `
          <span>${platform.name}</span>
          ${platform.icon}
        `;
        modalLinksGrid.appendChild(row);
      }
    });

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  window.closeSmartLinkModal = function() {
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  renderDiscography();
  renderCompositions();
  renderVideos();
});
