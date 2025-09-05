(function() {
  'use strict';

  const install = function(hook, vm) {
    // --- 1. 配置管理 (保持不变) ---
    const defaultConfig = {
      defaultTheme: "light"
    };
    const userConfig = vm.config.theme || {};
    const config = { ...defaultConfig, ...userConfig };

    // --- 2. 状态与核心函数 (保持不变) ---
    let currentTheme;

    const setTheme = (theme) => {
      try {
        currentTheme = theme;
        localStorage.setItem("THEME", theme);
        document.body.setAttribute('data-theme', theme);
      } catch (error) {
        console.error('Error setting theme:', error);
      }
    };
    
    const initTheme = () => {
      try {
        const savedTheme = localStorage.getItem("THEME");
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = savedTheme || (systemPrefersDark ? "dark" : config.defaultTheme);
        setTheme(initialTheme);
      } catch (error) {
        console.error('Error initializing theme:', error);
        setTheme(config.defaultTheme);
      }
    };
    
    // --- 3. Docsify 钩子函数 (核心修改) ---

    // 在 Docsify 初始化完成后，立即设置初始主题
    hook.init(initTheme);

    // 【修改】: 只在 doneEach 中处理主题切换按钮的事件监听
    let eventListenerAttached = false;
    hook.doneEach(function() {
      if (eventListenerAttached) {
        return;
      }

      // 获取页面上的静态主题切换按钮
      const themeToggle = document.querySelector('#theme-toggle');

      if (!themeToggle) {
        return;
      }
      
      // -- 只负责主题切换按钮的事件监听 --
      themeToggle.addEventListener('click', () => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
      });
      
      // 设置标志位，防止重复绑定
      eventListenerAttached = true;
    });
  };
  
  // 安全地将插件注册到 Docsify
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(install);
})();