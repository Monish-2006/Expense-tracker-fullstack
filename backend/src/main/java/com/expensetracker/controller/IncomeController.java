package com.expensetracker.controller;

import com.expensetracker.dto.request.IncomeRequest;
import com.expensetracker.dto.response.ApiResponse;
import com.expensetracker.dto.response.IncomeResponse;
import com.expensetracker.service.IncomeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@CrossOrigin(origins = "*")
public class IncomeController {

    @Autowired private IncomeService incomeService;

    @PostMapping
    public ResponseEntity<ApiResponse<IncomeResponse>> addIncome(
            @Valid @RequestBody IncomeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IncomeResponse response = incomeService.addIncome(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Income added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<IncomeResponse>>> getAllIncomes(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<IncomeResponse> incomes = incomeService.getAllIncomes(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(incomes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> getIncomeById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        IncomeResponse response = incomeService.getIncomeById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> updateIncome(
            @PathVariable Long id,
            @Valid @RequestBody IncomeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IncomeResponse response = incomeService.updateIncome(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Income updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIncome(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        incomeService.deleteIncome(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Income deleted successfully", null));
    }
}
