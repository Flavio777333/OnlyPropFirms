package com.onlypropfirms.api.controller;

import com.onlypropfirms.api.model.PropFirm;
import com.onlypropfirms.api.repository.PropFirmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/prop-firms")
@CrossOrigin(origins = "*") // Allow all origins for MVP
public class PropFirmController {

    private final PropFirmRepository repository;

    @Autowired
    public PropFirmController(PropFirmRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<PropFirm>> getAllPropFirms() {
        // Return standard JPA findAll results for MVP
        // Pagination to be added in next iteration
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropFirm> getPropFirmById(@PathVariable String id) {
        Optional<PropFirm> firm = repository.findById(id);
        return firm.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
