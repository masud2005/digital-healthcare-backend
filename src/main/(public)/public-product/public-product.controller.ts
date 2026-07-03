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

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiOkResponse({ type: PublicProductDetailsResponseDto })
  findOne(@Param('id') id: string) {
    return this.publicProductService.findOne(id);
  }
}
