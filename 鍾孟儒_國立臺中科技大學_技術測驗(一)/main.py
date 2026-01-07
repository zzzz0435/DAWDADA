from typing import Dict, List, Tuple
import math


# ===========================
# 常量定義區 (Configuration)
# ===========================

# 滲液量有效值集合
VALID_EXUDATE_LEVELS = {"None", "Light", "Moderate", "Heavy"}

# Critical 狀態判斷閾值
CRITICAL_WOUND_AREA_THRESHOLD = 5      # cm²
CRITICAL_PAIN_LEVEL_THRESHOLD = 7      # 0-10 scale

# Good 狀態判斷閾值
GOOD_WOUND_AREA_THRESHOLD = 2          # cm²
GOOD_PAIN_LEVEL_THRESHOLD = 3          # 0-10 scale


# ===========================
# 輸入驗證層 (Validation Layer)
# ===========================

def validate_inputs(wound_area, pain_level, exudate_level) -> Tuple[bool, str, float, float, str]:
    """
    驗證傷口評估輸入參數的有效性

    此函數執行三層驗證：
    1. 型別驗證：確保可轉換為正確型別
    2. 數值驗證：確保數值在合理範圍內
    3. 業務驗證：確保符合醫療業務規則

    Args:
        wound_area: 傷口面積（應為 >= 0 的數字）
        pain_level: 疼痛等級（應為 0~10 的整數或浮點數）
        exudate_level: 滲液量（應為 None/Light/Moderate/Heavy 其中之一，大小寫不敏感，會自動去除前後空白）

    Returns:
        Tuple[bool, str, float, float, str]: (驗證是否通過, 錯誤訊息, 轉換後的面積, 轉換後的疼痛等級, 正規化後的滲液量)
        - 若驗證通過：(True, "", wound_area_float, pain_level_float, exudate_level_normalized)
        - 若驗證失敗：(False, "錯誤訊息", 0.0, 0.0, "")
    """
    # ===== 驗證 woundArea =====
    # 必須為數字且 >= 0
    try:
        wound_area_float = float(wound_area)
    except (TypeError, ValueError):
        return False, "woundArea 必須為數字", 0.0, 0.0, ""

    # 檢查是否為有限數值（排除 inf, -inf, nan）
    if not math.isfinite(wound_area_float):
        return False, "woundArea 必須為有限數值", 0.0, 0.0, ""

    # 檢查非負數
    if wound_area_float < 0:
        return False, "woundArea 不可為負數", 0.0, 0.0, ""

    # ===== 驗證 painLevel =====
    # 必須為 0~10 範圍內的數字
    try:
        pain_level_float = float(pain_level)
    except (TypeError, ValueError):
        return False, "painLevel 必須為數字", 0.0, 0.0, ""

    # 檢查是否為有限數值
    if not math.isfinite(pain_level_float):
        return False, "painLevel 必須為有限數值", 0.0, 0.0, ""

    # 檢查範圍 [0, 10]
    if pain_level_float < 0 or pain_level_float > 10:
        return False, "painLevel 超出範圍（0~10）", 0.0, 0.0, ""

    # ===== 驗證 exudateLevel =====
    # 必須為預定義的有效值之一
    if not isinstance(exudate_level, str):
        return False, "exudateLevel 必須為字串（None/Light/Moderate/Heavy）", 0.0, 0.0, ""

    # 檢查非空（去除前後空白後）
    exudate_level_stripped = exudate_level.strip()
    if not exudate_level_stripped:
        return False, "exudateLevel 不可為空", 0.0, 0.0, ""

    # 正規化：首字母大寫，其餘小寫（例如：light -> Light, HEAVY -> Heavy）
    exudate_level_normalized = exudate_level_stripped.capitalize()

    # 檢查是否在有效值集合中
    if exudate_level_normalized not in VALID_EXUDATE_LEVELS:
        return False, "exudateLevel 不在允許值（None/Light/Moderate/Heavy）", 0.0, 0.0, ""

    # 所有驗證通過
    return True, "", wound_area_float, pain_level_float, exudate_level_normalized


# ===========================
# 業務邏輯層 (Business Logic Layer)
# ===========================

def assess(wound_area: float, pain_level: float, exudate_level: str) -> Dict[str, object]:
    """
    根據傷口指標進行風險評估

    評估採用三級分類系統：
    1. Critical（警示）：任一高風險指標觸發即判定為 Critical
    2. Good（良好）：所有指標皆在理想範圍內
    3. Warning（需注意）：介於上述兩者之間的狀態

    判斷標準：
    - Critical: 面積 > 5cm² OR 疼痛 > 7 OR 滲液 = Heavy
    - Good: 面積 < 2cm² AND 疼痛 < 3 AND 滲液 = None/Light
    - Warning: 其他情況

    Args:
        wound_area: 傷口面積（cm²），已通過驗證的浮點數
        pain_level: 疼痛等級（0-10），已通過驗證的浮點數
        exudate_level: 滲液量（None/Light/Moderate/Heavy），已通過驗證的字串

    Returns:
        Dict: 包含以下鍵值
            - status (str): 評估狀態 (Good/Warning/Critical)
            - reasons (List[str]): 判斷理由清單
            - advice (str): 照護建議
    """
    reasons: List[str] = []

    # ========================================
    # 第一優先：檢查 Critical 狀態（任一條件符合即觸發）
    # ========================================
    if wound_area > CRITICAL_WOUND_AREA_THRESHOLD:
        reasons.append(f"傷口面積大於 {CRITICAL_WOUND_AREA_THRESHOLD} cm²")

    if pain_level > CRITICAL_PAIN_LEVEL_THRESHOLD:
        reasons.append(f"疼痛等級高於 {CRITICAL_PAIN_LEVEL_THRESHOLD}")

    if exudate_level == "Heavy":
        reasons.append("滲液量為 Heavy")

    # 若有任何 Critical 條件觸發，立即返回 Critical 狀態
    if reasons:
        return {
            "status": "Critical",
            "reasons": reasons,
            "advice": "傷口屬高風險狀態，建議儘速由專業醫療人員進行評估。"
        }

    # ========================================
    # 第二優先：檢查 Good 狀態（所有條件必須同時符合）
    # ========================================
    is_area_good = wound_area < GOOD_WOUND_AREA_THRESHOLD
    is_pain_good = pain_level < GOOD_PAIN_LEVEL_THRESHOLD
    is_exudate_good = exudate_level in ("None", "Light")

    if is_area_good and is_pain_good and is_exudate_good:
        return {
            "status": "Good",
            "reasons": ["指標皆在穩定範圍"],
            "advice": "目前傷口狀況穩定，建議持續基本清潔與定期觀察。"
        }

    # ========================================
    # 預設：Warning 狀態（介於 Good 和 Critical 之間）
    # ========================================
    return {
        "status": "Warning",
        "reasons": ["介於 Good 與 Critical 之間，需持續追蹤"],
        "advice": "傷口狀況需注意，建議增加觀察頻率並留意疼痛與滲液變化。"
    }


# ===========================
# 輸出格式化層 (Output Formatting Layer)
# ===========================

def format_error_output(error_message: str) -> str:
    """
    格式化錯誤訊息輸出

    Args:
        error_message: 錯誤訊息文字

    Returns:
        str: 格式化後的錯誤訊息（簡潔清晰的文字格式）
    """
    lines = [
        "評估狀態：Input Error",
        f"原因：{error_message}",
        "照護建議：輸入資料不正確，請確認數值與格式後重新輸入。"
    ]
    return "\n".join(lines)


def format_assessment_output(result: Dict[str, object]) -> str:
    """
    格式化評估結果輸出

    Args:
        result: assess() 函數返回的評估結果，包含 status, reasons, advice

    Returns:
        str: 格式化後的評估結果（簡潔清晰的文字格式）
    """
    lines = [
        f"評估狀態：{result['status']}",
        "判斷理由："
    ]

    # 添加所有判斷理由（使用項目符號）
    for reason in result["reasons"]:
        lines.append(f"  - {reason}")

    # 添加照護建議
    lines.append(f"照護建議：{result['advice']}")

    return "\n".join(lines)


# ===========================
# API 介面層 (API Interface Layer)
# ===========================

def assess_wound_api(wound_area, pain_level, exudate_level) -> Dict[str, object]:
    """
    傷口評估統一 API 介面

    此函數為系統的主要入口點，整合了輸入驗證和業務邏輯評估。
    採用標準化的返回格式，便於外部系統整合。

    處理流程：
    1. 呼叫 validate_inputs() 驗證輸入參數
    2. 若驗證失敗，返回錯誤訊息
    3. 若驗證成功，呼叫 assess() 進行評估
    4. 返回標準化的評估結果

    Args:
        wound_area: 傷口面積（任意型別，會進行驗證轉換）
        pain_level: 疼痛等級（任意型別，會進行驗證轉換）
        exudate_level: 滲液量（任意型別，會進行驗證）

    Returns:
        Dict: 標準化的 API 返回格式
            成功時：
                {
                    "success": True,
                    "data": {
                        "status": str,      # Good/Warning/Critical
                        "reasons": List[str],
                        "advice": str
                    }
                }
            失敗時：
                {
                    "success": False,
                    "error": str            # 錯誤訊息
                }
    """
    # 步驟 1: 輸入驗證
    is_valid, error_msg, wound_area_validated, pain_level_validated, exudate_level_validated = \
        validate_inputs(wound_area, pain_level, exudate_level)

    # 步驟 2: 驗證失敗處理
    if not is_valid:
        return {
            "success": False,
            "error": error_msg
        }

    # 步驟 3: 執行業務邏輯評估（使用正規化後的 exudate_level）
    assessment_result = assess(wound_area_validated, pain_level_validated, exudate_level_validated)

    # 步驟 4: 返回成功結果
    return {
        "success": True,
        "data": assessment_result
    }


# ===========================
# 執行控制層 (Execution Control Layer)
# ===========================

def run_single_case(wound_area, pain_level, exudate_level) -> None:
    """
    執行單個評估案例並輸出結果到 Console

    此函數負責呼叫 API、接收結果並格式化輸出。
    根據評估成功或失敗，選擇對應的輸出格式。

    Args:
        wound_area: 傷口面積（任意型別）
        pain_level: 疼痛等級（任意型別）
        exudate_level: 滲液量（任意型別）

    Returns:
        None（結果直接輸出到標準輸出）
    """
    # 呼叫 API 進行評估
    api_result = assess_wound_api(wound_area, pain_level, exudate_level)

    # 根據成功或失敗選擇輸出格式
    if not api_result["success"]:
        # 輸入驗證失敗：輸出錯誤訊息
        print(format_error_output(api_result["error"]))
    else:
        # 評估成功：輸出評估結果
        print(format_assessment_output(api_result["data"]))


# ===========================
# 測試資料層 (Test Data Layer)
# ===========================

def get_test_cases() -> List[Dict[str, object]]:
    """
    獲取完整的測試案例資料集

    測試案例涵蓋三大類別：
    1. 正常案例：測試三種評估狀態（Good/Warning/Critical）的典型情況
    2. 邊界值測試：測試閾值邊界的處理（等於 vs 大於/小於）
    3. 異常輸入：測試輸入驗證的健壯性

    Returns:
        List[Dict]: 測試案例列表，每個案例為包含 woundArea, painLevel, exudateLevel 的字典
    """
    return [
        # =====================================
        # 第一類：正常案例（5 個）
        # =====================================
        {"woundArea": 1.5, "painLevel": 2, "exudateLevel": "None"},
        # 預期: Good（面積 1.5 < 2, 疼痛 2 < 3, 滲液 None）

        {"woundArea": 3.0, "painLevel": 4, "exudateLevel": "Light"},
        # 預期: Warning（面積 3 介於 2~5 之間）

        {"woundArea": 6.0, "painLevel": 2, "exudateLevel": "Moderate"},
        # 預期: Critical（面積 6 > 5）

        {"woundArea": 1.0, "painLevel": 8, "exudateLevel": "None"},
        # 預期: Critical（疼痛 8 > 7）

        {"woundArea": 2.0, "painLevel": 3, "exudateLevel": "Heavy"},
        # 預期: Critical（滲液為 Heavy）

        # =====================================
        # 第二類：邊界值測試（8 個）
        # =====================================
        {"woundArea": 5.0, "painLevel": 2, "exudateLevel": "None"},
        # 預期: Warning（面積 = 5，不觸發 Critical 的 > 5 條件）

        {"woundArea": 5.01, "painLevel": 2, "exudateLevel": "None"},
        # 預期: Critical（面積 5.01 > 5，剛好觸發）

        {"woundArea": 2.0, "painLevel": 7, "exudateLevel": "None"},
        # 預期: Warning（疼痛 = 7，不觸發 Critical 的 > 7 條件）

        {"woundArea": 2.0, "painLevel": 7.01, "exudateLevel": "None"},
        # 預期: Critical（疼痛 7.01 > 7，剛好觸發）

        {"woundArea": 2.0, "painLevel": 3, "exudateLevel": "Light"},
        # 預期: Warning（疼痛 = 3，不符合 Good 的 < 3 條件）

        {"woundArea": 2.0, "painLevel": 2.99, "exudateLevel": "Light"},
        # 預期: Good（疼痛 2.99 < 3，剛好符合）

        {"woundArea": 0, "painLevel": 0, "exudateLevel": "None"},
        # 預期: Good（最小邊界值）

        {"woundArea": 0, "painLevel": 10, "exudateLevel": "Heavy"},
        # 預期: Critical（疼痛 = 10 最大值，滲液 Heavy，多重觸發）

        # =====================================
        # 第三類：異常輸入測試（7 個）
        # =====================================
        {"woundArea": -1, "painLevel": 2, "exudateLevel": "None"},
        # 預期: Input Error（負數面積）

        {"woundArea": 1, "painLevel": 11, "exudateLevel": "None"},
        # 預期: Input Error（疼痛 > 10）

        {"woundArea": 1, "painLevel": -1, "exudateLevel": "None"},
        # 預期: Input Error（疼痛 < 0）

        {"woundArea": 1, "painLevel": 2, "exudateLevel": "HIGH"},
        # 預期: Input Error（無效的滲液值）

        {"woundArea": "abc", "painLevel": 2, "exudateLevel": "None"},
        # 預期: Input Error（非數字字串）

        {"woundArea": 1, "painLevel": "xyz", "exudateLevel": "None"},
        # 預期: Input Error（非數字字串）

        {"woundArea": float('inf'), "painLevel": 2, "exudateLevel": "None"},
        # 預期: Input Error（無限值）
    ]


def run_all_tests() -> None:
    """
    執行所有內建測試案例

    此函數負責批次執行所有測試案例並輸出結果。
    測試案例包含正常案例、邊界值測試和異常輸入。
    """
    test_cases = get_test_cases()
    total_cases = len(test_cases)

    # 輸出測試開始標題
    print("=" * 70)
    print("開始執行內建測試案例")
    print(f"總計 {total_cases} 個案例")
    print("=" * 70)

    # 逐一執行每個測試案例
    for case_index, test_case in enumerate(test_cases, start=1):
        print(f"\n[測試案例 {case_index}/{total_cases}]")
        print(f"輸入: woundArea={test_case['woundArea']}, " +
              f"painLevel={test_case['painLevel']}, " +
              f"exudateLevel={test_case['exudateLevel']}")
        print("-" * 70)

        # 執行評估並輸出結果
        run_single_case(
            test_case["woundArea"],
            test_case["painLevel"],
            test_case["exudateLevel"]
        )

    # 輸出測試完成標題
    print("\n" + "=" * 70)
    print(f"測試完成 (共執行 {total_cases} 個案例)")
    print("=" * 70)


def run_interactive_mode() -> None:
    """
    執行互動式輸入模式

    此函數提供使用者介面，允許手動輸入評估資料並獲得即時結果。
    適合用於單筆資料的快速評估或測試。
    """
    # 輸出互動模式標題
    print("\n" + "=" * 70)
    print("互動式輸入模式")
    print("=" * 70)

    # 輸出參數說明
    print("\n請輸入傷口評估資料：")
    print("  - woundArea: 傷口面積（cm²），須為非負數")
    print("  - painLevel: 疼痛等級（0-10），0 表示無痛，10 表示極痛")
    print("  - exudateLevel: 滲液量，可選值為 None/Light/Moderate/Heavy")
    print()

    # 接收使用者輸入
    wound_area_input = input("請輸入 woundArea: ").strip()
    pain_level_input = input("請輸入 painLevel: ").strip()
    exudate_level_input = input("請輸入 exudateLevel: ").strip()

    # 輸出分隔線
    print("\n" + "-" * 70)
    print("評估結果：")
    print("-" * 70)

    # 執行評估並輸出結果
    run_single_case(wound_area_input, pain_level_input, exudate_level_input)


# ===========================
# 主程式進入點 (Main Entry Point)
# ===========================

def main():
    """
    主程式進入點

    執行流程：
    1. 先執行所有內建測試案例（20 個）
    2. 再進入互動式輸入模式，供使用者手動測試

    異常處理：
    - KeyboardInterrupt: 使用者中斷（Ctrl+C）
    - Exception: 其他未預期的錯誤
    """
    try:
        # 步驟 1: 執行內建測試案例
        run_all_tests()

        # 步驟 2: 進入互動式輸入模式
        run_interactive_mode()

    except KeyboardInterrupt:
        # 使用者按下 Ctrl+C 中斷程式
        print("\n\n程式已被使用者中斷")

    except Exception as error:
        # 捕獲其他未預期的錯誤
        print(f"\n發生未預期的錯誤：{error}")
        import traceback
        traceback.print_exc()


# 程式進入點：僅在直接執行此檔案時才執行 main()
if __name__ == "__main__":
    main()
