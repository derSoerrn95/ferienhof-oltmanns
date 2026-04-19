/* Ferienhof Oltmanns — minimal progressive enhancement */

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ---------- Mobile nav toggle ----------
  const toggle = $('[data-nav-toggle]');
  const nav = $('[data-nav]');

  if (toggle && nav) {
    const closeNav = () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    const openNav = () => {
      toggle.setAttribute('aria-expanded', 'true');
      nav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    // Close on link click (mobile)
    $$('a', nav).forEach(link => {
      link.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 899px)').matches) closeNav();
      });
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 900px)').matches) closeNav();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });
  }

  // ---------- Header scroll state ----------
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 16);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Reveal on scroll ----------
  const revealEls = $$('.section-title, .section-lede, .apt-card, .loc-card, .included, .farm__list, .intro__text');
  revealEls.forEach(el => el.setAttribute('data-reveal', ''));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (i % 4) * 60 + 'ms';
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ---------- VersaTiles map (lazy, IntersectionObserver) ----------
  const mapEl = $('[data-map]');

  if (mapEl) {
    const lat  = parseFloat(mapEl.dataset.lat);
    const lng  = parseFloat(mapEl.dataset.lng);
    const zoom = parseFloat(mapEl.dataset.zoom) || 11;

    let initialized = false;

    const waitForLibs = () => new Promise((resolve) => {
      const tick = () => {
        if (window.maplibregl && window.VersaTilesStyle) {
          resolve();
        } else {
          setTimeout(tick, 60);
        }
      };
      tick();
    });

    const initMap = async () => {
      if (initialized) return;
      initialized = true;

      try {
        await waitForLibs();

        // Build a VersaTiles "graybeard" style — neutral greyscale,
        // lets our terracotta marker sing. German labels.
        const style = VersaTilesStyle.graybeard({
          language: 'de',
          // subtle warm tint that harmonises with the site palette
          recolor: {
            gamma: 0.95,
            saturate: -0.15,
          },
        });

        const map = new maplibregl.Map({
          container: mapEl,
          style,
          center: [lng, lat],
          zoom,
          minZoom: 6,
          maxZoom: 17,
          attributionControl: { compact: true },
          cooperativeGestures: true, // mobile: two-finger pan, one-finger scroll page
        });

        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }),
          'top-right'
        );

        map.on('load', () => {
          // Custom marker element (terracotta dot + pulse)
          const el = document.createElement('div');
          el.className = 'map-marker';
          el.innerHTML = `
            <span class="map-marker__pulse" aria-hidden="true"></span>
            <span class="map-marker__dot" aria-hidden="true"></span>
          `;

          const popup = new maplibregl.Popup({
            offset: 22,
            closeButton: true,
            maxWidth: '260px',
          }).setHTML(`
            <p class="map-popup__title">Ferienhof Oltmanns</p>
            <p class="map-popup__text">Am nördlichen Stadtrand von Esens — zwischen Wiesen und Deich.</p>
          `);

          new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);
        });

        map.on('error', (e) => {
          // Network issues etc. — fail quietly, leave the container empty
          console.warn('Map error:', e && e.error);
        });

      } catch (err) {
        console.warn('Failed to initialise map:', err);
      }
    };

    // Only initialise when the map scrolls into view (saves bandwidth on mobile)
    if ('IntersectionObserver' in window) {
      const mio = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            initMap();
            mio.disconnect();
          }
        });
      }, { rootMargin: '200px 0px' });
      mio.observe(mapEl);
    } else {
      initMap();
    }
  }

})();
