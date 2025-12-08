package com.rolapet.ecommerce.controller;

import com.rolapet.ecommerce.entity.Transaction;
import com.rolapet.ecommerce.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ecommerce/transactions")
@RequiredArgsConstructor
public class TransactionController {
    
    private final TransactionService transactionService;
    
    @GetMapping("/my-purchases")
    public ResponseEntity<List<Transaction>> getMyPurchases(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails.getUsername();
        List<Transaction> purchases = transactionService.getMyPurchases(userEmail);
        return ResponseEntity.ok(purchases);
    }
    
    @GetMapping("/my-sales")
    public ResponseEntity<List<Transaction>> getMySales(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails.getUsername();
        List<Transaction> sales = transactionService.getMySales(userEmail);
        return ResponseEntity.ok(sales);
    }
    
    @GetMapping("/last-purchase")
    public ResponseEntity<Transaction> getLastPurchase(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails.getUsername();
        Transaction lastPurchase = transactionService.getLastPurchase(userEmail);
        return ResponseEntity.ok(lastPurchase);
    }
    
    @GetMapping("/last-sale")
    public ResponseEntity<Transaction> getLastSale(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails.getUsername();
        Transaction lastSale = transactionService.getLastSale(userEmail);
        return ResponseEntity.ok(lastSale);
    }
}
