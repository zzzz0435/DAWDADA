/**
 * 狀態管理模組
 * 集中管理所有可變狀態，提供統一的存取介面
 */
window.State = (function() {
    'use strict';

    // 資料狀態
    const _data = {
        caseList: [
            {
                id: 1,
                patientName: '王小明',
                medicalRecordNumber: 'A123456',
                managementCategory: '慢性病管理',
                riskLevel: 'high',
                lastVisitDate: '2025-12-25',
                initialAssessment: '糖尿病併發症，需密集追蹤'
            },
            {
                id: 2,
                patientName: '李美華',
                medicalRecordNumber: 'B234567',
                managementCategory: '復健追蹤',
                riskLevel: 'medium',
                lastVisitDate: '2025-12-28',
                initialAssessment: '中風後復健，進展良好'
            },
            {
                id: 3,
                patientName: '張志偉',
                medicalRecordNumber: 'C345678',
                managementCategory: '心理諮商',
                riskLevel: 'high',
                lastVisitDate: '2025-12-20',
                initialAssessment: '憂鬱症追蹤，需加強關懷'
            },
            {
                id: 4,
                patientName: '陳淑芬',
                medicalRecordNumber: 'D456789',
                managementCategory: '營養諮詢',
                riskLevel: 'low',
                lastVisitDate: '2025-12-30',
                initialAssessment: '體重控制計畫，配合度佳'
            },
            {
                id: 5,
                patientName: '林俊傑',
                medicalRecordNumber: 'E567890',
                managementCategory: '慢性病管理',
                riskLevel: 'medium',
                lastVisitDate: '2025-12-22',
                initialAssessment: '高血壓控制中，血壓穩定'
            },
            {
                id: 6,
                patientName: '黃雅婷',
                medicalRecordNumber: 'F678901',
                managementCategory: '用藥諮詢',
                riskLevel: 'low',
                lastVisitDate: '2025-12-27',
                initialAssessment: '藥物調整後反應良好'
            }
        ],
        nextId: window.CONFIG.DEFAULT_NEXT_ID
    };

    // UI 狀態
    const _ui = {
        searchKeyword: '',
        riskFilter: '',
        isEditMode: false,
        editingCaseId: null
    };

    return {
        /**
         * 取得資料狀態
         * @returns {Object} 資料狀態物件
         */
        getData: function() {
            return _data;
        },

        /**
         * 取得 UI 狀態
         * @returns {Object} UI 狀態物件
         */
        getUIState: function() {
            return _ui;
        },

        /**
         * 設定搜尋關鍵字
         * @param {string} keyword - 搜尋關鍵字
         */
        setSearchKeyword: function(keyword) {
            _ui.searchKeyword = keyword;
        },

        /**
         * 設定風險篩選
         * @param {string} filter - 風險等級篩選
         */
        setRiskFilter: function(filter) {
            _ui.riskFilter = filter;
        },

        /**
         * 取得所有個案
         * @returns {Array} 個案陣列
         */
        getCaseList: function() {
            return _data.caseList;
        },

        /**
         * 設定個案列表
         * @param {Array} caseList - 新的個案列表
         */
        setCaseList: function(caseList) {
            _data.caseList = caseList;
        },

        /**
         * 取得下一個 ID
         * @returns {number} 下一個 ID
         */
        getNextId: function() {
            return _data.nextId++;
        },

        /**
         * 設定編輯模式
         * @param {boolean} isEditMode - 是否為編輯模式
         * @param {number|null} caseId - 編輯的個案 ID
         */
        setEditMode: function(isEditMode, caseId = null) {
            _ui.isEditMode = isEditMode;
            _ui.editingCaseId = caseId;
        },

        /**
         * 取得編輯中的個案 ID
         * @returns {number|null} 編輯中的個案 ID
         */
        getEditingCaseId: function() {
            return _ui.editingCaseId;
        },

        /**
         * 是否為編輯模式
         * @returns {boolean} 是否為編輯模式
         */
        isEditMode: function() {
            return _ui.isEditMode;
        }
    };
})();
