import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicProductService } from './public-product.service';
import { PublicProductDetailsResponseDto, PublicProductResponseDto } from './dto/public-product-response.dto';

@ApiTags('Public Product')
@Controller('public/products')
export class PublicProductController {
  constructor(private readonly publicProductService: PublicProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiOkResponse({ type: [PublicProductResponseDto] })
  findAll() {
    return this.publicProductService.findAll();
  }

  @Get(':identifier')
  @ApiOperation({ summary: 'Get a product by id or slug' })
  @ApiOkResponse({ type: PublicProductDetailsResponseDto })
  findOne(@Param('identifier') identifier: string) {
    return this.publicProductService.findOne(identifier);
  }
}
