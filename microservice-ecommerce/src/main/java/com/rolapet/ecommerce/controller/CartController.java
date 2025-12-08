package com.rolapet.ecommerce.controller;

import com.rolapet.ecommerce.dto.CartItemRequest;
import com.rolapet.ecommerce.dto.CheckoutResponse;
import com.rolapet.ecommerce.entity.CartItem;
import com.rolapet.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ecommerce/cart")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyCart(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails.getUsername();
        Map<String, Object> cart = cartService.getMyCart(userEmail);
        return ResponseEntity.ok(cart);
    }
    
    @PostMapping("/items")
    public ResponseEntity<CartItem> addItemToCart(
            @Valid @RequestBody CartItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails.getUsername();
        CartItem item = cartService.addItemToCart(userEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }
    
    @PutMapping("/items/{id}")
    public ResponseEntity<CartItem> updateCartItem(
            @PathVariable Long id,
            @RequestParam Integer quantity,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails.getUsername();
        CartItem item = cartService.updateCartItem(id, quantity, userEmail);
        return ResponseEntity.ok(item);
    }
    
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> removeItemFromCart(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails.getUsername();
        cartService.removeItemFromCart(id, userEmail);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails.getUsername();
        CheckoutResponse response = cartService.checkout(userEmail);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userEmail = userDetails.getUsername();
        cartService.clearCart(userEmail);
        return ResponseEntity.noContent().build();
    }
}
