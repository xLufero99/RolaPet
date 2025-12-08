package com.rolapet.ecommerce.dto;

import com.rolapet.ecommerce.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutResponse {
    private String message;
    private List<Transaction> transactions;
}
