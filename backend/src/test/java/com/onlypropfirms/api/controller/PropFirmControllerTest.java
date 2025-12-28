package com.onlypropfirms.api.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.onlypropfirms.api.repository.PropFirmRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.hamcrest.Matchers.hasSize;

@WebMvcTest(PropFirmController.class)
public class PropFirmControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PropFirmRepository propFirmRepository;

    @Test
    public void getAllPropFirms_ShouldReturnList() throws Exception {
        // Mocking the repository behavior
        java.util.List<com.onlypropfirms.api.model.PropFirm> mockFirms = new java.util.ArrayList<>();
        mockFirms.add(new com.onlypropfirms.api.model.PropFirm());
        mockFirms.add(new com.onlypropfirms.api.model.PropFirm());
        mockFirms.add(new com.onlypropfirms.api.model.PropFirm());

        org.mockito.Mockito.when(propFirmRepository.findAll()).thenReturn(mockFirms);

        mockMvc.perform(get("/api/v1/prop-firms")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3))); // Expecting 3 mock firms from stub
    }
}
