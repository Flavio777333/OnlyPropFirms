package com.onlypropfirms.api.repository;

import com.onlypropfirms.api.model.PropFirm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropFirmRepository extends JpaRepository<PropFirm, String> {
    // Custom queries can be added here
    // e.g. List<PropFirm> findByMinFundingLessThanEqual(Integer funding);
}
