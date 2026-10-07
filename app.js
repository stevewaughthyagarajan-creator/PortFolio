// Application Logic, Animations, Scroll and Custom Interactions for Steve Justin Portfolio
// Loaded via CDN in index.html

function startApp() {
  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    console.error('GSAP or ScrollTrigger not loaded.');
  }

  initCustomCursor();
  initMagneticButtons();
  initTiltCards();
  initScrollAnimations();
  initSilhouetteAnimation();
  initTimelineHighlight();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

// ----------------------------------------------------
// 1. CUSTOM CURSOR
// ----------------------------------------------------
function initCustomCursor() {
  const dot = document.createElement('div');
  const circle = document.createElement('div');
  dot.className = 'custom-cursor-dot';
  circle.className = 'custom-cursor-circle';
  document.body.appendChild(dot);
  document.body.appendChild(circle);

  let mouseX = 0, mouseY = 0;
  let circleX = 0, circleY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Position dot immediately
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  // Smooth trail for outer circle
  function updateCursorTrail() {
    circleX += (mouseX - circleX) * 0.15;
    circleY += (mouseY - circleY) * 0.15;
    
    circle.style.left = `${circleX}px`;
    circle.style.top = `${circleY}px`;
    
    requestAnimationFrame(updateCursorTrail);
  }
  updateCursorTrail();

  // Handle hovers
  const hoverElements = document.querySelectorAll('a, button, .clickable, .tilt-card, .menu-item');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      if (el.classList.contains('cursor-explore')) {
        document.body.classList.add('cursor-hover-explore');
      } else if (el.classList.contains('cursor-view')) {
        document.body.classList.add('cursor-hover-view');
      }
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
      document.body.classList.remove('cursor-hover-explore');
      document.body.classList.remove('cursor-hover-view');
    });
  });

  // Hide cursor on mousedown
  window.addEventListener('mousedown', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    circle.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });

  window.addEventListener('mouseup', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(1)';
    circle.style.transform = 'translate(-50%, -50%) scale(1)';
  });
}

// ----------------------------------------------------
// 2. MAGNETIC BUTTONS
// ----------------------------------------------------
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.magnetic-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      
      // Move button towards cursor
      gsap.to(btn, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      // Return to base position
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });
}

// ----------------------------------------------------
// 3. 3D TILT CARDS WITH LIGHT REFLECTION
// ----------------------------------------------------
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  
  cards.forEach(card => {
    // Append reflection glow element
    const glow = document.createElement('div');
    glow.className = 'absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300';
    glow.style.background = 'radial-gradient(circle 120px at var(--mouse-x, 0) var(--mouse-y, 0), rgba(255, 255, 255, 0.08), transparent 80%)';
    card.appendChild(glow);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within element
      const y = e.clientY - rect.top;  // y coordinate within element
      
      // Set CSS variables for local mouse coordinates (used by radial gradient glow)
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      glow.style.opacity = '1';

      // 3D rotation offsets
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -(y - centerY) / (centerY / 8); // Max 8 degrees tilt
      const rotateY = (x - centerX) / (centerX / 8);
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    card.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  });
}

// ----------------------------------------------------
// 4. GSAP SCROLL TRIGGERS & TYPOGRAPHY REVEALS
// ----------------------------------------------------
function initScrollAnimations() {
  if (typeof gsap === 'undefined') return;

  // Typographic Reveal for Headings (.reveal-text)
  const revealElements = document.querySelectorAll('.reveal-text');
  revealElements.forEach(el => {
    gsap.fromTo(el, 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Staggered reveals for cards
  const skillSections = document.querySelectorAll('.skills-category-container');
  skillSections.forEach(section => {
    const cards = section.querySelectorAll('.tilt-card');
    gsap.from(cards, {
      opacity: 0,
      y: 50,
      scale: 0.95,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%'
      }
    });
  });

  // Beyond 2D Canvas entry scaling
  gsap.from('#beyond2d-three-canvas', {
    scale: 0.8,
    opacity: 0,
    duration: 1.5,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#beyond2d-section',
      start: 'top 75%'
    }
  });

  // Startup Section reveals
  const startupCards = document.querySelectorAll('.startup-card');
  startupCards.forEach(card => {
    gsap.from(card, {
      opacity: 0,
      x: card.dataset.side === 'left' ? -60 : 60,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 80%'
      }
    });
  });

  // Projects vertical showcase timeline
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    gsap.from(card, {
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 80%'
      }
    });
  });

  // Float Nav Indicator logic linked to sections scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('text-rose-500');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('text-rose-500');
      }
    });
  });
}

// ----------------------------------------------------
// 5. EXISTING BACKGROUND SILHOUETTE ANIMATION INJECTOR
// ----------------------------------------------------
function initSilhouetteAnimation() {
  const totalFrames = 223;
  const images = [];
  const canvas = document.getElementById('scroll-canvas');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  const loadingScreen = document.getElementById('loading');
  const progressEl = document.getElementById('progress');
  
  let loadedImagesCount = 0;
  let currentFrameIndex = 1;
  let targetFrameIndex = 1;
  let isAnimating = false;
  const ease = 0.08;

  function getFramePath(index) {
    const formattedIndex = String(index).padStart(3, '0');
    return `./ezgif-30f8329c1b63ad76-jpg/ezgif-frame-${formattedIndex}.jpg`;
  }

  // Preload all silhouette images
  function preloadImages() {
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedImagesCount++;
        updateProgress();
        if (loadedImagesCount === totalFrames) {
          startCanvasAnimation();
        }
      };
      img.onerror = () => {
        loadedImagesCount++;
        updateProgress();
        if (loadedImagesCount === totalFrames) {
          startCanvasAnimation();
        }
      };
      images.push(img);
    }
  }

  function updateProgress() {
    const pct = (loadedImagesCount / totalFrames) * 100;
    if (progressEl) progressEl.style.width = `${pct}%`;
  }

  function startCanvasAnimation() {
    // Fade out loading screen
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', handleScroll);
    
    isAnimating = true;
    updateFrame();
  }

  function handleScroll() {
    const scrollTop = window.scrollY;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
    
    // Map scroll percentage to frames 1-223
    targetFrameIndex = 1 + (scrollFraction * (totalFrames - 1));
    
    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(updateFrame);
    }
  }

  function resizeCanvas() {
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);
    renderFrame();
  }

  function renderFrame() {
    const index = Math.round(currentFrameIndex);
    const img = images[index - 1];
    if (img && context) {
      drawImageCover(context, img);
    }
  }

  function drawImageCover(ctx, img) {
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      drawX = 0;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      drawHeight = canvasHeight;
      drawX = (canvasWidth - drawWidth) / 2;
      drawY = 0;
    }
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  function updateFrame() {
    const diff = targetFrameIndex - currentFrameIndex;
    if (Math.abs(diff) > 0.001) {
      currentFrameIndex += diff * ease;
      renderFrame();
      requestAnimationFrame(updateFrame);
    } else {
      currentFrameIndex = targetFrameIndex;
      renderFrame();
      isAnimating = false;
    }
  }

  preloadImages();
}

// ----------------------------------------------------
// 6. TIMELINE HIGHLIGHT ON SCROLL
// ----------------------------------------------------
function initTimelineHighlight() {
  if (typeof gsap === 'undefined') return;

  const timelineBlocks = document.querySelectorAll('.timeline-block');
  timelineBlocks.forEach(block => {
    const dot = block.querySelector('.timeline-dot');
    
    gsap.fromTo(block,
      { opacity: 0.3 },
      {
        opacity: 1,
        duration: 0.5,
        scrollTrigger: {
          trigger: block,
          start: 'top 65%',
          end: 'bottom 40%',
          toggleActions: 'play reverse play reverse',
          onEnter: () => dot.classList.add('active'),
          onLeave: () => dot.classList.remove('active'),
          onEnterBack: () => dot.classList.add('active'),
          onLeaveBack: () => dot.classList.remove('active')
        }
      }
    );
  });
}
