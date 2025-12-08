package com.rolapet.ecommerce.service;

import com.rolapet.ecommerce.dto.ProductRequest;
import com.rolapet.ecommerce.entity.Product;
import com.rolapet.ecommerce.entity.ProductCategory;
import com.rolapet.ecommerce.entity.ProductStatus;
import com.rolapet.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    
    private final ProductRepository productRepository;
    
    @Transactional
    public Product createProduct(ProductRequest request, String userEmail) {
        log.info("Creando producto para usuario: {}", userEmail);
        
        Product product = new Product();
        product.setUserEmail(userEmail);
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(request.getCategory());
        product.setStock(request.getStock());
        product.setStatus(request.getStock() > 0 ? ProductStatus.DISPONIBLE : ProductStatus.AGOTADO);
        
        return productRepository.save(product);
    }
    
    public List<Product> getAllProducts(ProductCategory category, BigDecimal minPrice, BigDecimal maxPrice, String search) {
        log.info("Listando productos con filtros - category: {}, minPrice: {}, maxPrice: {}, search: {}", 
                category, minPrice, maxPrice, search);
        
        // Si hay búsqueda por título
        if (search != null && !search.isEmpty()) {
            return productRepository.findByTitleContainingIgnoreCaseAndStatusOrderByCreatedAtDesc(search, ProductStatus.DISPONIBLE);
        }
        
        // Si hay filtro por categoría
        if (category != null) {
            return productRepository.findByCategoryAndStatusOrderByCreatedAtDesc(category, ProductStatus.DISPONIBLE);
        }
        
        // Si hay filtro por precio
        if (minPrice != null && maxPrice != null) {
            return productRepository.findByPriceBetweenAndStatusOrderByCreatedAtDesc(minPrice, maxPrice, ProductStatus.DISPONIBLE);
        }
        
        // Por defecto, todos los productos disponibles
        return productRepository.findByStatusOrderByCreatedAtDesc(ProductStatus.DISPONIBLE);
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }
    
    @Transactional
    public Product updateProduct(Long id, ProductRequest request, String userEmail) {
        Product product = getProductById(id);
        
        // Validar que el usuario es el vendedor
        if (!product.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("No tienes permiso para editar este producto");
        }
        
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(request.getCategory());
        product.setStock(request.getStock());
        product.setStatus(request.getStock() > 0 ? ProductStatus.DISPONIBLE : ProductStatus.AGOTADO);
        
        return productRepository.save(product);
    }
    
    @Transactional
    public void deleteProduct(Long id, String userEmail) {
        Product product = getProductById(id);
        
        // Validar que el usuario es el vendedor
        if (!product.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("No tienes permiso para eliminar este producto");
        }
        
        productRepository.delete(product);
    }
    
    @Transactional
    public void updateStock(Long productId, Integer quantity) {
        Product product = getProductById(productId);
        int newStock = product.getStock() - quantity;
        
        if (newStock < 0) {
            throw new RuntimeException("Stock insuficiente");
        }
        
        product.setStock(newStock);
        if (newStock == 0) {
            product.setStatus(ProductStatus.AGOTADO);
        }
        
        productRepository.save(product);
    }
}
