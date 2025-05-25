document.addEventListener('DOMContentLoaded', () => {
  const points = document.querySelectorAll('.point');
  const cards = document.querySelectorAll('.card');
  const detailedDescription = document.querySelector('.detailed-description');
  const detailedTitle = detailedDescription.querySelector('.detailed-title');
  const detailedText = detailedDescription.querySelector('.detailed-text');
  let horizontal = window.innerWidth > 600;
  const total = points.length;
  let activeIndex = 0;

  if (points.length !== cards.length) {
    console.error('Количество точек и карточек не совпадает!');
    return;
  }

  function wrapTextInSpans(element) {
    if (!element) return;
    const text = element.textContent;
    element.innerHTML = '';
    for (let char of text) {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      element.appendChild(span);
    }
  }

  function animateText(card) {
    const title = card.querySelector('h3');
    const description = card.querySelector('p');
    gsap.fromTo(
      title,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
    gsap.fromTo(
      description,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 }
    );
  }

  function showDetailedDescription(index) {
    const activeCard = cards[index];
    const cardTitle = activeCard.querySelector('h3').textContent;
    const cardDetailedText = activeCard.getAttribute('data-detailed');
    detailedTitle.textContent = cardTitle;
    detailedText.textContent = cardDetailedText;

    wrapTextInSpans(detailedTitle);
    wrapTextInSpans(detailedText);

    detailedDescription.classList.add('active');
    gsap.fromTo(
      detailedDescription,
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }
    );
  }

  function activate(index) {
    cards.forEach((card, idx) => {
      if (idx === index) {
        card.classList.add('active');
        animateText(card);
        showDetailedDescription(index);

        // click effect
        gsap.fromTo(card, 
          { scale: 1, borderRadius: "6px" }, 
          { 
            scale: 1.04, 
            borderRadius: "24px", 
            duration: 0.18, 
            yoyo: true, 
            repeat: 1, 
            ease: "power1.inOut",
            onComplete: () => {
              gsap.to(card, { scale: 1, borderRadius: "6px", duration: 0.18, ease: "power1.out" });
            }
          }
        );
      } else {
        card.classList.remove('active');
        gsap.to(card, { scale: 1, borderRadius: "6px", duration: 0.2, clearProps: "scale,borderRadius" });
      }
    });

    activeIndex = index;
  }

  function updateConfig() {
    horizontal = window.innerWidth > 600;
    cards.forEach(card => card.classList.remove('active'));
  }

  function setupClick() {
    points.forEach((point, i) => {
      point.addEventListener('click', () => {
        if (i !== activeIndex) {
          activate(i);
        }
      });
    });
    cards.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (i !== activeIndex) {
          activate(i);
        }
      });
    });
  }

  function setupScroll() {
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach(st => st.kill());
      cards.forEach((card, i) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top 80%',
          onEnter: () => activate(i),
          onEnterBack: () => activate(i)
        });
      });
    }
  }

  // --- Init ---
  updateConfig();
  activate(0);
  setupScroll();
  setupClick();

  // Ripple effect
  cards.forEach((card, i) => {
    card.addEventListener('click', function(e) {
      if (!card.classList.contains('active')) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = ripple.style.height = `${rect.width / 2}px`;

      const rippleBlur = document.createElement('span');
      rippleBlur.className = 'ripple-blur';
      rippleBlur.style.left = `${x}px`;
      rippleBlur.style.top = `${y}px`;
      rippleBlur.style.width = rippleBlur.style.height = `${rect.width / 2}px`;

      card.appendChild(ripple);
      card.appendChild(rippleBlur);

      setTimeout(() => {
        ripple.remove();
        rippleBlur.remove();
      }, 700);
    });
  });

  window.addEventListener('resize', () => {
    updateConfig();
    activate(0);
    setupScroll();
  });

  // --- waves detailed-description ---
  detailedDescription.addEventListener('mousemove', (e) => {
    const rect = detailedDescription.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const radius = 120;

    detailedDescription.querySelectorAll('span').forEach(span => {
      const spanRect = span.getBoundingClientRect();
      const sx = spanRect.left + spanRect.width / 2 - rect.left;
      const sy = spanRect.top + spanRect.height / 2 - rect.top;
      const dist = Math.sqrt((sx - x) ** 2 + (sy - y) ** 2);

      let strength = 1 - Math.min(dist / radius, 1);
      let tx = (sx - x) * 0.35 * strength;
      let ty = (sy - y) * 0.35 * strength;
      let scale = 1 + 0.55 * strength;

      gsap.to(span, {
        x: tx,
        y: ty,
        scale: scale,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });

  detailedDescription.addEventListener('mouseleave', () => {
    detailedDescription.querySelectorAll('span').forEach(span => {
      gsap.to(span, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "elastic.out(1,0.4)"
      });
    });
  });

  // --- Motion years ---
  document.querySelectorAll('.point-year').forEach(wrapTextInSpans);

  document.querySelectorAll('.point-year').forEach(yearEl => {
    yearEl.addEventListener('mousemove', (e) => {
      const rect = yearEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const radius = 60;

      yearEl.querySelectorAll('span').forEach(span => {
        const spanRect = span.getBoundingClientRect();
        const sx = spanRect.left + spanRect.width / 2 - rect.left;
        const sy = spanRect.top + spanRect.height / 2 - rect.top;
        const dist = Math.sqrt((sx - x) ** 2 + (sy - y) ** 2);

        let strength = 1 - Math.min(dist / radius, 1);
        let tx = (sx - x) * 0.45 * strength;
        let ty = (sy - y) * 0.45 * strength;
        let scale = 1 + 0.7 * strength;

        gsap.to(span, {
          x: tx,
          y: ty,
          scale: scale,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    yearEl.addEventListener('mouseleave', () => {
      yearEl.querySelectorAll('span').forEach(span => {
        gsap.to(span, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "elastic.out(1,0.4)"
        });
      });
    });
  });

  // --- Vaves text ---
  cards.forEach(card => {
    const h3 = card.querySelector('h3');
    const p = card.querySelector('p');
    if (h3) wrapTextInSpans(h3);
    if (p) wrapTextInSpans(p);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const radius = 80;

      card.querySelectorAll('span').forEach(span => {
        const spanRect = span.getBoundingClientRect();
        const sx = spanRect.left + spanRect.width / 2 - rect.left;
        const sy = spanRect.top + spanRect.height / 2 - rect.top;
        const dist = Math.sqrt((sx - x) ** 2 + (sy - y) ** 2);

        let strength = 1 - Math.min(dist / radius, 1);
        let tx = (sx - x) * 0.35 * strength;
        let ty = (sy - y) * 0.35 * strength;
        let scale = 1 + 0.55 * strength;

        gsap.to(span, {
          x: tx,
          y: ty,
          scale: scale,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    card.addEventListener('mouseleave', () => {
      card.querySelectorAll('span').forEach(span => {
        gsap.to(span, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "elastic.out(1,0.4)"
        });
      });
    });
  });

  // --- Jump stroke SVG ---
document.querySelectorAll('.point-dot').forEach(dot => {
  let rubberTimeout;
  const svg = dot.querySelector('svg');

  dot.addEventListener('mouseenter', () => {
    gsap.to(svg.querySelectorAll('path'), {
      stroke: "#39FF14",
      duration: 0.2
    });

    // Jump animation
    gsap.timeline()
      .to(dot, {
        y: -18,
        scale: 1.18,
        duration: 0.18,
        ease: "power1.out"
      })
      .to(dot, {
        y: 0,
        scaleX: 1.25,
        scaleY: 0.8,
        duration: 0.13,
        ease: "power1.in"
      })
      .to(dot, {
        y: -10,
        scale: 1.08,
        scaleX: 1,
        scaleY: 1,
        duration: 0.13,
        ease: "power1.out"
      })
      .to(dot, {
        y: 0,
        scaleX: 1.1,
        scaleY: 0.9,
        duration: 0.11,
        ease: "power1.in"
      })
      .to(dot, {
        y: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 0.5,
        ease: "elastic.out(1,0.4)"
      });

    clearTimeout(rubberTimeout);
    rubberTimeout = setTimeout(() => {
      gsap.to(svg.querySelectorAll('path'), {
        stroke: "",
        duration: 0.5
      });
    }, 3000);
  });

  dot.addEventListener('mouseleave', () => {
    clearTimeout(rubberTimeout);
    gsap.to(dot, {
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 0.4,
      ease: "power1.out"
    });
    gsap.to(svg.querySelectorAll('path'), {
      stroke: "",
      duration: 0.3
    });
  });
});
} // End of DOMContentLoaded
);