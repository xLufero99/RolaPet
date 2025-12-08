package com.rolapet.ecommerce.repository;

import com.rolapet.ecommerce.entity.Product;
import com.rolapet.ecommerce.entity.ProductCategory;
import com.rolapet.ecommerce.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    
    List<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status);
    
    List<Product> findByCategoryAndStatusOrderByCreatedAtDesc(ProductCategory category, ProductStatus status);
    
    List<Product> findByTitleContainingIgnoreCaseAndStatusOrderByCreatedAtDesc(String title, ProductStatus status);
    
    List<Product> findByPriceBetweenAndStatusOrderByCreatedAtDesc(BigDecimal minPrice, BigDecimal maxPrice, ProductStatus status);

     List<Product> findByUserEmail(String userEmail);



}
