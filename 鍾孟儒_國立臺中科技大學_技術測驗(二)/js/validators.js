/**
 * 驗證模組
 * 純驗證函數，減少外部依賴
 */
window.Validator = {
    /**
     * 驗證姓名
     * @param {string} name - 姓名
     * @returns {Object} {valid: boolean, message: string}
     */
    validateName: function(name) {
        const sanitizedName = window.StringUtils.sanitizeInput(name);

        if (!sanitizedName) {
            return { valid: false, message: '請輸入姓名' };
        }

        if (sanitizedName.length > window.CONFIG.MAX_NAME_LENGTH) {
            return { valid: false, message: `姓名不可超過 ${window.CONFIG.MAX_NAME_LENGTH} 個字元` };
        }

        return { valid: true, message: '' };
    },

    /**
     * 驗證病歷號格式
     * @param {string} medicalRecordNumber - 病歷號
     * @returns {Object} {valid: boolean, message: string}
     */
    validateMedicalRecordNumberFormat: function(medicalRecordNumber) {
        const sanitizedNumber = window.StringUtils.sanitizeInput(medicalRecordNumber);

        if (!sanitizedNumber) {
            return { valid: false, message: '請輸入病歷號' };
        }

        if (!window.CONFIG.CASE_ID_PATTERN.test(sanitizedNumber)) {
            return { valid: false, message: '病歷號僅可包含英文字母和數字' };
        }

        return { valid: true, message: '' };
    },

    /**
     * 驗證病歷號（包含唯一性檢查）
     * @param {string} medicalRecordNumber - 病歷號
     * @param {Function} checkExistsFn - 檢查是否存在的函數
     * @returns {Object} {valid: boolean, message: string}
     */
    validateMedicalRecordNumber: function(medicalRecordNumber, checkExistsFn) {
        // 先檢查格式
        const formatResult = this.validateMedicalRecordNumberFormat(medicalRecordNumber);
        if (!formatResult.valid) {
            return formatResult;
        }

        // 檢查唯一性
        const sanitizedNumber = window.StringUtils.sanitizeInput(medicalRecordNumber);
        if (checkExistsFn && checkExistsFn(sanitizedNumber)) {
            return { valid: false, message: '此病歷號已存在，請使用不同的病歷號' };
        }

        return { valid: true, message: '' };
    },

    /**
     * 驗證管理類別
     * @param {string} category - 管理類別
     * @returns {Object} {valid: boolean, message: string}
     */
    validateCategory: function(category) {
        const sanitizedCategory = window.StringUtils.sanitizeInput(category);

        if (!sanitizedCategory) {
            return { valid: false, message: '請選擇管理類別' };
        }

        if (sanitizedCategory.length > window.CONFIG.MAX_CATEGORY_LENGTH) {
            return { valid: false, message: `管理類別不可超過 ${window.CONFIG.MAX_CATEGORY_LENGTH} 個字元` };
        }

        return { valid: true, message: '' };
    },

    /**
     * 驗證風險等級
     * @param {string} riskLevel - 風險等級
     * @returns {Object} {valid: boolean, message: string}
     */
    validateRiskLevel: function(riskLevel) {
        if (!riskLevel) {
            return { valid: false, message: '請選擇風險等級' };
        }

        const validLevels = Object.values(window.CONFIG.RISK_LEVELS);
        if (!validLevels.includes(riskLevel)) {
            return { valid: false, message: '無效的風險等級' };
        }

        return { valid: true, message: '' };
    },

    /**
     * 驗證日期
     * @param {string} date - 日期
     * @returns {Object} {valid: boolean, message: string}
     */
    validateDate: function(date) {
        if (date && !window.DateUtils.isValidDate(date)) {
            return { valid: false, message: '日期格式不正確' };
        }
        return { valid: true, message: '' };
    },

    /**
     * 驗證初評摘要
     * @param {string} summary - 初評摘要
     * @returns {Object} {valid: boolean, message: string}
     */
    validateSummary: function(summary) {
        const sanitizedSummary = window.StringUtils.sanitizeInput(summary);

        if (!sanitizedSummary) {
            return { valid: false, message: '請輸入初評摘要' };
        }

        if (sanitizedSummary.length > window.CONFIG.MAX_SUMMARY_LENGTH) {
            return { valid: false, message: `初評摘要不可超過 ${window.CONFIG.MAX_SUMMARY_LENGTH} 個字元` };
        }

        return { valid: true, message: '' };
    }
};
