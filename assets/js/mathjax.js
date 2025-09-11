/**
 * Docsify MathJax 插件
 * 这是一个用于在 Docsify 中启用和渲染 MathJax 公式的前端插件。
 *
 * @param {object} hook Docsify 提供的钩子对象，用于将自定义函数注入到 Docsify 的生命周期中。
 * @param {object} vm Docsify 的视图模型实例 (Vue Model)，可以从中访问到配置等信息。
 */
(function() {
  'use strict'; // 启用 JavaScript 的严格模式，有助于捕获常见错误

  // 定义插件的安装函数
  function DocsifyMathJax(hook, vm) {
    // 1. --- 默认配置 ---
    // 定义插件的默认参数。当用户未在 index.html 中提供自定义配置时，将使用这些值。
    const defaultConfig = {
      // TeX 输入处理器的配置
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],   // 定义行内公式的分隔符
        displayMath: [['$$', '$$'], ['\\[', '\\]']], // 定义块级公式的分隔符
        tags: 'ams',                               // 使用 AMS 风格的公式编号
        // 自定义错误信息的格式化函数
        formatError: (jax, err) => {
          const errorNode = jax.formatError(err);
          errorNode.className = 'math-error'; // 为错误信息添加自定义CSS类
          errorNode.style.fontSize = '0.9em'; // 设置错误信息的字体大小
          return errorNode;
        }
      },
      // SVG 输出处理器的配置
      svg: {
        fontCache: 'global', // 'global' 表示在页面间共享字体缓存，提高性能
        scale: 0.9,          // 公式相对于周围文本的缩放比例
        minScale: 0.5        // 最小缩放比例，防止公式变得过小
      },
      // MathJax 的通用选项
      options: {
        // 跳过处理以下 HTML 标签内的内容，防止 MathJax 错误地渲染代码块中的公式
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        // 忽略带有此 CSS 类的 HTML 元素
        ignoreHtmlClass: 'tex-ignore'
      },
      // MathJax 启动配置
      startup: {
        // 在页面准备就绪时执行的函数
        pageReady: () => {
          // 调用 MathJax 默认的 pageReady 流程
          return MathJax.startup.defaultPageReady().then(() => {
            // 如果用户开启了 debug 模式，则在控制台打印日志
            if (vm.config.debug) {
              console.log('MathJax初始化完成，准备渲染公式');
            }
          });
        }
      }
    };

    // 2. --- 配置合并 ---
    // 从 vm.config 中获取用户在 index.html 里定义的 mathjax 配置
    const userConfig = vm.config.mathjax || {};
    // 将默认配置和用户配置进行浅合并
    const finalConfig = { ...defaultConfig, ...userConfig };
    // 对嵌套的配置对象进行深度合并，确保用户的子配置能覆盖默认的子配置，而不是替换整个对象
    finalConfig.tex = { ...defaultConfig.tex, ...(userConfig.tex || {}) };
    finalConfig.svg = { ...defaultConfig.svg, ...(userConfig.svg || {}) };
    finalConfig.options = { ...defaultConfig.options, ...(userConfig.options || {}) };

    // 3. --- 辅助函数 ---

    /**
     * 检查 MathJax 核心脚本是否已加载并准备就绪
     * @returns {boolean} 如果 MathJax 可用则返回 true，否则返回 false
     */
    function isMathJaxLoaded() {
      // 通过检查 window.MathJax 对象上是否存在关键的 typesetPromise 方法来判断
      return typeof window.MathJax?.typesetPromise === 'function';
    }

    /**
     * 异步加载 MathJax 3 的核心脚本文件
     * @returns {Promise<void>} 返回一个在脚本加载成功后 resolve 的 Promise
     */
    function loadMathJaxScript() {
      return new Promise((resolve, reject) => {
        const scriptId = 'MathJax-script';
        // 如果脚本标签已经存在于页面上
        if (document.getElementById(scriptId)) {
          // 则不需要重复加载，但需要轮询检查 MathJax 是否已初始化完毕
          const checkInterval = setInterval(() => {
            if (isMathJaxLoaded()) {
              clearInterval(checkInterval);
              resolve(); // 初始化完成，Promise 成功
            }
          }, 100);
          return;
        }

        // 如果脚本不存在，则创建 <script> 标签
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'; // MathJax 3 CDN 地址
        script.async = true; // 异步加载，不阻塞页面渲染
        script.onload = resolve; // 加载成功时，resolve Promise
        script.onerror = () => reject(new Error('MathJax脚本加载失败')); // 加载失败时，reject Promise
        document.head.appendChild(script); // 将脚本添加到 head 中
      });
    }

    /**
     * 向页面注入自定义的 CSS 样式，用于美化公式显示和错误提示
     */
    function injectStyles() {
      const styleId = 'mathjax-styles';
      if (document.getElementById(styleId)) return; // 如果样式已存在，则不重复注入
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* 块级公式容器样式，允许水平滚动以显示过长的公式 */
        mjx-container[display="true"] { display: block; overflow-x: auto; overflow-y: hidden; margin: 1.5rem 0; padding: 0.5rem 0.2rem; }
        /* 通用公式容器样式 */
        mjx-container { max-width: 100%; line-height: 1.5; }
        /* 防止 Markdown 内容区域的超长单词/链接溢出 */
        .markdown-section { overflow-wrap: break-word; }
        /* 数学公式渲染错误时的提示样式 */
        .math-error { color: #e74c3c; background: #fdf2f2; padding: 0.5em 0.8em; margin: 0.5em 0; border-radius: 4px; border-left: 3px solid #e74c3c; }
        /* 打印样式，确保块级公式在打印时不会被截断 */
        @media print { mjx-container[display="true"] { overflow: visible; page-break-inside: avoid; } }
      `;
      document.head.appendChild(style);
    }

    // 4. --- Docsify 生命周期钩子 ---

    // `init` 钩子：在 Docsify 初始化最开始时执行，只执行一次。
    // 非常适合用来设置全局配置和注入样式。
    hook.init(function() {
      // 将最终合并好的配置赋值给全局的 window.MathJax 对象，MathJax 脚本加载时会自动读取这个配置
      window.MathJax = finalConfig;
      // 注入自定义样式
      injectStyles();
    });

    // `mounted` 钩子：在 Docsify 初始化完成后执行，只执行一次。
    // 这是开始加载外部脚本的最佳时机。
    hook.mounted(function() {
      loadMathJaxScript()
        .then(() => {
          // 脚本加载成功后的回调
          if (vm.config.debug) {
            console.log('MathJax加载成功');
          }
        })
        .catch(error => {
          // 脚本加载失败后的错误处理
          console.error('MathJax加载失败:', error.message);
          // 降级处理：如果 MathJax 失败，将页面中的公式源码用特殊样式包裹，
          // 避免直接暴露 TeX 源码，提高可读性。
          document.querySelectorAll('.markdown-section').forEach(section => {
            section.innerHTML = section.innerHTML.replace(
              /\$(.*?)\$/g, 
              '<span class="math-fallback">$1</span>'
            );
          });
        });
    });

    // `doneEach` 钩子：在每次路由切换、页面内容渲染完成后执行。
    // 这是执行公式渲染的核心钩子。
    hook.doneEach(function() {
      // 确保 MathJax 已经加载完毕
      if (isMathJaxLoaded()) {
        // 调用 MathJax 的 typesetPromise 方法来异步渲染当前页面上的所有数学公式
        window.MathJax.typesetPromise().catch(error => {
          // 捕获并打印单个公式的渲染错误（例如，语法错误）
          console.error('公式渲染错误:', error);
        });
      }
    });
  }

  // 5. --- 插件注册 ---
  // 检查 window.$docsify 是否存在，以确保在 Docsify 环境下运行
  if (window.$docsify) {
    // 将本插件的安装函数添加到 Docsify 的插件数组中
    // 使用 [].concat 的方式可以安全地添加，避免覆盖其他已存在的插件
    window.$docsify.plugins = [].concat(window.$docsify.plugins || [], DocsifyMathJax);
  }
})();