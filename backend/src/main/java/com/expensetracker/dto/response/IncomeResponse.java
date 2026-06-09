package com.expensetracker.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncomeResponse {
    private Long id;
    private BigDecimal amount;
    private String source;
    private LocalDate date;
    private String description;
    private LocalDateTime createdAt;
}
