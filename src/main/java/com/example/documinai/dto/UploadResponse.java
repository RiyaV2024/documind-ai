package com.example.documinai.dto;
public record UploadResponse(
        String fileName,
        int totalPages,
        int totalCharacters,
        String  preview
){
}
