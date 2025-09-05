// 安全的插件注册方式
(function() {
  'use strict';
  
  const install = function(hook, vm) {
    // CSS注入函数
    function injectCSS(css, options) {
      if (!css || "undefined" == typeof document) return;
      
      const { insertAt } = options || {};
      const head = document.head || document.getElementsByTagName("head")[0];
      const style = document.createElement("style");
      
      style.type = "text/css";
      
      if ("top" === insertAt && head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
      
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    // 侧边栏滚动函数
    function scrollToActiveItem(activeElement, lastPosition) {
      if (!activeElement) return;
      
      const rect = activeElement.getBoundingClientRect();
      const sidebar = document.querySelector(".sidebar");
      
      if (sidebar && rect) {
        sidebar.scrollBy(0, rect.top - (lastPosition || 0));
      }
      
      return rect.top;
    }

    // 展开活动子菜单
    function expandActiveSubmenus() {
      requestAnimationFrame(() => {
        const activeElement = document.querySelector(".app-sub-sidebar > .active");
        
        if (activeElement) {
          // 关闭所有子侧边栏
          document.querySelectorAll(".app-sub-sidebar").forEach(el => {
            el.classList.remove("open");
          });
          
          // 展开活动元素的父级
          let current = activeElement;
          while (current.parentNode.classList.contains("app-sub-sidebar") && 
                 !current.parentNode.classList.contains("open")) {
            current.parentNode.classList.add("open");
            current = current.parentNode;
          }
        }
      });
    }

    // 处理侧边栏点击事件
    function handleSidebarClick(event) {
      const lastPosition = event.target.getBoundingClientRect().top;
      const listItem = findParentByTagName(event.target, "LI", 2);
      
      if (!listItem) return;
      
      if (listItem.classList.contains("open")) {
        listItem.classList.remove("open");
        setTimeout(() => listItem.classList.add("collapse"), 0);
      } else {
        // 关闭所有活动项
        const activeElement = findActiveElement();
        collapseAll(activeElement);
        
        // 展开当前项
        expandItem(listItem);
        setTimeout(() => listItem.classList.remove("collapse"), 0);
      }
      
      scrollToActiveItem(listItem, lastPosition);
    }

    // 查找活动元素
    function findActiveElement() {
      let activeElement = document.querySelector(".sidebar-nav .active");
      
      if (!activeElement) {
        const hash = decodeURIComponent(location.hash).replace(/ /gi, "%20");
        const link = document.querySelector(`.sidebar-nav a[href="${hash}"]`);
        activeElement = findParentByTagName(link, "LI", 2);
        
        if (activeElement) {
          activeElement.classList.add("active");
        }
      }
      
      return activeElement;
    }

    // 展开项目
    function expandItem(element) {
      if (!element) return;
      
      element.classList.add("open", "active");
      
      let current = element;
      while (current && current.parentNode && current.className !== "sidebar-nav") {
        if (current.parentNode.tagName === "LI" || 
            current.parentNode.className === "app-sub-sidebar") {
          current.parentNode.classList.add("open");
        }
        current = current.parentNode;
      }
    }

    // 折叠所有项目
    function collapseAll(activeElement) {
      if (!activeElement) return;
      
      let current = activeElement;
      while (current && current.className !== "sidebar-nav") {
        if (current.tagName === "LI" || current.className === "app-sub-sidebar") {
          current.classList.remove("open", "active");
        }
        current = current.parentNode;
      }
    }

    // 按标签名查找父元素
    function findParentByTagName(element, tagName, maxDepth) {
      if (!element || element.tagName === tagName) return element;
      
      let current = element;
      let depth = 0;
      
      while (current && depth < (maxDepth || 10)) {
        depth++;
        if (current.parentNode && current.parentNode.tagName === tagName) {
          return current.parentNode;
        }
        current = current.parentNode;
      }
      
      return null;
    }

    // 注入CSS样式
    injectCSS(`
      .sidebar-nav > ul > li ul {
        display: none;
      }
      
      .app-sub-sidebar {
        display: none;
      }
      
      .app-sub-sidebar.open {
        display: block;
      }
      
      .sidebar-nav .open > ul:not(.app-sub-sidebar),
      .sidebar-nav .active:not(.collapse) > ul {
        display: block;
      }
      
      /* 抖动 */
      .sidebar-nav li.open:not(.collapse) > ul {
        display: block;
      }
      
      .active + ul.app-sub-sidebar {
        display: block;
      }
    `);
    
    // 滚动时展开活动子菜单
    document.addEventListener("scroll", expandActiveSubmenus);
    
    // 响应式样式
    injectCSS(`
      @media screen and (max-width: 768px) {
        /* 移动端适配 */
        .markdown-section {
          max-width: none;
          padding: 16px;
        }
        /* 改变原来按钮热区大小 */
        .sidebar-toggle {
          padding: 0 0 10px 10px;
        }
        /* my pin */
        .sidebar-pin {
          appearance: none;
          outline: none;
          position: fixed;
          bottom: 0;
          border: none;
          width: 40px;
          height: 40px;
          background: transparent;
        }
      }
    `);
    
    // 侧边栏固定功能
    const PIN_FLAG = "DOCSIFY_SIDEBAR_PIN_FLAG";
    let pinButton = null;
    
    function toggleSidebarPin() {
      const isPinned = localStorage.getItem(PIN_FLAG) === "true";
      localStorage.setItem(PIN_FLAG, !isPinned);
      
      const sidebar = document.querySelector(".sidebar");
      const content = document.querySelector(".content");
      
      if (sidebar && content) {
        if (isPinned) {
          sidebar.style.transform = "translateX(0)";
          content.style.transform = "translateX(0)";
        } else {
          sidebar.style.transform = "translateX(300px)";
          content.style.transform = "translateX(300px)";
        }
      }
    }
    
    // 移动端初始化
    if (document.documentElement.clientWidth <= 768) {
      localStorage.setItem(PIN_FLAG, "false");
      
      pinButton = document.createElement("button");
      pinButton.classList.add("sidebar-pin");
      pinButton.onclick = toggleSidebarPin;
      document.body.append(pinButton);
      
      window.addEventListener("load", function() {
        const content = document.querySelector(".content");
        
        function handleBodyClick(event) {
          if ((event.target === document.body || event.currentTarget === content) && 
              localStorage.getItem(PIN_FLAG) === "true") {
            toggleSidebarPin();
          }
        }
        
        document.body.onclick = content.onclick = handleBodyClick;
      });
    }
    
    // 注册Docsify钩子
    hook.doneEach(function(html, next) {
      const activeElement = findActiveElement();
      expandItem(activeElement);
      
      // 为侧边栏项添加文件/文件夹类
      document.querySelectorAll(".sidebar-nav li").forEach(item => {
        if (item.querySelector("ul:not(.app-sub-sidebar)")) {
          item.classList.add("folder");
        } else {
          item.classList.add("file");
        }
      });
      
      // 递归设置文件夹层级
      function setFolderLevels(element, level) {
        if (!element || !element.childNodes) return;
        
        element.childNodes.forEach(child => {
          if (child.classList && child.classList.contains("folder")) {
            child.classList.add("level-" + level);
            
            // 根据配置决定是否展开
            if (window.$docsify && 
                typeof window.$docsify.sidebarDisplayLevel === "number" && 
                level <= window.$docsify.sidebarDisplayLevel) {
              child.classList.add("open");
            }
            
            // 递归处理子元素
            if (child.childNodes && child.childNodes.length > 1) {
              setFolderLevels(child.childNodes[1], level + 1);
            }
          }
        });
      }
      
      setFolderLevels(document.querySelector(".sidebar-nav > ul"), 1);
      scrollToActiveItem(activeElement);
      
      if (next) next(html);
    });
    
    hook.ready(function() {
      const sidebarNav = document.querySelector(".sidebar-nav");
      if (sidebarNav) {
        sidebarNav.addEventListener("click", handleSidebarClick);
      }
    });
  };
  
  // 安全注册插件
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(install);
})();