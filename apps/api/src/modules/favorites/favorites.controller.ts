import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  findAll(@Query('connectionId') connectionId?: string) {
    return this.favoritesService.findAll(
      connectionId ? parseInt(connectionId, 10) : undefined,
    );
  }

  @Post()
  create(@Body() body: any) {
    return this.favoritesService.create(body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.favoritesService.remove(id);
  }
}
