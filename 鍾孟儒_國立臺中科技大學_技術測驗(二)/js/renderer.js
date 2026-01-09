/**
 * 渲染模組
 * 只負責 DOM 更新，接收已處理好的資料
 */
window.Renderer = {
    /**
     * 渲染表格
     * @param {Array} cases - 已過濾的個案陣列
     */
    renderTable: function(cases) {
        const tbody = window.DOMCache.get('caseTableBody');

        // 清空表格
        tbody.innerHTML = '';

        // 無資料時顯示提示
        if (cases.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                        <div class="mt-2">沒有符合的個案資料</div>
                    </td>
                </tr>
            `;
            return;
        }

        // 渲染每一筆資料
        cases.forEach(caseItem => {
            const row = this.createTableRow(caseItem);
            tbody.appendChild(row);
        });
    },

    /**
     * 創建表格行
     * @param {Object} caseData - 個案資料
     * @returns {HTMLElement} 表格行元素
     */
    createTableRow: function(caseData) {
        const row = document.createElement('tr');

        // 檢查是否為待追蹤個案
        const isPending = window.BusinessLogic.isPendingFollowUp(caseData);
        if (isPending) {
            row.classList.add('row-pending-followup');
        }

        // 組合訪視日期顯示（若為待追蹤則加上標記）
        const visitDateDisplay = isPending
            ? `${window.StringUtils.escapeHtml(caseData.lastVisitDate)} <i class="bi bi-clock-history text-warning ms-1"></i> <span class="badge bg-warning text-dark">待追蹤</span>`
            : window.StringUtils.escapeHtml(caseData.lastVisitDate);

        // 使用 escapeHtml 防止 XSS 攻擊
        row.innerHTML = `
            <td>${window.StringUtils.escapeHtml(caseData.patientName)}</td>
            <td>${window.StringUtils.escapeHtml(caseData.medicalRecordNumber)}</td>
            <td>${window.StringUtils.escapeHtml(caseData.managementCategory)}</td>
            <td>
                <span class="badge ${window.UIFormatter.getRiskBadgeClass(caseData.riskLevel)}">
                    ${window.UIFormatter.getRiskLabel(caseData.riskLevel)}
                </span>
            </td>
            <td>${visitDateDisplay}</td>
            <td>${window.StringUtils.escapeHtml(caseData.initialAssessment)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1"
                        data-action="edit"
                        data-case-id="${caseData.id}"
                        title="編輯">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger"
                        data-action="delete"
                        data-case-id="${caseData.id}"
                        title="刪除">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        return row;
    },

    /**
     * 渲染統計資料
     * @param {Object} stats - 統計資料 {total, highRisk, pendingFollowUp}
     */
    renderStatistics: function(stats) {
        window.DOMCache.get('totalCasesElement').textContent = stats.total;
        window.DOMCache.get('highRiskCasesElement').textContent = stats.highRisk;
        window.DOMCache.get('pendingFollowUpElement').textContent = stats.pendingFollowUp;
    },

    /**
     * 顯示提示訊息
     * @param {string} message - 訊息內容
     * @param {string} type - 訊息類型（success, danger, warning, info）
     */
    showAlert: function(message, type = 'success') {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show alert-fixed" role="alert">
                ${window.StringUtils.escapeHtml(message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        window.DOMCache.get('alertContainer').insertAdjacentHTML('beforeend', alertHtml);

        // 自動關閉
        setTimeout(() => {
            const alerts = window.DOMCache.get('alertContainer').querySelectorAll('.alert');
            if (alerts.length > 0) {
                alerts[0].remove();
            }
        }, window.CONFIG.ALERT_AUTO_CLOSE_TIME);
    },

    /**
     * 顯示表單欄位錯誤訊息
     * @param {HTMLElement} inputElement - 輸入元素
     * @param {string} message - 錯誤訊息
     */
    showFieldError: function(inputElement, message) {
        inputElement.classList.add('is-invalid');

        // 移除舊的錯誤訊息
        const oldError = inputElement.parentElement.querySelector('.invalid-feedback');
        if (oldError) {
            oldError.remove();
        }

        // 新增錯誤訊息
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        inputElement.parentElement.appendChild(errorDiv);
    },

    /**
     * 清除表單欄位錯誤訊息
     * @param {HTMLElement} inputElement - 輸入元素
     */
    clearFieldError: function(inputElement) {
        inputElement.classList.remove('is-invalid');
        const errorDiv = inputElement.parentElement.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    },

    /**
     * 清除所有表單錯誤訊息
     */
    clearAllFieldErrors: function() {
        const invalidInputs = window.DOMCache.get('caseForm').querySelectorAll('.is-invalid');
        invalidInputs.forEach(input => this.clearFieldError(input));
    },

    /**
     * 重置表單
     */
    resetForm: function() {
        window.DOMCache.get('caseForm').reset();
        this.clearAllFieldErrors();

        // 隱藏自訂類別輸入框
        const customInput = window.DOMCache.get('customCategory');
        customInput.style.display = 'none';
        customInput.required = false;

        // 重置為新增模式
        window.State.setEditMode(false, null);
    },

    /**
     * 打開 Modal
     */
    openModal: function() {
        const modalInstance = window.DOMCache.elements.caseModalInstance;
        if (modalInstance) {
            modalInstance.show();
        }
    },

    /**
     * 關閉 Modal
     */
    closeModal: function() {
        const modalInstance = window.DOMCache.elements.caseModalInstance;
        if (modalInstance) {
            modalInstance.hide();
        }
    },

    /**
     * 更新 Modal 標題
     * @param {string} title - 標題文字
     */
    updateModalTitle: function(title) {
        const modalLabel = window.DOMCache.get('caseModalLabel');
        const icon = title.includes('編輯') ? 'bi-pencil-square' : 'bi-plus-circle';
        modalLabel.innerHTML = `<i class="bi ${icon}"></i> ${title}`;
    },

    /**
     * 更新排序指示器
     * @param {string} sortBy - 排序欄位
     * @param {string} sortDirection - 排序方向
     */
    updateSortIndicators: function(sortBy, sortDirection) {
        const headers = window.DOMCache.get('sortableHeaders');
        headers.forEach(header => {
            const headerSortBy = header.dataset.sort;

            // 移除所有排序類別
            header.classList.remove('sorted-asc', 'sorted-desc');

            // 添加當前排序的類別
            if (headerSortBy === sortBy) {
                header.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
    },

    /**
     * 填充表單資料（用於編輯）
     * @param {Object} caseData - 個案資料
     */
    fillForm: function(caseData) {
        window.DOMCache.get('caseName').value = caseData.patientName;
        window.DOMCache.get('caseId').value = caseData.medicalRecordNumber;
        window.DOMCache.get('caseRisk').value = caseData.riskLevel;
        window.DOMCache.get('caseVisitDate').value = caseData.lastVisitDate;
        window.DOMCache.get('caseSummary').value = caseData.initialAssessment;

        // 處理管理類別（可能是自訂類別）
        const categorySelect = window.DOMCache.get('caseCategory');
        const categoryOptions = Array.from(categorySelect.options).map(opt => opt.value);

        if (categoryOptions.includes(caseData.managementCategory)) {
            // 預設選項
            categorySelect.value = caseData.managementCategory;
        } else {
            // 自訂類別
            categorySelect.value = 'custom';
            const customInput = window.DOMCache.get('customCategory');
            customInput.style.display = 'block';
            customInput.required = true;
            customInput.value = caseData.managementCategory;
        }

        // 清除錯誤訊息
        this.clearAllFieldErrors();
    }
};
