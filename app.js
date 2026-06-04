/* ==========================================================================
   LEZIN LANDING PAGE - COMPORTAMENTOS INTERATIVOS & SCROLL VIDEO SCRUBBING
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('progress-bar');
  const loaderStatus = document.getElementById('loader-status');
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
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
    progressBar.style.width = `${progress}%`;
    loaderStatus.textContent = `Carregado: Vídeo ${loadedVideosCount} de ${videoScrubbers.length}`;

    if (loadedVideosCount >= videoScrubbers.length) {
      setTimeout(() => {
        loader.classList.add('loaded');
      }, 600);
    }
  }

  // Monitorar carregamento dos metadados de cada vídeo
  videoScrubbers.forEach(scrubber => {
    const v = scrubber.video;

    // Se já estiver pronto
    if (v.readyState >= 1) {
      scrubber.loaded = true;
      checkAllAssetsLoaded();
    } else {
      v.addEventListener('loadedmetadata', () => {
        scrubber.loaded = true;
        checkAllAssetsLoaded();
      });
    }

    // Fallback caso o browser bloqueie ou demore muito
    v.addEventListener('error', () => {
      console.warn('Erro ao carregar vídeo, continuando fluxo de carregamento...');
      scrubber.loaded = true; // Força para não travar a tela de loader
      checkAllAssetsLoaded();
    });
  });

  // Fallback geral de carregamento da página inteira (após 5s, se travar por codec de vídeo)
  window.addEventListener('load', () => {
    progressBar.style.width = '100%';
    loaderStatus.textContent = 'Carregamento finalizado';
    setTimeout(() => {
      if (!loader.classList.contains('loaded')) {
        loader.classList.add('loaded');
      }
    }, 400);
  });


  // 2. LOGICA DE SCROLL-DRIVEN VIDEO SCRUBBING (INTERPOLADA/SUAVE)
  
  // Função para verificar se elemento está na tela
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.bottom >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    );
  }

  // Atualiza o tempo de destino baseado no scroll
  function updateVideoTargets() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    videoScrubbers.forEach(scrubber => {
      if (!scrubber.loaded) return;

      const sectionRect = scrubber.section.getBoundingClientRect();
      const sectionTop = scrollY + sectionRect.top;
      const sectionHeight = scrubber.section.offsetHeight;

      // Calcular o progresso de rolagem dentro da seção específica
      // O progresso vai de 0 (topo da seção no topo da tela) até 1 (fim da seção no fim da tela)
      let progress = (scrollY - sectionTop) / (sectionHeight - windowHeight);
      
      // Clampar entre 0 e 1
      progress = Math.max(0, Math.min(1, progress));

      // Definir o tempo alvo com base no progresso e duração do vídeo
      if (scrubber.video.duration) {
        scrubber.targetTime = progress * scrubber.video.duration;
      }
    });
  }

  // Loop de Renderização para Suavização (Lerp - Linear Interpolation)
  // Isto evita travamento do player por causa da taxa de amostragem de scroll do mouse
  function smoothPlayVideoLoop() {
    videoScrubbers.forEach(scrubber => {
      if (!scrubber.loaded) return;

      // Se a seção do vídeo estiver visível, atualizamos o frame
      if (isElementInViewport(scrubber.section)) {
        // Easing Factor: quanto menor, mais suave (ex: 0.08)
        const easing = 0.08;
        
        // Distância entre o tempo atual e o tempo de destino
        const diff = scrubber.targetTime - scrubber.currentTime;

        // Se a diferença for minúscula, iguala diretamente para economizar processamento
        if (Math.abs(diff) < 0.01) {
          scrubber.currentTime = scrubber.targetTime;
        } else {
          scrubber.currentTime += diff * easing;
        }

        // Aplica o tempo suavizado ao vídeo
        try {
          scrubber.video.currentTime = scrubber.currentTime;
        } catch (e) {
          // Captura possíveis exceções caso o player esteja temporariamente instável
        }
      }
    });

    requestAnimationFrame(smoothPlayVideoLoop);
  }

  // Iniciar loop de renderização suave
  requestAnimationFrame(smoothPlayVideoLoop);

  // Ouvintes de Scroll
  window.addEventListener('scroll', () => {
    updateVideoTargets();
    handleNavbarScroll();
    animateOnScroll();
  });


  // 3. BARRA DE NAVEGAÇÃO & HIGHLIGHTS
  
  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Destacar o link correspondente à seção atual
  function animateOnScroll() {
    const scrollPosition = window.scrollY + 150; // Offset para ativação antecipada

    // Ativação dos links da navbar
    const sections = ['hero', 'sobre', 'dobra-c', 'galeria', 'streaming'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      }
    });

    // Animar entrada da dobra C (painel de texto glassmorphic)
    const dobraCSection = document.getElementById('dobra-c');
    if (dobraCSection) {
      const rect = dobraCSection.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      // Se a Dobra C ocupou pelo menos 30% da tela, exibe o painel de texto
      if (rect.top <= viewHeight * 0.5 && rect.bottom >= viewHeight * 0.3) {
        dobraCPanel.classList.add('visible');
      } else {
        dobraCPanel.classList.remove('visible');
      }
    }
  }


  // 4. EFEITO 3D TILT NAS FOTOS DA GALERIA
  
  const tiltCards = document.querySelectorAll('.card-tilt');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const cardRect = card.getBoundingClientRect();
      const cardWidth = cardRect.width;
      const cardHeight = cardRect.height;

      // Mouse em relação ao elemento (coordenadas x e y)
      const mouseX = e.clientX - cardRect.left;
      const mouseY = e.clientY - cardRect.top;

      // Calcular o ângulo de rotação (-10deg a 10deg)
      const rotateX = ((cardHeight / 2 - mouseY) / (cardHeight / 2)) * 10;
      const rotateY = ((mouseX - cardWidth / 2) / (cardWidth / 2)) * 10;

      // Aplica transformações 3D no container da imagem
      const imgContainer = card.querySelector('.gallery-img-container');
      imgContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      const imgContainer = card.querySelector('.gallery-img-container');
      imgContainer.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
});
