package com.expensetracker.service;

import com.expensetracker.dto.request.IncomeRequest;
import com.expensetracker.dto.response.IncomeResponse;
import com.expensetracker.entity.Income;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.exception.UnauthorizedException;
import com.expensetracker.repository.IncomeRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncomeService {

    @Autowired private IncomeRepository incomeRepository;
    @Autowired private UserRepository userRepository;

    public IncomeResponse addIncome(IncomeRequest request, String email) {
        User user = getUser(email);
        Income income = Income.builder()
                .amount(request.getAmount())
                .source(request.getSource())
                .date(request.getDate())
                .description(request.getDescription())
                .user(user)
                .build();
        return toResponse(incomeRepository.save(income));
    }

    public IncomeResponse updateIncome(Long id, IncomeRequest request, String email) {
        Income income = getIncomeAndValidateOwner(id, email);
        income.setAmount(request.getAmount());
        income.setSource(request.getSource());
        income.setDate(request.getDate());
        income.setDescription(request.getDescription());
        return toResponse(incomeRepository.save(income));
    }

    public void deleteIncome(Long id, String email) {
        Income income = getIncomeAndValidateOwner(id, email);
        incomeRepository.delete(income);
    }

    public List<IncomeResponse> getAllIncomes(String email) {
        User user = getUser(email);
        return incomeRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public IncomeResponse getIncomeById(Long id, String email) {
        return toResponse(getIncomeAndValidateOwner(id, email));
    }

    // ── Helpers ──────────────────────────────────────────────────

    private Income getIncomeAndValidateOwner(Long id, String email) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found with id: " + id));
        if (!income.getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("You don't have permission to access this resource");
        }
        return income;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public IncomeResponse toResponse(Income income) {
        return IncomeResponse.builder()
                .id(income.getId())
                .amount(income.getAmount())
                .source(income.getSource())
                .date(income.getDate())
                .description(income.getDescription())
                .createdAt(income.getCreatedAt())
                .build();
    }
}
