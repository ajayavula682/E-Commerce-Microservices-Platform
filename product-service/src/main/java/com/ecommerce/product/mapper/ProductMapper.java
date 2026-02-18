package com.ecommerce.product.mapper;

import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    
    Product toEntity(ProductRequest request);
    
    ProductResponse toResponse(Product product);
    
    void updateEntity(@MappingTarget Product product, ProductRequest request);
}
