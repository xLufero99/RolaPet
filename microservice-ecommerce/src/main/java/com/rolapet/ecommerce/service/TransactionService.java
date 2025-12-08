package com.rolapet.ecommerce.service;

import com.rolapet.ecommerce.entity.Transaction;
import com.rolapet.ecommerce.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {
    
    private final TransactionRepository transactionRepository;
    
    public List<Transaction> getMyPurchases(String buyerEmail) {
        log.info("Obteniendo compras del usuario: {}", buyerEmail);
        return transactionRepository.findByBuyerEmailOrderByCreatedAtDesc(buyerEmail);
    }
    
    public List<Transaction> getMySales(String sellerEmail) {
        log.info("Obteniendo ventas del usuario: {}", sellerEmail);
        return transactionRepository.findBySellerEmailOrderByCreatedAtDesc(sellerEmail);
    }
    
    public Transaction getLastPurchase(String buyerEmail) {
        log.info("Obteniendo última compra del usuario: {}", buyerEmail);
        return transactionRepository.findFirstByBuyerEmailOrderByCreatedAtDesc(buyerEmail)
                .orElseThrow(() -> new RuntimeException("No se encontraron compras"));
    }
    
    public Transaction getLastSale(String sellerEmail) {
        log.info("Obteniendo última venta del usuario: {}", sellerEmail);
        return transactionRepository.findFirstBySellerEmailOrderByCreatedAtDesc(sellerEmail)
                .orElseThrow(() -> new RuntimeException("No se encontraron ventas"));
    }
    
    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }
}
