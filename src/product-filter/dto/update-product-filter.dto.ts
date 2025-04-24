import { PartialType } from '@nestjs/mapped-types';
import { CreateProductFilterDto } from './filter-query.dto';

export class UpdateProductFilterDto extends PartialType(CreateProductFilterDto) {}
