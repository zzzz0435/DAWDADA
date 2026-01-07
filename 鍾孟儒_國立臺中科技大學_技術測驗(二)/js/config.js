/**
 * 配置模組
 * 集中管理所有系統配置常數
 */
window.CONFIG = {
    // 風險等級設定
    RISK_LEVELS: {
        HIGH: 'high',
        MEDIUM: 'medium',
        LOW: 'low'
    },

    // 風險等級中文標籤
    RISK_LABELS: {
        high: '高風險',
        medium: '中風險',
        low: '低風險'
    },

    // 風險等級 CSS 類別
    RISK_BADGE_CLASSES: {
        high: 'badge-high',
        medium: 'badge-medium',
        low: 'badge-low'
    },

    // 提示訊息自動關閉時間（毫秒）
    ALERT_AUTO_CLOSE_TIME: 3000,

    // 病歷號正則表達式（英文字母+數字）
    CASE_ID_PATTERN: /^[A-Za-z0-9]+$/,

    // 姓名最大長度
    MAX_NAME_LENGTH: 50,

    // 管理類別最大長度
    MAX_CATEGORY_LENGTH: 50,

    // 摘要最大長度
    MAX_SUMMARY_LENGTH: 500,

    // 追蹤閾值（天數）
    FOLLOW_UP_THRESHOLD_DAYS: 7,

    // 預設起始 ID
    DEFAULT_NEXT_ID: 7
};
