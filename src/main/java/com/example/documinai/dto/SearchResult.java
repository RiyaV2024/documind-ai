package com.example.documinai.dto;

public record SearchResult(
        String text,
        Object page,
        Object fileName
) {
}
