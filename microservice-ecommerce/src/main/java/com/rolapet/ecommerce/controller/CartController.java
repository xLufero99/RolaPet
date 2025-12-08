package com.rolapet.ecommerce.controller;

import com.rolapet.ecommerce.dto.CartItemRequest;
import com.rolapet.ecommerce.dto.CheckoutResponse;
import com.rolapet.ecommerce.entity.CartItem;
import com.rolapet.ecommerce.security.JwtUtil;
import com.rolapet.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ecommerce/cart")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    private final JwtUtil jwtUtil;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyCart(
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        Map<String, Object> cart = cartService.getMyCart(userId);
        return ResponseEntity.ok(cart);
    }
    
    @PostMapping("/items")
    public ResponseEntity<CartItem> addItemToCart(
            @Valid @RequestBody CartItemRequest request,
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        CartItem item = cartService.addItemToCart(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }
    
    @PutMapping("/items/{id}")
    public ResponseEntity<CartItem> updateCartItem(
            @PathVariable Long id,
            @RequestParam Integer quantity,
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        CartItem item = cartService.updateCartItem(id, quantity, userId);
        return ResponseEntity.ok(item);
    }
    
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> removeItemFromCart(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        cartService.removeItemFromCart(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        CheckoutResponse response = cartService.checkout(userId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserIdFromToken(token);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
