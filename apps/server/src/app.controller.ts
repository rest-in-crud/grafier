import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @ApiOperation({
        summary: 'Liveness check',
        description: 'Returns a fixed shape with `status: "ok"` when the server is up.',
    })
    @ApiResponse({
        status: 200,
        description: 'Server is up',
        schema: { example: { status: 'ok' } },
    })
    @Get('health')
    getHealth(): { status: string } {
        return this.appService.getHealth();
    }
}
