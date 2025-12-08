package com.rolapet.ecommerce.controller;

import com.rolapet.ecommerce.entity.Transaction;
import com.rolapet.ecommerce.security.JwtUtil;
import com.rolapet.ecommerce.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ecommerce/transactions")
@RequiredArgsConstructor
public class TransactionController {
    
    private final TransactionService transactionService;
    private final JwtUtil jwtUtil;
    
    @GetMapping("/my-purchases")
    public ResponseEntity<List<Transaction>> getMyPurchases(
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        List<Transaction> purchases = transactionService.getMyPurchases(userId);
        return ResponseEntity.ok(purchases);
    }
    
    @GetMapping("/my-sales")
    public ResponseEntity<List<Transaction>> getMySales(
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        List<Transaction> sales = transactionService.getMySales(userId);
        return ResponseEntity.ok(sales);
    }
    
    @GetMapping("/last-purchase")
    public ResponseEntity<Transaction> getLastPurchase(
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        Transaction lastPurchase = transactionService.getLastPurchase(userId);
        return ResponseEntity.ok(lastPurchase);
    }
    
    @GetMapping("/last-sale")
    public ResponseEntity<Transaction> getLastSale(
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        Transaction lastSale = transactionService.getLastSale(userId);
        return ResponseEntity.ok(lastSale);
    }
}
