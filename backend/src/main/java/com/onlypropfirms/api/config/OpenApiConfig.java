package com.onlypropfirms.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger Configuration
 *
 * Provides interactive API documentation at:
 * - Swagger UI: http://localhost:8081/swagger-ui.html
 * - OpenAPI JSON: http://localhost:8081/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI onlyPropFirmsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("OnlyPropFirms API")
                        .description("REST API for OnlyPropFirms - Find the best prop trading firms with real-time pricing intelligence")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("OnlyPropFirms Development Team")
                                .url("https://github.com/Flavio777333/OnlyPropFirms"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort + "/api/v1")
                                .description("Local Development Server"),
                        new Server()
                                .url("https://api.onlypropfirms.com/api/v1")
                                .description("Production Server (Future)")));
    }
}
