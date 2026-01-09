/**
 * DOM 元素快取管理
 * 集中管理所有 DOM 元素引用，避免重複查詢
 */
window.DOMCache = {
    elements: {},

    /**
     * 初始化所有 DOM 元素快取
     */
    init: function() {
        // 表格相關
        this.elements.caseTableBody = document.getElementById('caseTableBody');
        this.elements.sortableHeaders = document.querySelectorAll('th.sortable');

        // 統計卡片
        this.elements.totalCasesElement = document.getElementById('totalCases');
        this.elements.highRiskCasesElement = document.getElementById('highRiskCases');
        this.elements.pendingFollowUpElement = document.getElementById('pendingFollowUp');

        // 搜尋與篩選
        this.elements.searchInput = document.getElementById('searchName');
        this.elements.filterSelect = document.getElementById('filterRisk');

        // 提示訊息
        this.elements.alertContainer = document.getElementById('alertContainer');

        // Modal 相關
        this.elements.caseModal = document.getElementById('caseModal');
        this.elements.caseModalInstance = null; // 儲存 Bootstrap Modal 實例
        this.elements.caseModalLabel = document.getElementById('caseModalLabel');
        this.elements.addCaseBtn = document.getElementById('addCaseBtn');
        this.elements.saveCaseBtn = document.getElementById('saveCaseBtn');

        // 表單相關
        this.elements.caseForm = document.getElementById('caseForm');
        this.elements.editIndex = document.getElementById('editIndex');
        this.elements.caseName = document.getElementById('caseName');
        this.elements.caseId = document.getElementById('caseId');
        this.elements.caseCategory = document.getElementById('caseCategory');
        this.elements.customCategory = document.getElementById('customCategory');
        this.elements.caseRisk = document.getElementById('caseRisk');
        this.elements.caseVisitDate = document.getElementById('caseVisitDate');
        this.elements.caseSummary = document.getElementById('caseSummary');
    },

    /**
     * 取得快取的 DOM 元素
     * @param {string} key - 元素鍵名
     * @returns {HTMLElement|null} DOM 元素
     */
    get: function(key) {
        return this.elements[key] || null;
    }
};
