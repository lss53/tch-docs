(function() {
  'use strict';

  function install(hook, vm) {
    const defaultConfig = {
      defaultTheme: "light"
    };
    const userConfig = vm.config.theme || {};
    const config = { ...defaultConfig, ...userConfig };
    
    let currentTheme;

    const setTheme = (theme) => {
      try {
        currentTheme = theme;
        localStorage.setItem("THEME", theme);
        document.body.setAttribute('data-theme', theme);
        
        // 动态更新按钮的 ARIA 标签，为屏幕阅读器提供上下文
        const themeToggle = document.querySelector('#theme-toggle');
        if (themeToggle) {
          themeToggle.setAttribute('aria-label', 
            theme === 'light' ? '切换到暗色主题 (Switch to dark theme)' : '切换到亮色主题 (Switch to light theme)');
        }
      } catch (error) {
        console.error('设置主题时出错:', error);
      }
    };
    
    const initTheme = () => {
      try {
        const savedTheme = localStorage.getItem("THEME");
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = savedTheme || (systemPrefersDark ? "dark" : config.defaultTheme);
        setTheme(initialTheme);
      } catch (error)
      {
        console.error('初始化主题时出错:', error);
        setTheme(config.defaultTheme); // 出现错误时回退到默认主题
      }
    };
    
    // 在 Docsify 初始化时立即设置主题，避免闪烁
    hook.init(initTheme);

    // Docsify 初始化完成后，绑定一次性的事件监听器，效率更高
    hook.ready(function() {
      const themeToggle = document.querySelector('#theme-toggle');
      if (!themeToggle) {
        return;
      }
      
      themeToggle.addEventListener('click', () => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
      });
    });
  }
  
  // 安全地将插件注册到 Docsify
  if (window.$docsify) {
    window.$docsify.plugins = [].concat(install, window.$docsify.plugins || []);
  }
})();