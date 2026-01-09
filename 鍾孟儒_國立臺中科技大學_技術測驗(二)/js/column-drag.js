/**
 * 欄位拖拉模組（優化版 - 使用事件委派）
 * 處理表格欄位順序的拖拉調整功能
 *
 * 優化重點：
 * 1. 使用事件委派，避免重複綁定監聽器
 * 2. 減少 DOM 操作，提升性能
 * 3. 避免內存洩漏
 */
window.ColumnDrag = {
    draggedColumn: null,
    draggedIndex: null,
    headerRow: null,
    isInitialized: false,

    /**
     * 初始化欄位拖拉功能（只執行一次）
     */
    init: function() {
        // 防止重複初始化
        if (this.isInitialized) {
            return;
        }

        this.headerRow = document.getElementById('tableHeaderRow');
        if (!this.headerRow) {
            console.warn('找不到表頭行元素');
            return;
        }

        // 使用事件委派，只在父元素上綁定一次事件
        this.bindDelegatedEvents();
        this.isInitialized = true;

        console.log('✅ 欄位拖拉功能已初始化（事件委派模式）');
    },

    /**
     * 綁定委派事件（只執行一次）
     */
    bindDelegatedEvents: function() {
        // 拖曳開始（事件委派）
        this.headerRow.addEventListener('dragstart', (e) => {
            const header = e.target.closest('.draggable-column');
            if (header) {
                this.handleDragStart(e, header);
            }
        });

        // 拖曳經過（事件委派）
        this.headerRow.addEventListener('dragover', (e) => {
            const header = e.target.closest('.draggable-column');
            if (header) {
                this.handleDragOver(e);
            }
        });

        // 拖曳進入（事件委派）
        this.headerRow.addEventListener('dragenter', (e) => {
            const header = e.target.closest('.draggable-column');
            if (header) {
                this.handleDragEnter(e, header);
            }
        });

        // 拖曳離開（事件委派）
        this.headerRow.addEventListener('dragleave', (e) => {
            const header = e.target.closest('.draggable-column');
            if (header) {
                this.handleDragLeave(e, header);
            }
        });

        // 放下（事件委派）
        this.headerRow.addEventListener('drop', (e) => {
            const header = e.target.closest('.draggable-column');
            if (header) {
                this.handleDrop(e, header);
            }
        });

        // 拖曳結束（事件委派）
        this.headerRow.addEventListener('dragend', (e) => {
            this.handleDragEnd(e);
        });
    },

    /**
     * 獲取表頭的索引位置
     */
    getHeaderIndex: function(header) {
        const headers = Array.from(this.headerRow.querySelectorAll('.draggable-column'));
        return headers.indexOf(header);
    },

    /**
     * 處理拖曳開始
     */
    handleDragStart: function(e, header) {
        this.draggedColumn = header;
        this.draggedIndex = this.getHeaderIndex(header);

        header.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', header.innerHTML);
    },

    /**
     * 處理拖曳經過
     */
    handleDragOver: function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    },

    /**
     * 處理拖曳進入
     */
    handleDragEnter: function(e, header) {
        if (header !== this.draggedColumn) {
            header.classList.add('drag-over');
        }
    },

    /**
     * 處理拖曳離開
     */
    handleDragLeave: function(e, header) {
        header.classList.remove('drag-over');
    },

    /**
     * 處理放下
     */
    handleDrop: function(e, header) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        if (this.draggedColumn !== header) {
            const toIndex = this.getHeaderIndex(header);
            // 交換欄位順序
            this.swapColumns(this.draggedIndex, toIndex);
        }

        return false;
    },

    /**
     * 處理拖曳結束
     */
    handleDragEnd: function(e) {
        // 移除所有視覺效果
        this.headerRow.querySelectorAll('.draggable-column').forEach(header => {
            header.classList.remove('dragging', 'drag-over');
        });
    },

    /**
     * 交換兩個欄位的位置（優化版）
     */
    swapColumns: function(fromIndex, toIndex) {
        // 獲取當前欄位順序
        const columnOrder = window.State.getColumnOrder();

        // 交換順序
        const temp = columnOrder[fromIndex];
        columnOrder[fromIndex] = columnOrder[toIndex];
        columnOrder[toIndex] = temp;

        // 更新狀態
        window.State.setColumnOrder(columnOrder);

        // 重新渲染表格（優化版 - 不重新綁定事件）
        this.reorderTableColumns();

        // ✅ 優化：不再重新綁定事件（使用事件委派，無需重新綁定）
        // this.init(); // ← 移除這行，解決性能問題

        // 顯示提示
        window.Renderer.showAlert('欄位順序已更新', 'success');
    },

    /**
     * 根據新的順序重新排列表格欄位（優化版）
     */
    reorderTableColumns: function() {
        const columnOrder = window.State.getColumnOrder();
        const tableBody = document.getElementById('caseTableBody');

        // 使用 DocumentFragment 批量操作 DOM，減少重繪
        const headerFragment = document.createDocumentFragment();
        const headers = Array.from(this.headerRow.querySelectorAll('th'));

        // 重新排序表頭
        columnOrder.forEach(columnKey => {
            const header = headers.find(h => h.dataset.column === columnKey);
            if (header) headerFragment.appendChild(header);
        });

        this.headerRow.innerHTML = '';
        this.headerRow.appendChild(headerFragment);

        // 重新排序表格內容
        const rows = Array.from(tableBody.querySelectorAll('tr'));
        rows.forEach(row => {
            const rowFragment = document.createDocumentFragment();
            const cells = Array.from(row.querySelectorAll('td'));

            columnOrder.forEach(columnKey => {
                const cell = this.getCellByColumnKey(cells, columnKey);
                if (cell) rowFragment.appendChild(cell);
            });

            row.innerHTML = '';
            row.appendChild(rowFragment);
        });
    },

    /**
     * 根據欄位 key 獲取對應的儲存格
     */
    getCellByColumnKey: function(cells, columnKey) {
        // 使用初始順序的映射
        const initialOrder = ['name', 'id', 'category', 'risk', 'date', 'summary', 'actions'];
        const currentOrder = window.State.getColumnOrder();

        // 找到當前欄位在初始順序中的位置
        const initialIndex = initialOrder.indexOf(columnKey);

        // 返回對應位置的儲存格
        return cells[initialIndex];
    }
};
