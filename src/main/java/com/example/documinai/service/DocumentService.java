package com.example.documinai.service;

import com.example.documinai.dto.DocumentInfo;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentService {

    private final JdbcTemplate jdbcTemplate;
    private final VectorStore vectorStore;

    // Constructor injection for database and vector store dependencies.
    public DocumentService(JdbcTemplate jdbcTemplate, VectorStore vectorStore) {
        this.jdbcTemplate = jdbcTemplate;
        this.vectorStore = vectorStore;
    }

    // Returns all uploaded PDF files with their chunk counts.
    public List<DocumentInfo> list() {
        String sql = "SELECT metadata->>'file_name' AS file_name, COUNT(*) AS chunks "
                + "FROM vector_store GROUP BY 1";

        return jdbcTemplate.query(sql, (rs, i) -> new DocumentInfo(
                rs.getString("file_name"),
                rs.getInt("chunks")
        ));
    }

    // Checks whether a PDF exists in the vector database.
    public boolean exists(String fileName) {
        String sql = "SELECT COUNT(*) FROM vector_store WHERE metadata->>'file_name' = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, fileName);
        return count != null && count > 0;
    }

    // Deletes all vector chunks associated with the given PDF.
    public void deleteByFileName(String fileName) {
        Filter.Expression sameFile = new FilterExpressionBuilder()
                .eq("file_name", fileName)
                .build();

        vectorStore.delete(sameFile);
    }
}

