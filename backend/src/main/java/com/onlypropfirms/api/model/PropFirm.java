package com.onlypropfirms.api.model;

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
public class PropFirm {

    @Id
    private String id; // e.g., "apex-trader"

    @Column(nullable = false)
    private String name;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "profit_split")
    private String profitSplit; // "90/10"

    @Column(name = "min_funding")
    private Integer minFunding;

    @Column(name = "max_funding")
    private Integer maxFunding;

    @Column(name = "evaluation_fee")
    private BigDecimal evaluationFee;

    private BigDecimal rating; // 4.8

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "is_featured")
    private Boolean isFeatured;

    @Column(name = "affiliate_link")
    private String affiliateLink;

    @Column(name = "affiliate_code")
    private String affiliateCode;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
}
