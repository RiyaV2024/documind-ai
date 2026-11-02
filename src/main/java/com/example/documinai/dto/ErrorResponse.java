package com.example.documinai.dto;

public record ErrorResponse(
        int status,
        String message
) {
}
