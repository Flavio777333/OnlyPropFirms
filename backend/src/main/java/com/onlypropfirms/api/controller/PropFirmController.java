package com.onlypropfirms.api.controller;

import com.onlypropfirms.api.model.PropFirm;
import com.onlypropfirms.api.repository.PropFirmRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/prop-firms")
@CrossOrigin(origins = "*") // Allow all origins for MVP
@Tag(name = "Prop Firms", description = "API for managing and retrieving proprietary trading firm information")
public class PropFirmController {

    private final PropFirmRepository repository;

    @Autowired
    public PropFirmController(PropFirmRepository repository) {
        this.repository = repository;
    }

    @Operation(
            summary = "Get all prop firms",
            description = "Retrieve a list of all proprietary trading firms in the catalog. Future versions will include pagination and filtering."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved list of prop firms",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = PropFirm.class)
                    )
            )
    })
    @GetMapping
    public ResponseEntity<List<PropFirm>> getAllPropFirms() {
        // Return standard JPA findAll results for MVP
        // Pagination to be added in next iteration
        return ResponseEntity.ok(repository.findAll());
    }

    @Operation(
            summary = "Get prop firm by ID",
            description = "Retrieve detailed information about a specific proprietary trading firm by its unique identifier"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved prop firm",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = PropFirm.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Prop firm not found",
                    content = @Content
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<PropFirm> getPropFirmById(
            @Parameter(description = "Unique identifier of the prop firm (e.g., 'ftmo', 'apex-trader-funding')")
            @PathVariable String id) {
        Optional<PropFirm> firm = repository.findById(id);
        return firm.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
