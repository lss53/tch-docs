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
    // 定义插件的默认参数，当用户没有提供自定义配置时使用
    const defaultConfig = {
      backgroundColor: "#000",        // 按钮的背景颜色
      cornerOffset: 20,             // 按钮距离页面右下角的偏移量 (单位: px)
      ease: progress => 0.5 * (1 - Math.cos(Math.PI * progress)), // 缓动函数，用于创建平滑的滚动动画效果 (先慢后快再慢)
      id: "back-to-top",            // 按钮元素的 HTML id
      innerHTML: '<svg viewBox="0 0 448 512"><path d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6.0-33.9L207 39c9.4-9.4 24.6-9.4 33.9.0l194.3 194.3c9.4 9.4 9.4 24.6.0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3.0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z"></path></svg>', // 按钮内部的 HTML 内容 (一个向上的箭头 SVG 图标)
      scrollDuration: 100,          // 滚动回顶部的动画持续时间 (单位: ms)
      showWhenScrollTopIs: 1,       // 页面向下滚动超过该值后，按钮才会显示 (单位: px)
      size: 56,                     // 按钮的直径 (单位: px)
      textColor: "#fff",            // 按钮内部 SVG 图标的颜色
      zIndex: 1                     // 按钮的 CSS z-index, 用于控制层叠顺序
    };
    
    // 2. --- 配置合并 ---
    // 使用 ES6 的扩展运算符(...)，将用户在 index.html 中提供的配置 (vm.config.backToTop) 与默认配置合并。
    // 用户配置会覆盖同名的默认配置。
    const config = { ...defaultConfig, ...vm.config.backToTop };
    
    /**
     * 节流函数 (Throttle)
     * @param {Function} func - 需要被节流的函数
     * @param {number} limit - 节流的时间间隔 (单位: ms)
     * @returns {Function} 返回一个新的节流后的函数
     * 作用：在指定的时间间隔内，无论事件触发多少次，函数最多只执行一次。
     * 这对于 scroll、resize 等高频触发的事件非常重要，可以极大地提升性能。
     */
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

    // 3. --- DOM 操作与事件绑定 (在 Docsify 准备就绪后执行) ---
    hook.ready(function() {
      // 如果页面上已经存在该按钮，则直接返回，防止重复创建
      if (document.getElementById(config.id)) return;

      // 根据配置计算 SVG 图标的尺寸和外边距
      const svgSize = Math.round(0.5 * config.size);
      const svgMargin = Math.round(0.25 * config.size);
      
      // --- 关键：判断滚动的目标元素 ---
      // 检查 Docsify 挂载的元素是否为默认的 '#app' 或 'body'
      const isBodyContainer = vm.config.el === '#app' || vm.config.el === 'body';
      // 如果是，那么滚动事件的监听目标是 window，而实际滚动的元素是 document.documentElement (<html> 标签)
      // 否则，监听和滚动的目标都是用户自定义的挂载元素
      const scrollTarget = isBodyContainer ? window : document.querySelector(vm.config.el);
      const scrollContainer = isBodyContainer ? document.documentElement : scrollTarget;

      // 动态生成 CSS 样式
      const css = `
          #${config.id}{background:${config.backgroundColor};border-radius:50%;bottom:${config.cornerOffset}px;box-shadow:0 2px 5px 0 rgba(0,0,0,.26);color:${config.textColor};cursor:pointer;display:block;height:${config.size}px;opacity:1;outline:0;position:fixed;right:${config.cornerOffset}px;transition:bottom .2s,opacity .2s;user-select:none;width:${config.size}px;z-index:${config.zIndex}}
          #${config.id}:hover svg{opacity:.6}
          #${config.id} svg{display:block;fill:currentColor;height:${svgSize}px;margin:${svgMargin}px auto 0;width:${svgSize}px}
          #${config.id}.hidden{bottom:-${config.size}px;opacity:0}
      `;

      // 创建 <style> 标签并将 CSS 注入到 <head> 中
      const style = document.createElement("style");
      style.appendChild(document.createTextNode(css));
      document.head.insertAdjacentElement("afterbegin", style);

      // 创建按钮的 <div> 元素
      const button = document.createElement("div");
      button.id = config.id;
      button.className = "hidden"; // 初始状态为隐藏
      button.innerHTML = config.innerHTML;
      document.body.appendChild(button); // 将按钮添加到页面的 body 中

      // 为按钮绑定点击事件，点击时执行滚动到顶部的函数
      button.addEventListener("click", e => {
        e.preventDefault(); // 阻止默认行为
        scrollToTop();
      });

      // --- 核心功能函数 ---

      // 处理滚动事件的函数
      function handleScroll() {
        const scrollTop = scrollContainer.scrollTop; // 获取当前滚动条的位置
        // 根据滚动位置和配置，切换 'hidden' 类来控制按钮的显示和隐藏
        button.classList.toggle('hidden', scrollTop < config.showWhenScrollTopIs);
      }

      // 平滑滚动到顶部的函数
      function scrollToTop() {
        const currentPosition = scrollContainer.scrollTop; // 获取当前位置
        // 如果动画时长为0或浏览器不支持 performance API，则直接跳到顶部
        if (config.scrollDuration <= 0 || typeof performance === 'undefined') {
          scrollContainer.scrollTop = 0;
          return;
        }
        const startTime = performance.now(); // 记录动画开始时间
        
        // 定义动画的每一帧
        function animateScroll(currentTime) {
          const elapsedTime = currentTime - startTime; // 计算已过时间
          const progress = Math.min(elapsedTime / config.scrollDuration, 1); // 计算动画进度 (0 到 1)
          const easeProgress = config.ease(progress); // 应用缓动函数，使动画更自然
          
          // 根据进度计算当前应该滚动到的位置
          scrollContainer.scrollTop = currentPosition - (easeProgress * currentPosition);
          
          // 如果动画还没结束，请求下一帧
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        }
        // 启动动画
        requestAnimationFrame(animateScroll);
      }
      
      // 监听滚动事件，并使用节流函数进行性能优化
      // { passive: true } 告诉浏览器，这个监听器不会调用 preventDefault()，从而进一步优化滚动性能
      scrollTarget.addEventListener("scroll", throttle(handleScroll, 150), { passive: true });
      
      // 页面加载完成后，立即执行一次 handleScroll，以确定按钮的初始显示状态
      handleScroll();
    });
  }

  // 4. --- 插件注册 ---
  // 检查 window.$docsify 是否存在，如果存在，则将本插件的 install 函数添加到插件数组中
  // 这种写法可以确保插件安全地注册，并且不会覆盖掉其他已注册的插件
  if (window.$docsify) {
    window.$docsify.plugins = [].concat(install, window.$docsify.plugins || []);
  }
})();