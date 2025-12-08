package com.rolapet.ecommerce.service;

import com.rolapet.ecommerce.entity.Transaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {
    
    public void sendPurchaseConfirmation(Transaction transaction, String buyerEmail, String sellerEmail, String productTitle) {
        // Simulación - Solo log
        log.info("📧 ========== CORREO DE CONFIRMACIÓN ==========");
        log.info("Para: {}", buyerEmail);
        log.info("Asunto: Confirmación de compra - {}", productTitle);
        log.info("Producto: {}", productTitle);
        log.info("Precio Total: ${}", transaction.getTotalPrice());
        log.info("Comprador: {}", transaction.getBuyerEmail());
        log.info("Vendedor: {}", transaction.getSellerEmail());
        log.info("Cantidad: {}", transaction.getQuantity());
        log.info("===========================================");
        
        log.info("📧 ========== CORREO AL VENDEDOR ==========");
        log.info("Para: {}", sellerEmail);
        log.info("Asunto: ¡Nueva venta realizada! - {}", productTitle);
        log.info("Has vendido: {}", productTitle);
        log.info("Cantidad: {}", transaction.getQuantity());
        log.info("Total: ${}", transaction.getTotalPrice());
        log.info("===========================================");
    }
}
