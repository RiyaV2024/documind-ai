package com.example.documinai.dto;

import java.util.List;

public record AnswerResponse(
        String answer,
        List<SearchResult> sources
) {
}
