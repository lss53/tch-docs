/**
 * Docsify MathJax Plugin
 *
 * @param {object} hook Docsify hook object.
 * @param {object} vm Docsify vm object.
 */
(function() {
  'use strict';

  function DocsifyMathJax(hook, vm) {
    const defaultConfig = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        tags: 'ams',
        formatError: (jax, err) => {
          const errorNode = jax.formatError(err);
          errorNode.className = 'math-error';
          errorNode.style.fontSize = '0.9em';
          return errorNode;
        }
      },
      svg: {
        fontCache: 'global',
        scale: 0.9,
        minScale: 0.5
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoreHtmlClass: 'tex-ignore'
      },
      startup: {
        pageReady: () => {
          return MathJax.startup.defaultPageReady().then(() => {
            if (vm.config.debug) {
              console.log('MathJax初始化完成，准备渲染公式');
            }
          });
        }
      }
    };

    const userConfig = vm.config.mathjax || {};
    const finalConfig = { ...defaultConfig, ...userConfig };
    finalConfig.tex = { ...defaultConfig.tex, ...(userConfig.tex || {}) };
    finalConfig.svg = { ...defaultConfig.svg, ...(userConfig.svg || {}) };
    finalConfig.options = { ...defaultConfig.options, ...(userConfig.options || {}) };

    function isMathJaxLoaded() {
      return typeof window.MathJax?.typesetPromise === 'function';
    }

    function loadMathJaxScript() {
      return new Promise((resolve, reject) => {
        const scriptId = 'MathJax-script';
        if (document.getElementById(scriptId)) {
          const checkInterval = setInterval(() => {
            if (isMathJaxLoaded()) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('MathJax脚本加载失败'));
        document.head.appendChild(script);
      });
    }

    function injectStyles() {
      const styleId = 'mathjax-styles';
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        mjx-container[display="true"] { display: block; overflow-x: auto; overflow-y: hidden; margin: 1.5rem 0; padding: 0.5rem 0.2rem; }
        mjx-container { max-width: 100%; line-height: 1.5; }
        .markdown-section { overflow-wrap: break-word; }
        .math-error { color: #e74c3c; background: #fdf2f2; padding: 0.5em 0.8em; margin: 0.5em 0; border-radius: 4px; border-left: 3px solid #e74c3c; }
        @media print { mjx-container[display="true"] { overflow: visible; page-break-inside: avoid; } }
      `;
      document.head.appendChild(style);
    }

    hook.init(function() {
      window.MathJax = finalConfig;
      injectStyles();
    });

    hook.mounted(function() {
      loadMathJaxScript()
        .then(() => {
          if (vm.config.debug) {
            console.log('MathJax加载成功');
          }
        })
        .catch(error => {
          console.error('MathJax加载失败:', error.message);
          // 如果MathJax加载失败，将公式用特殊样式包裹，避免暴露源码
          document.querySelectorAll('.markdown-section').forEach(section => {
            section.innerHTML = section.innerHTML.replace(
              /\$(.*?)\$/g, 
              '<span class="math-fallback">$1</span>'
            );
          });
        });
    });

    hook.doneEach(function() {
      if (isMathJaxLoaded()) {
        window.MathJax.typesetPromise().catch(error => {
          console.error('公式渲染错误:', error);
        });
      }
    });
  }

  if (window.$docsify) {
    window.$docsify.plugins = [].concat(window.$docsify.plugins || [], DocsifyMathJax);
  }
})();