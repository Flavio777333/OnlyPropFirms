package com.onlypropfirms.api.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "prop_firms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Proprietary Trading Firm entity representing a funded trader program")
public class PropFirm {

    @Id
    @Schema(description = "Unique identifier (slug) for the prop firm", example = "ftmo")
    private String id;

    @Column(nullable = false)
    @Schema(description = "Display name of the prop firm", example = "FTMO")
    private String name;

    @Column(name = "logo_url")
    @Schema(description = "URL to the firm's logo image", example = "https://cdn.onlypropfirms.com/logos/ftmo.png")
    private String logoUrl;

    @Column(name = "website_url")
    @Schema(description = "Official website URL", example = "https://ftmo.com")
    private String websiteUrl;

    @Column(name = "profit_split")
    @Schema(description = "Profit sharing ratio (Trader/Firm)", example = "90/10")
    private String profitSplit;

    @Column(name = "min_funding")
    @Schema(description = "Minimum funded account size in USD", example = "10000")
    private Integer minFunding;

    @Column(name = "max_funding")
    @Schema(description = "Maximum funded account size in USD", example = "200000")
    private Integer maxFunding;

    @Column(name = "evaluation_fee")
    @Schema(description = "Typical evaluation/challenge fee", example = "155.00")
    private BigDecimal evaluationFee;

    @Schema(description = "Average user rating (0-5)", example = "4.8")
    private BigDecimal rating;

    @Column(name = "review_count")
    @Schema(description = "Number of user reviews", example = "1247")
    private Integer reviewCount;

    @Column(name = "is_featured")
    @Schema(description = "Whether this firm is featured/promoted", example = "true")
    private Boolean isFeatured;

    @Column(name = "affiliate_link")
    @Schema(description = "Affiliate tracking URL")
    private String affiliateLink;

    @Column(name = "affiliate_code")
    @Schema(description = "Affiliate code for commission tracking")
    private String affiliateCode;

    @Column(name = "created_at")
    @Schema(description = "Timestamp when the record was created", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @Schema(description = "Timestamp when the record was last updated", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
}
