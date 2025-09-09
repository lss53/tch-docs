(function() {
  'use strict';

  function install(hook, vm) {
    const defaultConfig = {
      backgroundColor: "#000",
      cornerOffset: 20,
      ease: progress => 0.5 * (1 - Math.cos(Math.PI * progress)),
      id: "back-to-top",
      innerHTML: '<svg viewBox="0 0 448 512"><path d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6.0-33.9L207 39c9.4-9.4 24.6-9.4 33.9.0l194.3 194.3c9.4 9.4 9.4 24.6.0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3.0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z"></path></svg>',
      scrollDuration: 100,
      showWhenScrollTopIs: 1,
      size: 56,
      textColor: "#fff",
      zIndex: 1
    };
    
    const config = { ...defaultConfig, ...vm.config.backToTop };
    
    function throttle(func, limit) {
      let inThrottle;
      return function() {
        if (!inThrottle) {
          func.apply(this, arguments);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }

    hook.ready(function() {
      if (document.getElementById(config.id)) return;

      const svgSize = Math.round(0.5 * config.size);
      const svgMargin = Math.round(0.25 * config.size);
      const isBodyContainer = vm.config.el === '#app' || vm.config.el === 'body';
      const scrollTarget = isBodyContainer ? window : document.querySelector(vm.config.el);
      const scrollContainer = isBodyContainer ? document.documentElement : scrollTarget;

      const css = `
          #${config.id}{background:${config.backgroundColor};border-radius:50%;bottom:${config.cornerOffset}px;box-shadow:0 2px 5px 0 rgba(0,0,0,.26);color:${config.textColor};cursor:pointer;display:block;height:${config.size}px;opacity:1;outline:0;position:fixed;right:${config.cornerOffset}px;transition:bottom .2s,opacity .2s;user-select:none;width:${config.size}px;z-index:${config.zIndex}}
          #${config.id}:hover svg{opacity:.6}
          #${config.id} svg{display:block;fill:currentColor;height:${svgSize}px;margin:${svgMargin}px auto 0;width:${svgSize}px}
          #${config.id}.hidden{bottom:-${config.size}px;opacity:0}
      `;

      const style = document.createElement("style");
      style.appendChild(document.createTextNode(css));
      document.head.insertAdjacentElement("afterbegin", style);

      const button = document.createElement("div");
      button.id = config.id;
      button.className = "hidden";
      button.innerHTML = config.innerHTML;
      document.body.appendChild(button);

      button.addEventListener("click", e => { e.preventDefault(); scrollToTop(); });

      function handleScroll() {
        const scrollTop = scrollContainer.scrollTop;
        button.classList.toggle('hidden', scrollTop < config.showWhenScrollTopIs);
      }

      function scrollToTop() {
        const currentPosition = scrollContainer.scrollTop;
        if (config.scrollDuration <= 0 || typeof performance === 'undefined') {
          scrollContainer.scrollTop = 0;
          return;
        }
        const startTime = performance.now();
        
        function animateScroll(currentTime) {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / config.scrollDuration, 1);
          const easeProgress = config.ease(progress);
          scrollContainer.scrollTop = currentPosition - (easeProgress * currentPosition);
          if (progress < 1) requestAnimationFrame(animateScroll);
        }
        requestAnimationFrame(animateScroll);
      }
      
      scrollTarget.addEventListener("scroll", throttle(handleScroll, 150), { passive: true });
      handleScroll();
    });
  }

  if (window.$docsify) {
    window.$docsify.plugins = [].concat(install, window.$docsify.plugins || []);
  }
})();