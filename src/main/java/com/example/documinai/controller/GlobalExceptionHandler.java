package com.example.documinai.controller;

import com.example.documinai.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

// Handles exceptions globally across REST controllers.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles exceptions with specific HTTP status codes.
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleStatus(ResponseStatusException ex) {
        int status = ex.getStatusCode().value();
        String message = ex.getReason();

        return ResponseEntity.status(status)
                .body(new ErrorResponse(status, message));
    }

    // Handles unexpected exceptions and returns a generic error response.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAny(Exception ex) {
        return ResponseEntity.status(500)
                .body(new ErrorResponse(
                        500,
                        "Kuch galat ho gaya. Thodi der baad dobara try karo."
                ));
    }
}

