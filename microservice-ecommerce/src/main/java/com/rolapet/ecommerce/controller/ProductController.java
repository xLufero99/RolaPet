package com.rolapet.ecommerce.controller;

import com.rolapet.ecommerce.dto.ProductRequest;
import com.rolapet.ecommerce.entity.Product;
import com.rolapet.ecommerce.entity.ProductCategory;
import com.rolapet.ecommerce.entity.Transaction;
import com.rolapet.ecommerce.entity.ProductStatus;
import com.rolapet.ecommerce.security.JwtUtil;
import com.rolapet.ecommerce.service.EmailService;
import com.rolapet.ecommerce.service.ProductService;
import com.rolapet.ecommerce.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ecommerce/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    private final TransactionService transactionService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    
    @PostMapping
    public ResponseEntity<Product> createProduct(
            @Valid @RequestBody ProductRequest request,
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        Product product = productService.createProduct(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }
    
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search
    ) {
        List<Product> products = productService.getAllProducts(category, minPrice, maxPrice, search);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        Product product = productService.updateProduct(id, request, userId);
        return ResponseEntity.ok(product);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        productService.deleteProduct(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/purchase")
    public ResponseEntity<Transaction> purchaseProduct(
            @PathVariable Long id,
            @RequestParam Integer quantity,
            @RequestHeader("Authorization") String token
    ) {
        Long buyerId = jwtUtil.extractUserIdFromToken(token);
        Product product = productService.getProductById(id);
        
        // Validaciones
        if (product.getUserId().equals(buyerId)) {
            throw new RuntimeException("No puedes comprar tu propio producto");
        }
        
        if (!product.getStatus().equals(ProductStatus.DISPONIBLE)) {
            throw new RuntimeException("El producto no está disponible");
        }
        
        if (product.getStock() < quantity) {
            throw new RuntimeException("Stock insuficiente. Stock disponible: " + product.getStock());
        }
        
        // Crear transacción
        Transaction transaction = new Transaction();
        transaction.setProductId(product.getId());
        transaction.setBuyerId(buyerId);
        transaction.setSellerId(product.getUserId());
        transaction.setQuantity(quantity);
        transaction.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
        transaction.setStatus("COMPLETADA");
        
        Transaction savedTransaction = transactionService.createTransaction(transaction);
        
        // Actualizar stock
        productService.updateStock(product.getId(), quantity);
        
        // Enviar correo de confirmación (mock)
        emailService.sendPurchaseConfirmation(
            savedTransaction,
            "buyer@email.com",
            "seller@email.com",
            product.getTitle()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTransaction);
    }
}
