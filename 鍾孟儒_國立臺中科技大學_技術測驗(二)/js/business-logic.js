/**
 * 業務邏輯模組
 * 負責純數據轉換和計算，不涉及 DOM 操作
 */
window.BusinessLogic = {
    /**
     * 過濾個案資料
     * @param {Array} cases - 原始個案陣列
     * @param {string} searchKeyword - 搜尋關鍵字（支援姓名或病歷號）
     * @param {string} riskFilter - 風險等級篩選
     * @returns {Array} 過濾後的個案陣列
     */
    filterCases: function(cases, searchKeyword, riskFilter) {
        let filteredCases = cases;

        // 依姓名或病歷號搜尋過濾
        if (searchKeyword) {
            filteredCases = filteredCases.filter(caseItem =>
                caseItem.patientName.includes(searchKeyword) ||
                caseItem.medicalRecordNumber.includes(searchKeyword)
            );
        }

        // 依風險等級過濾
        if (riskFilter) {
            filteredCases = filteredCases.filter(caseItem =>
                caseItem.riskLevel === riskFilter
            );
        }

        return filteredCases;
    },

    /**
     * 計算統計資料
     * @param {Array} cases - 個案陣列
     * @returns {Object} 統計資料 {total, highRisk, pendingFollowUp}
     */
    calculateStatistics: function(cases) {
        const total = cases.length;
        const highRisk = this.calculateHighRiskCount(cases);
        const pendingFollowUp = this.calculatePendingFollowUp(cases);

        return {
            total: total,
            highRisk: highRisk,
            pendingFollowUp: pendingFollowUp
        };
    },

    /**
     * 計算高風險個案數
     * @param {Array} cases - 個案陣列
     * @returns {number} 高風險個案數量
     */
    calculateHighRiskCount: function(cases) {
        return cases.filter(caseItem =>
            caseItem.riskLevel === window.CONFIG.RISK_LEVELS.HIGH
        ).length;
    },

    /**
     * 計算待追蹤人數（7 天以上未訪視）
     * @param {Array} cases - 個案陣列
     * @returns {number} 待追蹤人數
     */
    calculatePendingFollowUp: function(cases) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return cases.filter(caseItem => {
            const visitDate = new Date(caseItem.lastVisitDate);
            visitDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((today - visitDate) / (1000 * 60 * 60 * 24));

            return daysDiff > window.CONFIG.FOLLOW_UP_THRESHOLD_DAYS;
        }).length;
    },

    /**
     * 判斷個案是否需要追蹤（單一個案版本）
     * @param {Object} caseData - 個案資料
     * @returns {boolean} true 表示需要追蹤（超過 7 天未訪視）
     */
    isPendingFollowUp: function(caseData) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const visitDate = new Date(caseData.lastVisitDate);
        visitDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today - visitDate) / (1000 * 60 * 60 * 24));

        return daysDiff > window.CONFIG.FOLLOW_UP_THRESHOLD_DAYS;
    },

    /**
     * 排序個案資料
     * @param {Array} cases - 個案陣列
     * @param {string} sortBy - 排序欄位 (name/id/category/risk/date)
     * @param {string} direction - 排序方向 (asc/desc)
     * @returns {Array} 排序後的個案陣列
     */
    sortCases: function(cases, sortBy, direction) {
        if (!sortBy) return cases;

        const sorted = [...cases].sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'name':
                    valueA = a.patientName;
                    valueB = b.patientName;
                    break;
                case 'id':
                    valueA = a.medicalRecordNumber;
                    valueB = b.medicalRecordNumber;
                    break;
                case 'category':
                    valueA = a.managementCategory;
                    valueB = b.managementCategory;
                    break;
                case 'risk':
                    // 風險等級排序：high > medium > low
                    const riskOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    valueA = riskOrder[a.riskLevel] || 0;
                    valueB = riskOrder[b.riskLevel] || 0;
                    break;
                case 'date':
                    valueA = new Date(a.lastVisitDate);
                    valueB = new Date(b.lastVisitDate);
                    break;
                default:
                    return 0;
            }

            // 比較邏輯
            let comparison = 0;
            if (valueA > valueB) {
                comparison = 1;
            } else if (valueA < valueB) {
                comparison = -1;
            }

            return direction === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }
};
