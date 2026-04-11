import { Controller, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  get(@Param('key') key: string) {
    return { key, value: this.settingsService.get(key) };
  }

  @Put(':key')
  set(@Param('key') key: string, @Body('value') value: string) {
    return this.settingsService.set(key, value);
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }
}
