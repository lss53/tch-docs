// 使用IIFE（立即调用函数表达式）包裹插件代码，避免污染全局作用域
(function() {
  'use strict'; // 启用 JavaScript 的严格模式，有助于编写更安全、更规范的代码

  /**
   * Docsify 插件的安装函数
   * @param {object} hook - Docsify 提供的钩子对象，用于在特定时间点执行代码
   * @param {object} vm - Docsify 的视图模型实例，可以访问到配置等信息
   */
  function install(hook, vm) {
    // 1. --- 默认配置 ---
    const defaultConfig = {
      backgroundColor: "#000",
      cornerOffset: 20,
      ease: progress => 0.5 * (1 - Math.cos(Math.PI * progress)),
      id: "back-to-top",
      innerHTML: '<svg viewBox="0 0 448 512"><path d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6.0-33.9L207 39c9.4-9.4 24.6-9.4 33.9.0l194.3 194.3c9.4 9.4 9.4 24.6.0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3.0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z"></path></svg>',
      scrollDuration: 800,
      showWhenScrollTopIs: 100,
      size: 56,
      textColor: "#fff",
      zIndex: 1000,
      responsive: {
        small: { size: 40, cornerOffset: 10 },
        medium: { size: 48, cornerOffset: 15 }
      },
      ariaLabel: {
        en: 'Back to top',
        zh: '返回顶部',
        ja: 'トップに戻る',
        ko: '맨 위로'
      }
    };
    
    // 2. --- 配置合并与验证 ---
    const config = { ...defaultConfig, ...vm.config.backToTop };
    
    function validateConfig(config) {
      const errors = [];
      if (typeof config.scrollDuration !== 'number' || config.scrollDuration < 0) {
        errors.push("scrollDuration must be a positive number");
        config.scrollDuration = defaultConfig.scrollDuration;
      }
      if (typeof config.size !== 'number' || config.size < 10) {
        errors.push("size must be at least 10px");
        config.size = defaultConfig.size;
      }
      if (typeof config.zIndex !== 'number' || config.zIndex < 0) {
        errors.push("zIndex must be a positive number");
        config.zIndex = defaultConfig.zIndex;
      }
      if (errors.length > 0) {
        console.warn("BackToTop plugin configuration errors:", errors);
      }
    }
    
    validateConfig(config);
    
    function throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }

    // 3. --- DOM 操作与事件绑定 ---
    hook.ready(function() {
      if (document.getElementById(config.id)) return;

      const isBodyContainer = !vm.config.el || vm.config.el === '#app' || vm.config.el === 'body' || document.querySelector(vm.config.el) === document.body;
      const scrollTarget = isBodyContainer ? window : document.querySelector(vm.config.el);
      const scrollContainer = isBodyContainer ? document.documentElement : scrollTarget;

      let animationFrameId = null;
      const eventListeners = [];

      // CSS (omitted for brevity, same as before)
      const css = `
          #${config.id} {
            background: ${config.backgroundColor}; border-radius: 50%; bottom: ${config.cornerOffset}px;
            box-shadow: 0 2px 5px 0 rgba(0,0,0,.26); color: ${config.textColor}; cursor: pointer;
            display: block; height: ${config.size}px; opacity: 1; outline: 0; position: fixed;
            right: ${config.cornerOffset}px; user-select: none; width: ${config.size}px;
            z-index: ${config.zIndex}; visibility: visible; transform: translateY(0);
            transition: transform 0.3s ease-out, opacity 0.4s ease-out; will-change: transform, opacity;
          }
          #${config.id}:hover svg { opacity: .7; }
          #${config.id} svg {
            display: block; fill: currentColor; height: ${Math.round(0.5 * config.size)}px;
            margin: ${Math.round(0.25 * config.size)}px auto 0; width: ${Math.round(0.5 * config.size)}px;
          }
          #${config.id}.hidden {
            opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(20px);
          }
          @media (max-width: 768px) {
            #${config.id} {
              width: ${config.responsive.small.size}px; height: ${config.responsive.small.size}px;
              bottom: ${config.responsive.small.cornerOffset}px; right: ${config.responsive.small.cornerOffset}px;
            }
            #${config.id} svg {
              height: ${Math.round(0.5 * config.responsive.small.size)}px;
              margin: ${Math.round(0.25 * config.responsive.small.size)}px auto 0;
            }
          }
          @media (min-width: 769px) and (max-width: 1024px) {
            #${config.id} {
              width: ${config.responsive.medium.size}px; height: ${config.responsive.medium.size}px;
              bottom: ${config.responsive.medium.cornerOffset}px; right: ${config.responsive.medium.cornerOffset}px;
            }
            #${config.id} svg {
              height: ${Math.round(0.5 * config.responsive.medium.size)}px;
              margin: ${Math.round(0.25 * config.responsive.medium.size)}px auto 0;
            }
          }`;

      const style = document.createElement("style");
      style.textContent = css;
      document.head.insertAdjacentElement("afterbegin", style);

      const button = document.createElement("div");
      button.id = config.id;
      button.className = "hidden";
      button.innerHTML = config.innerHTML;
      
      function setAriaLabel() {
        const lang = document.documentElement.lang || 'en';
        const label = config.ariaLabel[lang.split('-')[0]] || config.ariaLabel.en;
        button.setAttribute('aria-label', label);
      }
      
      button.setAttribute('role', 'button');
      setAriaLabel();
      
      const observer = new MutationObserver(setAriaLabel);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
      
      document.body.appendChild(button);

      function handleButtonClick(e) {
        e.preventDefault();
        scrollToTop();
      }
      button.addEventListener("click", handleButtonClick);
      eventListeners.push({ element: button, type: 'click', handler: handleButtonClick });

      function handleScroll() {
        button.classList.toggle('hidden', scrollContainer.scrollTop < config.showWhenScrollTopIs);
      }

      function scrollToTop() {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        
        button.style.pointerEvents = 'none';
        
        const currentPosition = scrollContainer.scrollTop;
        const targetPosition = 0;
        
        if (currentPosition <= targetPosition || config.scrollDuration <= 0) {
          scrollContainer.scrollTop = targetPosition;
          button.style.pointerEvents = 'auto';
          return;
        }
        
        const startTime = performance.now();
        const distance = currentPosition - targetPosition;
        
        function animateScroll(currentTime) {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / config.scrollDuration, 1);
          const easeProgress = config.ease(progress);
          
          scrollContainer.scrollTop = currentPosition - (easeProgress * distance);
          
          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animateScroll);
          } else {
            animationFrameId = null;
            button.style.pointerEvents = 'auto';
            // --- THIS IS THE FIX ---
            handleScroll(); 
          }
        }
        
        animationFrameId = requestAnimationFrame(animateScroll);
      }
      
      function immediateCancelAnimation() {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
          button.style.pointerEvents = 'auto';
        }
      }
      
      const wheelHandler = immediateCancelAnimation;
      const touchHandler = immediateCancelAnimation;
      scrollTarget.addEventListener("wheel", wheelHandler, { passive: true });
      scrollTarget.addEventListener("touchmove", touchHandler, { passive: true });
      
      const scrollHandler = throttle(handleScroll, 150);
      scrollTarget.addEventListener("scroll", scrollHandler, { passive: true });
      
      function handleResize() { /* ... resize logic ... */ }
      const resizeHandler = throttle(handleResize, 250);
      window.addEventListener('resize', resizeHandler);

      eventListeners.push(
        { element: scrollTarget, type: 'wheel', handler: wheelHandler },
        { element: scrollTarget, type: 'touchmove', handler: touchHandler },
        { element: scrollTarget, type: 'scroll', handler: scrollHandler },
        { element: window, type: 'resize', handler: resizeHandler }
      );
      
      handleScroll();
      handleResize();
      
      function destroy() { /* ... destroy logic ... */ }

      vm.backToTop = vm.backToTop || {};
      vm.backToTop.destroy = destroy;
    });
  }

  // 4. --- 插件注册 ---
  if (window.$docsify) {
    window.$docsify.plugins = [].concat(install, window.$docsify.plugins || []);
  }
})();