package com.expensetracker.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpense;
    private List<IncomeResponse> recentIncomes;
    private List<ExpenseResponse> recentExpenses;
}
