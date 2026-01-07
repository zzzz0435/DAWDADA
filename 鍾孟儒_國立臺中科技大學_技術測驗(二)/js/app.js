/**
 * 應用程式主控制器
 * 協調各層的互動，管理應用生命週期
 */
(function() {
    'use strict';

    /**
     * 全局錯誤邊界處理器
     */
    const ErrorBoundary = {
        /**
         * 初始化全局錯誤處理
         */
        init: function() {
            // 捕獲所有未處理的錯誤
            window.addEventListener('error', function(event) {
                console.error('全局錯誤:', event.error);
                ErrorBoundary.handleError(event.error, '系統發生未預期的錯誤');
                event.preventDefault();
            });

            // 捕獲所有未處理的 Promise 拒絕
            window.addEventListener('unhandledrejection', function(event) {
                console.error('未處理的 Promise 拒絕:', event.reason);
                ErrorBoundary.handleError(event.reason, 'Promise 執行失敗');
                event.preventDefault();
            });
        },

        /**
         * 處理錯誤並顯示友善訊息
         * @param {Error} error - 錯誤物件
         * @param {string} userMessage - 使用者友善訊息
         */
        handleError: function(error, userMessage) {
            // 記錄詳細錯誤到 console
            console.error('錯誤詳情:', {
                message: error.message || error,
                stack: error.stack,
                time: new Date().toISOString()
            });

            // 顯示使用者友善的錯誤訊息
            if (window.Renderer && window.Renderer.showAlert) {
                window.Renderer.showAlert(
                    userMessage + '，請重新整理頁面或聯絡系統管理員',
                    'danger'
                );
            } else {
                // 如果渲染器不可用，使用原生 alert
                alert(userMessage + '\n\n請重新整理頁面。');
            }
        },

        /**
         * 安全執行函數，自動捕獲錯誤
         * @param {Function} fn - 要執行的函數
         * @param {string} errorMessage - 錯誤訊息
         * @returns {*} 函數執行結果
         */
        safeExecute: function(fn, errorMessage = '操作失敗') {
            try {
                return fn();
            } catch (error) {
                this.handleError(error, errorMessage);
                return null;
            }
        }
    };

    /**
     * 應用程式主控制器
     */
    window.App = {
        /**
         * 初始化應用程式
         */
        init: function() {
            ErrorBoundary.safeExecute(() => {
                // 初始化錯誤邊界
                ErrorBoundary.init();

                // 檢查必要模組是否已載入
                this.checkDependencies();

                // 初始化 DOM 快取
                window.DOMCache.init();

                // 綁定事件
                this.bindEvents();

                // 初始渲染
                this.updateView();

                console.log('個案管理系統已啟動 (v3.0 - 模組化重構版)');
                console.log('已載入模組:', {
                    CONFIG: !!window.CONFIG,
                    State: !!window.State,
                    DateUtils: !!window.DateUtils,
                    StringUtils: !!window.StringUtils,
                    UIFormatter: !!window.UIFormatter,
                    Validator: !!window.Validator,
                    BusinessLogic: !!window.BusinessLogic,
                    DataManager: !!window.DataManager,
                    DOMCache: !!window.DOMCache,
                    Renderer: !!window.Renderer,
                    EventHandlers: !!window.EventHandlers
                });
            }, '應用程式初始化失敗');
        },

        /**
         * 檢查必要模組依賴
         */
        checkDependencies: function() {
            const requiredModules = [
                'CONFIG',
                'State',
                'DateUtils',
                'StringUtils',
                'UIFormatter',
                'Validator',
                'BusinessLogic',
                'DataManager',
                'DOMCache',
                'Renderer',
                'EventHandlers'
            ];

            const missingModules = requiredModules.filter(module => !window[module]);

            if (missingModules.length > 0) {
                throw new Error(`缺少必要模組: ${missingModules.join(', ')}`);
            }
        },

        /**
         * 綁定所有事件監聽器
         */
        bindEvents: function() {
            ErrorBoundary.safeExecute(() => {
                // 表單提交
                window.DOMCache.get('addCaseForm').addEventListener(
                    'submit',
                    window.EventHandlers.handleFormSubmit
                );

                // 搜尋輸入
                window.DOMCache.get('searchInput').addEventListener(
                    'input',
                    window.EventHandlers.handleSearch
                );

                // 篩選下拉選單
                window.DOMCache.get('filterSelect').addEventListener(
                    'change',
                    window.EventHandlers.handleFilter
                );

                // 管理類別選擇變更（顯示/隱藏自訂輸入框）
                window.DOMCache.get('caseCategory').addEventListener(
                    'change',
                    window.EventHandlers.handleCategoryChange
                );

                // 取消編輯按鈕
                window.DOMCache.get('cancelEditBtn').addEventListener(
                    'click',
                    window.EventHandlers.handleCancelEdit
                );

                // 表格按鈕（使用事件委派）
                window.DOMCache.get('caseTableBody').addEventListener(
                    'click',
                    window.EventHandlers.handleTableAction
                );

                // 表單輸入時清除錯誤訊息
                const formInputs = window.DOMCache.get('addCaseForm').querySelectorAll('input, select, textarea');
                formInputs.forEach(input => {
                    input.addEventListener('input', function() {
                        window.Renderer.clearFieldError(this);
                    });
                });
            }, '事件綁定失敗');
        },

        /**
         * 更新視圖（協調 BusinessLogic 和 Renderer）
         * 這是重構後的核心方法：分離業務邏輯和渲染
         */
        updateView: function() {
            ErrorBoundary.safeExecute(() => {
                // 1. 取得所有資料
                const allCases = window.DataManager.getAllCases();
                const uiState = window.State.getUIState();

                // 2. 業務邏輯層處理：過濾資料
                const filteredCases = window.BusinessLogic.filterCases(
                    allCases,
                    uiState.searchKeyword,
                    uiState.riskFilter
                );

                // 3. 業務邏輯層處理：計算統計
                const statistics = window.BusinessLogic.calculateStatistics(allCases);

                // 4. 渲染層更新：只負責 DOM 更新
                window.Renderer.renderTable(filteredCases);
                window.Renderer.renderStatistics(statistics);
            }, '更新視圖失敗');
        }
    };

    // 當 DOM 載入完成時初始化應用程式
    document.addEventListener('DOMContentLoaded', function() {
        window.App.init();
    });

})();
