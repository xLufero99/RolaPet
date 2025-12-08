package com.rolapet.ecommerce.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String userEmail; // Email del vendedor
    
    @Column(nullable = false)
    private String title; // Nombre del producto
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(length = 500)
    private String imageUrl; // URL de Azure Blob Storage
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category; // SERVICIO, INSUMO
    
    @Column(nullable = false)
    private Integer stock;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status; // DISPONIBLE, AGOTADO, PAUSADO
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
