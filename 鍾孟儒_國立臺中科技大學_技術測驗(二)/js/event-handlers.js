/**
 * 事件處理模組
 * 處理所有使用者互動事件
 */
window.EventHandlers = {
    /**
     * 處理管理類別選擇變更（顯示/隱藏自訂輸入框）
     * @param {Event} event - 變更事件
     */
    handleCategoryChange: function(event) {
        const categorySelect = window.DOMCache.get('caseCategory');
        const customInput = window.DOMCache.get('customCategory');

        if (categorySelect.value === 'custom') {
            customInput.style.display = 'block';
            customInput.required = true;
            customInput.focus();
        } else {
            customInput.style.display = 'none';
            customInput.required = false;
            customInput.value = '';
        }
    },

    /**
     * 處理表單提交
     * @param {Event} event - 表單提交事件
     */
    handleFormSubmit: function(event) {
        event.preventDefault();
        window.Renderer.clearAllFieldErrors();

        // 從 DOM Cache 取得表單資料
        const categoryValue = window.DOMCache.get('caseCategory').value;
        const customCategoryValue = window.DOMCache.get('customCategory').value;

        const formData = {
            patientName: window.DOMCache.get('caseName').value,
            medicalRecordNumber: window.DOMCache.get('caseId').value,
            managementCategory: categoryValue === 'custom' ? customCategoryValue : categoryValue,
            riskLevel: window.DOMCache.get('caseRisk').value,
            lastVisitDate: window.DOMCache.get('caseVisitDate').value,
            initialAssessment: window.DOMCache.get('caseSummary').value
        };

        // 取得編輯模式狀態
        const isEditMode = window.State.isEditMode();
        const editingCaseId = window.State.getEditingCaseId();

        // 驗證所有欄位
        const validations = [
            {
                field: 'caseName',
                validator: () => window.Validator.validateName(formData.patientName)
            },
            {
                field: 'caseId',
                validator: () => window.Validator.validateMedicalRecordNumber(
                    formData.medicalRecordNumber,
                    (number) => window.DataManager.isMedicalRecordNumberExists(number, editingCaseId)
                )
            },
            {
                // 如果是自定義類別，驗證 customCategory 輸入框，否則驗證 caseCategory 下拉選單
                field: categoryValue === 'custom' ? 'customCategory' : 'caseCategory',
                validator: () => window.Validator.validateCategory(formData.managementCategory)
            },
            {
                field: 'caseRisk',
                validator: () => window.Validator.validateRiskLevel(formData.riskLevel)
            },
            {
                field: 'caseVisitDate',
                validator: () => window.Validator.validateDate(formData.lastVisitDate)
            },
            {
                field: 'caseSummary',
                validator: () => window.Validator.validateSummary(formData.initialAssessment)
            }
        ];

        let isValid = true;
        validations.forEach(({ field, validator }) => {
            const result = validator();
            if (!result.valid) {
                isValid = false;
                const inputElement = window.DOMCache.get(field);
                window.Renderer.showFieldError(inputElement, result.message);
            }
        });

        if (!isValid) {
            return;
        }

        // 清理輸入資料
        const cleanedData = {
            patientName: window.StringUtils.sanitizeInput(formData.patientName),
            medicalRecordNumber: window.StringUtils.sanitizeInput(formData.medicalRecordNumber),
            managementCategory: window.StringUtils.sanitizeInput(formData.managementCategory),
            riskLevel: formData.riskLevel,
            lastVisitDate: formData.lastVisitDate || window.DateUtils.getTodayDate(),
            initialAssessment: window.StringUtils.sanitizeInput(formData.initialAssessment)
        };

        // 根據模式執行新增或更新
        try {
            if (isEditMode) {
                // 編輯模式：更新個案
                const updatedCase = window.DataManager.updateCase(editingCaseId, cleanedData);
                if (updatedCase) {
                    window.App.updateView();
                    window.Renderer.resetForm();
                    window.Renderer.showAlert('個案更新成功！', 'success');
                } else {
                    window.Renderer.showAlert('找不到要更新的個案', 'danger');
                }
            } else {
                // 新增模式：新增個案
                window.DataManager.addCase(cleanedData);
                window.App.updateView();
                window.Renderer.resetForm();
                window.Renderer.showAlert('個案新增成功！', 'success');
            }
        } catch (error) {
            console.error('儲存個案時發生錯誤:', error);
            window.Renderer.showAlert('儲存失敗，請稍後再試', 'danger');
        }
    },

    /**
     * 處理搜尋
     * @param {Event} event - 輸入事件
     */
    handleSearch: function(event) {
        const keyword = window.StringUtils.sanitizeInput(event.target.value);
        window.State.setSearchKeyword(keyword);
        window.App.updateView();
    },

    /**
     * 處理篩選
     * @param {Event} event - 變更事件
     */
    handleFilter: function(event) {
        window.State.setRiskFilter(event.target.value);
        window.App.updateView();
    },

    /**
     * 處理表格按鈕點擊（事件委派）
     * @param {Event} event - 點擊事件
     */
    handleTableAction: function(event) {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        const caseId = parseInt(button.dataset.caseId, 10);

        if (action === 'delete') {
            window.EventHandlers.handleDelete(caseId);
        } else if (action === 'edit') {
            window.EventHandlers.handleEdit(caseId);
        }
    },

    /**
     * 處理刪除個案
     * @param {number} caseId - 個案 ID
     */
    handleDelete: function(caseId) {
        const caseData = window.DataManager.getCaseById(caseId);
        if (!caseData) {
            window.Renderer.showAlert('找不到該個案', 'warning');
            return;
        }

        if (confirm(`確定要刪除「${caseData.patientName}」的個案資料嗎？`)) {
            try {
                const success = window.DataManager.deleteCase(caseId);
                if (success) {
                    window.App.updateView();
                    window.Renderer.showAlert('個案已刪除', 'info');
                } else {
                    window.Renderer.showAlert('刪除失敗', 'danger');
                }
            } catch (error) {
                console.error('刪除個案時發生錯誤:', error);
                window.Renderer.showAlert('刪除失敗，請稍後再試', 'danger');
            }
        }
    },

    /**
     * 處理編輯個案
     * @param {number} caseId - 個案 ID
     */
    handleEdit: function(caseId) {
        const caseData = window.DataManager.getCaseById(caseId);
        if (!caseData) {
            window.Renderer.showAlert('找不到該個案', 'warning');
            return;
        }

        // 設定編輯模式
        window.State.setEditMode(true, caseId);

        // 填充表單
        window.Renderer.fillForm(caseData);

        // 更新表單 UI（標題和按鈕）
        window.Renderer.updateFormMode();
    },

    /**
     * 處理取消編輯
     */
    handleCancelEdit: function() {
        // 重置表單（會自動切換回新增模式）
        window.Renderer.resetForm();
    }
};
