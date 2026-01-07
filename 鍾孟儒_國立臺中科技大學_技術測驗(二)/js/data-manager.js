/**
 * 資料管理模組
 * 只負責 CRUD 操作，不持有狀態
 */
window.DataManager = {
    /**
     * 取得所有個案資料
     * @returns {Array} 個案陣列
     */
    getAllCases: function() {
        return window.State.getCaseList();
    },

    /**
     * 根據 ID 取得個案
     * @param {number} caseId - 個案 ID
     * @returns {Object|null} 個案物件或 null
     */
    getCaseById: function(caseId) {
        const caseList = window.State.getCaseList();
        return caseList.find(caseItem => caseItem.id === caseId) || null;
    },

    /**
     * 新增個案
     * @param {Object} caseData - 個案資料
     * @returns {Object} 新增的個案物件
     */
    addCase: function(caseData) {
        const newCase = {
            id: window.State.getNextId(),
            patientName: caseData.patientName,
            medicalRecordNumber: caseData.medicalRecordNumber,
            managementCategory: caseData.managementCategory,
            riskLevel: caseData.riskLevel,
            lastVisitDate: caseData.lastVisitDate,
            initialAssessment: caseData.initialAssessment
        };

        const caseList = window.State.getCaseList();
        caseList.push(newCase);

        return newCase;
    },

    /**
     * 刪除個案
     * @param {number} caseId - 個案 ID
     * @returns {boolean} 是否刪除成功
     */
    deleteCase: function(caseId) {
        const caseList = window.State.getCaseList();
        const initialLength = caseList.length;
        const filteredList = caseList.filter(caseItem => caseItem.id !== caseId);

        window.State.setCaseList(filteredList);

        return filteredList.length < initialLength;
    },

    /**
     * 更新個案
     * @param {number} caseId - 個案 ID
     * @param {Object} caseData - 更新的個案資料
     * @returns {Object|null} 更新後的個案物件，失敗則返回 null
     */
    updateCase: function(caseId, caseData) {
        const caseList = window.State.getCaseList();
        const caseIndex = caseList.findIndex(caseItem => caseItem.id === caseId);

        if (caseIndex === -1) {
            return null;
        }

        // 更新個案資料（保留原 ID）
        caseList[caseIndex] = {
            id: caseId,
            patientName: caseData.patientName,
            medicalRecordNumber: caseData.medicalRecordNumber,
            managementCategory: caseData.managementCategory,
            riskLevel: caseData.riskLevel,
            lastVisitDate: caseData.lastVisitDate,
            initialAssessment: caseData.initialAssessment
        };

        return caseList[caseIndex];
    },

    /**
     * 檢查病歷號是否已存在
     * @param {string} medicalRecordNumber - 病歷號
     * @param {number|null} excludeCaseId - 排除的個案 ID（用於編輯時）
     * @returns {boolean} 是否已存在
     */
    isMedicalRecordNumberExists: function(medicalRecordNumber, excludeCaseId = null) {
        const caseList = window.State.getCaseList();
        return caseList.some(caseItem =>
            caseItem.medicalRecordNumber === medicalRecordNumber &&
            caseItem.id !== excludeCaseId
        );
    }
};
