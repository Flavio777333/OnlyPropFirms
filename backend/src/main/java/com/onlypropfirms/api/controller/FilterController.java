package com.onlypropfirms.api.controller;

import com.onlypropfirms.api.model.PropFirm;
import com.onlypropfirms.api.repository.PropFirmRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/filter-firms")
@CrossOrigin(origins = "*") // Allow all origins for MVP
public class FilterController {

    private final PropFirmRepository repository;

    @Autowired
    public FilterController(PropFirmRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<FilterResponse> filterFirms(@RequestBody FilterRequest request) {
        List<PropFirm> allFirms = repository.findAll();

        // Simple in-memory filtering for MVP (Phase 0)
        // In Phase 1, this should move to a database query
        List<PropFirm> filtered = allFirms.stream()
                .filter(firm -> {
                    if (request.getMinFunding() != null && firm.getMinFunding() > request.getMinFunding())
                        return false;
                    if (request.getPlatform() != null)
                        return true; // TODO: Implement platform check (needs List in entity)
                    return true;
                })
                .collect(Collectors.toList());

        FilterResponse response = new FilterResponse();
        response.setData(filtered);
        response.setMatchCount(filtered.size());

        return ResponseEntity.ok(response);
    }

    @Data
    static class FilterRequest {
        private Integer minFunding;
        private Integer maxFunding;
        private String platform;
    }

    @Data
    static class FilterResponse {
        private List<PropFirm> data;
        private Integer matchCount;
    }
}
