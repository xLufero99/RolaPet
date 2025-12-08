package com.rolapet.ecommerce.service;

import com.rolapet.ecommerce.dto.CartItemRequest;
import com.rolapet.ecommerce.dto.CheckoutResponse;
import com.rolapet.ecommerce.entity.*;
import com.rolapet.ecommerce.repository.CartItemRepository;
import com.rolapet.ecommerce.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final TransactionService transactionService;
    private final EmailService emailService;
    
    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });
    }
    
    public Map<String, Object> getMyCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        
        // Calcular total
        BigDecimal total = BigDecimal.ZERO;
        List<Map<String, Object>> itemsWithDetails = new ArrayList<>();
        
        for (CartItem item : items) {
            try {
                Product product = productService.getProductById(item.getProductId());
                BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(itemTotal);
                
                Map<String, Object> itemDetail = new HashMap<>();
                itemDetail.put("cartItemId", item.getId());
                itemDetail.put("product", product);
                itemDetail.put("quantity", item.getQuantity());
                itemDetail.put("itemTotal", itemTotal);
                itemsWithDetails.add(itemDetail);
            } catch (Exception e) {
                log.warn("Producto no encontrado para item: {}", item.getProductId());
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("cart", cart);
        result.put("items", itemsWithDetails);
        result.put("total", total);
        
        return result;
    }
    
    @Transactional
    public CartItem addItemToCart(Long userId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productService.getProductById(request.getProductId());
        
        // Validaciones
        if (product.getUserId().equals(userId)) {
            throw new RuntimeException("No puedes comprar tu propio producto");
        }
        
        if (!product.getStatus().equals(ProductStatus.DISPONIBLE)) {
            throw new RuntimeException("El producto no está disponible");
        }
        
        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Stock insuficiente. Stock disponible: " + product.getStock());
        }
        
        // Verificar si el producto ya está en el carrito
        return cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId())
                .map(existingItem -> {
                    int newQuantity = existingItem.getQuantity() + request.getQuantity();
                    if (product.getStock() < newQuantity) {
                        throw new RuntimeException("Stock insuficiente. Stock disponible: " + product.getStock());
                    }
                    existingItem.setQuantity(newQuantity);
                    return cartItemRepository.save(existingItem);
                })
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCartId(cart.getId());
                    newItem.setProductId(request.getProductId());
                    newItem.setQuantity(request.getQuantity());
                    return cartItemRepository.save(newItem);
                });
    }
    
    @Transactional
    public CartItem updateCartItem(Long itemId, Integer quantity, Long userId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado en el carrito"));
        
        Cart cart = cartRepository.findById(item.getCartId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
        
        if (!cart.getUserId().equals(userId)) {
            throw new RuntimeException("No tienes permiso para modificar este carrito");
        }
        
        Product product = productService.getProductById(item.getProductId());
        
        if (product.getStock() < quantity) {
            throw new RuntimeException("Stock insuficiente. Stock disponible: " + product.getStock());
        }
        
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }
    
    @Transactional
    public void removeItemFromCart(Long itemId, Long userId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado en el carrito"));
        
        Cart cart = cartRepository.findById(item.getCartId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
        
        if (!cart.getUserId().equals(userId)) {
            throw new RuntimeException("No tienes permiso para modificar este carrito");
        }
        
        cartItemRepository.delete(item);
    }
    
    @Transactional
    public CheckoutResponse checkout(Long userId) {
        Cart cart = getOrCreateCart(userId);
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        
        if (items.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }
        
        List<Transaction> transactions = new ArrayList<>();
        
        // Procesar cada item del carrito
        for (CartItem item : items) {
            Product product = productService.getProductById(item.getProductId());
            
            // Validaciones
            if (!product.getStatus().equals(ProductStatus.DISPONIBLE)) {
                throw new RuntimeException("El producto " + product.getTitle() + " no está disponible");
            }
            
            if (product.getStock() < item.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para " + product.getTitle() + 
                        ". Disponible: " + product.getStock());
            }
            
            // Crear transacción
            Transaction transaction = new Transaction();
            transaction.setProductId(product.getId());
            transaction.setBuyerId(userId);
            transaction.setSellerId(product.getUserId());
            transaction.setQuantity(item.getQuantity());
            transaction.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            transaction.setStatus("COMPLETADA");
            
            Transaction savedTransaction = transactionService.createTransaction(transaction);
            transactions.add(savedTransaction);
            
            // Actualizar stock
            productService.updateStock(product.getId(), item.getQuantity());
            
            // Enviar correo de confirmación (mock)
            emailService.sendPurchaseConfirmation(
                savedTransaction,
                "buyer@email.com", // En producción, obtener del servicio de usuarios
                "seller@email.com", // En producción, obtener del servicio de usuarios
                product.getTitle()
            );
        }
        
        // Vaciar carrito
        cartItemRepository.deleteByCartId(cart.getId());
        
        CheckoutResponse response = new CheckoutResponse();
        response.setMessage("Compra realizada exitosamente");
        response.setTransactions(transactions);
        
        return response;
    }
    
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
    }
}
