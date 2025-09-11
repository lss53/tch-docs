// 使用IIFE（立即调用函数表达式）包裹插件代码，形成一个独立的作用域，避免污染全局变量。
(function() {
  'use strict'; // 启用 JavaScript 的严格模式，这是一种更安全、更规范的编码实践。

  /**
   * Docsify 插件的安装函数
   * @param {object} hook - Docsify 提供的钩子对象，用于在特定生命周期执行代码。
   * @param {object} vm - Docsify 的视图模型实例，可以访问到所有配置。
   */
  function install(hook, vm) {
    // --- 1. 配置合并 ---
    // 定义插件的默认配置
    const defaultConfig = {
      defaultTheme: "light" // 默认主题设置为亮色
    };
    // 从 vm.config 中获取用户在 index.html 中定义的 theme 配置
    const userConfig = vm.config.theme || {};
    // 使用 ES6 扩展运算符将用户配置与默认配置合并，用户配置会覆盖同名默认配置
    const config = { ...defaultConfig, ...userConfig };
    
    // 用于存储当前主题状态的变量
    let currentTheme;

    // --- 2. 核心功能函数 ---

    /**
     * 设置和应用主题的函数
     * @param {string} theme - 要应用的主题名称 ('light' 或 'dark')
     */
    const setTheme = (theme) => {
      try {
        // 更新当前主题状态变量
        currentTheme = theme;
        // 将主题偏好保存到浏览器的 localStorage 中，以便下次访问时记住用户的选择
        localStorage.setItem("THEME", theme);
        // 在 <body> 元素上设置 `data-theme` 属性，CSS 可以通过这个属性选择器来应用不同的样式

        // 根据主题，添加或移除 'dark' class
        if (theme === 'dark') {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }

        // --- 可访问性 (Accessibility) 增强 ---
        // 动态更新切换按钮的 aria-label 属性，为使用屏幕阅读器的用户提供清晰的上下文信息
        const themeToggle = document.querySelector('#theme-toggle');
        if (themeToggle) {
          themeToggle.setAttribute('aria-label', 
            // 根据当前主题，提供不同的提示文本
            theme === 'light' ? '切换到暗色主题 (Switch to dark theme)' : '切换到亮色主题 (Switch to light theme)');
        }
      } catch (error) {
        // 捕获并打印在设置主题过程中可能发生的错误（例如 localStorage 不可用）
        console.error('设置主题时出错:', error);
      }
    };
    
    /**
     * 初始化主题的函数
     * 决定页面首次加载时应该显示哪个主题
     */
    const initTheme = () => {
      try {
        // --- 主题决策逻辑 (优先级从高到低) ---
        // 1. 从 localStorage 读取用户上次保存的主题
        const savedTheme = localStorage.getItem("THEME");
        // 2. 检测用户操作系统的颜色偏好设置 (例如 Windows/macOS 的暗色模式)
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        // 3. 确定最终的初始主题：
        //    - 如果有保存过的主题，则使用它。
        //    - 否则，如果系统偏好暗色，则使用 'dark'。
        //    - 否则，使用插件的默认主题 (通常是 'light')。
        const initialTheme = savedTheme || (systemPrefersDark ? "dark" : config.defaultTheme);
        // 应用计算出的初始主题
        setTheme(initialTheme);
      } catch (error) {
        // 如果在初始化过程中发生任何错误
        console.error('初始化主题时出错:', error);
        // 则安全地回退到默认主题，确保页面总能正常显示
        setTheme(config.defaultTheme); 
      }
    };
    
    // --- 3. 挂载到 Docsify 生命周期 ---

    // `init` 钩子：在 Docsify 初始化最开始时执行，只执行一次。
    // 这是设置初始主题的最佳时机，因为它能在页面内容渲染之前完成，从而避免页面主题“闪烁”（从一个主题快速变为另一个）。
    hook.init(initTheme);

    // `ready` 钩子：在 Docsify 初始化完成、DOM 元素全部可用后执行，只执行一次。
    // 这是绑定事件监听器的最安全、最高效的时机。
    hook.ready(function() {
      // 查找主题切换按钮
      const themeToggle = document.querySelector('#theme-toggle');
      if (!themeToggle) {
        // 如果在页面上找不到按钮，则直接返回，不做任何操作
        return;
      }
      
      // 为按钮绑定点击事件
      themeToggle.addEventListener('click', () => {
        // 计算新主题：如果当前是 'light'，则切换到 'dark'，反之亦然
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        // 应用新主题
        setTheme(newTheme);
      });
    });
  }
  
  // --- 4. 插件注册 ---
  // 检查 window.$docsify 是否存在，以确保在 Docsify 环境下运行
  if (window.$docsify) {
    // 安全地将本插件的 install 函数添加到 Docsify 的插件数组中。
    // 使用 [].concat 的方式可以确保不会覆盖掉其他已注册的插件。
    window.$docsify.plugins = [].concat(install, window.$docsify.plugins || []);
  }
})();