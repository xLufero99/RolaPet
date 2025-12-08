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
    
    public List<Transaction> getMyPurchases(Long buyerId) {
        log.info("Obteniendo compras del usuario: {}", buyerId);
        return transactionRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
    }
    
    public List<Transaction> getMySales(Long sellerId) {
        log.info("Obteniendo ventas del usuario: {}", sellerId);
        return transactionRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
    }
    
    public Transaction getLastPurchase(Long buyerId) {
        log.info("Obteniendo última compra del usuario: {}", buyerId);
        return transactionRepository.findFirstByBuyerIdOrderByCreatedAtDesc(buyerId)
                .orElseThrow(() -> new RuntimeException("No se encontraron compras"));
    }
    
    public Transaction getLastSale(Long sellerId) {
        log.info("Obteniendo última venta del usuario: {}", sellerId);
        return transactionRepository.findFirstBySellerIdOrderByCreatedAtDesc(sellerId)
                .orElseThrow(() -> new RuntimeException("No se encontraron ventas"));
    }
    
    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }
}
