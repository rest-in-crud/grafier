import { Module } from '@nestjs/common';
import { DesignsService } from './designs.service';
import { DesignsController } from './designs.controller';
import { SharedDesignsController } from './shared-designs.controller';
import { ProjectsAliasController } from './projects-alias.controller';
import { TemplatesAliasController } from './templates-alias.controller';

@Module({
    controllers: [
        DesignsController,
        SharedDesignsController,
        ProjectsAliasController,
        TemplatesAliasController,
    ],
    providers: [DesignsService],
    exports: [DesignsService],
})
export class DesignsModule {}
