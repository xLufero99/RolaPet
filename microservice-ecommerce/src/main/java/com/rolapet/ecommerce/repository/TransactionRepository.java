package com.rolapet.ecommerce.repository;

import com.rolapet.ecommerce.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByBuyerEmailOrderByCreatedAtDesc(String buyerEmail);
    
    List<Transaction> findBySellerEmailOrderByCreatedAtDesc(String sellerEmail);
    
    Optional<Transaction> findFirstByBuyerEmailOrderByCreatedAtDesc(String buyerEmail);
    
    Optional<Transaction> findFirstBySellerEmailOrderByCreatedAtDesc(String sellerEmail);
}
