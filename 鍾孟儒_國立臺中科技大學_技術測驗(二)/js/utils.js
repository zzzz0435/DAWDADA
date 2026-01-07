/**
 * 工具模組
 * 包含日期、字串處理和 UI 格式化工具
 */

/**
 * 日期工具函數
 */
window.DateUtils = {
    /**
     * 取得今天日期（YYYY-MM-DD 格式）
     * @returns {string} 今天的日期字串
     */
    getTodayDate: function() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 驗證日期格式是否正確（YYYY-MM-DD）
     * @param {string} dateString - 日期字串
     * @returns {boolean} 是否為有效日期
     */
    isValidDate: function(dateString) {
        if (!dateString) return true; // 空字串視為有效（會自動填入今天）
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(dateString)) return false;

        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
};

/**
 * 字串工具函數
 */
window.StringUtils = {
    /**
     * HTML 編碼（防止 XSS 攻擊）
     * @param {string} str - 原始字串
     * @returns {string} 編碼後的字串
     */
    escapeHtml: function(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * 清理輸入字串（移除前後空白）
     * @param {string} str - 原始字串
     * @returns {string} 清理後的字串
     */
    sanitizeInput: function(str) {
        return typeof str === 'string' ? str.trim() : '';
    }
};

/**
 * UI 格式化工具
 */
window.UIFormatter = {
    /**
     * 取得風險等級的中文標籤
     * @param {string} riskLevel - 風險等級代碼
     * @returns {string} 中文標籤
     */
    getRiskLabel: function(riskLevel) {
        return window.CONFIG.RISK_LABELS[riskLevel] || riskLevel;
    },

    /**
     * 取得風險等級的 badge class
     * @param {string} riskLevel - 風險等級代碼
     * @returns {string} CSS 類別名稱
     */
    getRiskBadgeClass: function(riskLevel) {
        return window.CONFIG.RISK_BADGE_CLASSES[riskLevel] || '';
    }
};
