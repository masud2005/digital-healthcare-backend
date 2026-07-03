import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttachmentResponseDto } from '@global/attachment/dto/attachment-response.dto';
import { ProductVariantResponseDto } from 'src/main/(admin)/product/dto/product-response.dto';

export class PublicProductCategoryDto {
  @ApiProperty({ example: '7f4145d8-087e-4d33-82bd-0f65d3fbdb4f' })
  id: string;

  @ApiProperty({ example: 'Cardiology' })
  name: string;

  @ApiProperty({ example: 'cardiology' })
  slug: string;
}

export class PublicProductAssessmentDto {
  @ApiProperty({ example: '7f4145d8-087e-4d33-82bd-0f65d3fbdb4f' })
  id: string;

  @ApiProperty({ example: 'Cardiology Assessment' })
  title: string;
}

export class PublicProductResponseDto {
  @ApiProperty({ example: '7f4145d8-087e-4d33-82bd-0f65d3fbdb4f' })
  id: string;

  @ApiProperty({ example: 'Blood Pressure Monitor' })
  title: string;

  @ApiProperty({ example: 'blood-pressure-monitor' })
  slug: string;

  @ApiPropertyOptional({ example: '<p>Description</p>' })
  description: string | null;

  @ApiPropertyOptional({ type: AttachmentResponseDto, nullable: true })
  image: AttachmentResponseDto | null;

  @ApiPropertyOptional({ type: PublicProductCategoryDto, nullable: true })
  category: PublicProductCategoryDto | null;

  @ApiProperty({ type: [PublicProductAssessmentDto] })
  assessments: PublicProductAssessmentDto[];
}

export class PublicProductDetailsResponseDto extends PublicProductResponseDto {
  @ApiProperty({ type: [ProductVariantResponseDto] })
  variants: ProductVariantResponseDto[];
}
