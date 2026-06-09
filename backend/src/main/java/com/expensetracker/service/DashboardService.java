package com.expensetracker.service;

import com.expensetracker.dto.response.DashboardResponse;
import com.expensetracker.dto.response.ExpenseResponse;
import com.expensetracker.dto.response.IncomeResponse;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.IncomeRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private IncomeRepository incomeRepository;
    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private IncomeService incomeService;
    @Autowired private ExpenseService expenseService;

    public DashboardResponse getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        BigDecimal totalIncome = incomeRepository.sumAmountByUserId(user.getId());
        BigDecimal totalExpense = expenseRepository.sumAmountByUserId(user.getId());
        BigDecimal balance = totalIncome.subtract(totalExpense);

        BigDecimal monthlyIncome = incomeRepository
                .sumAmountByUserIdAndMonth(user.getId(), month, year);
        BigDecimal monthlyExpense = expenseRepository
                .sumAmountByUserIdAndMonth(user.getId(), month, year);

        List<IncomeResponse> recentIncomes = incomeRepository
                .findTop5ByUserIdOrderByDateDesc(user.getId())
                .stream().map(incomeService::toResponse).collect(Collectors.toList());

        List<ExpenseResponse> recentExpenses = expenseRepository
                .findTop5ByUserIdOrderByDateDesc(user.getId())
                .stream().map(expenseService::toResponse).collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .monthlyIncome(monthlyIncome)
                .monthlyExpense(monthlyExpense)
                .recentIncomes(recentIncomes)
                .recentExpenses(recentExpenses)
                .build();
    }
}
