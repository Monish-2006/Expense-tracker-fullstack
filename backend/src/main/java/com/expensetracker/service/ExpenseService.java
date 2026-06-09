package com.expensetracker.service;

import com.expensetracker.dto.request.ExpenseRequest;
import com.expensetracker.dto.response.ExpenseResponse;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.exception.UnauthorizedException;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private UserRepository userRepository;

    public ExpenseResponse addExpense(ExpenseRequest request, String email) {
        User user = getUser(email);
        Expense expense = Expense.builder()
                .amount(request.getAmount())
                .category(request.getCategory())
                .date(request.getDate())
                .description(request.getDescription())
                .user(user)
                .build();
        return toResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request, String email) {
        Expense expense = getExpenseAndValidateOwner(id, email);
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long id, String email) {
        Expense expense = getExpenseAndValidateOwner(id, email);
        expenseRepository.delete(expense);
    }

    public List<ExpenseResponse> getAllExpenses(String email) {
        User user = getUser(email);
        return expenseRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ExpenseResponse getExpenseById(Long id, String email) {
        return toResponse(getExpenseAndValidateOwner(id, email));
    }

    // ── Helpers ──────────────────────────────────────────────────

    private Expense getExpenseAndValidateOwner(Long id, String email) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        if (!expense.getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("You don't have permission to access this resource");
        }
        return expense;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .date(expense.getDate())
                .description(expense.getDescription())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
