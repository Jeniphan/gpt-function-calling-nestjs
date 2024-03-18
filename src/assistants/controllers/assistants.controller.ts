import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import ApiResponse from '../../lib/api_response';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ICreateAssistants, IRunMessage } from '../dto/assistants.dto';
import { AssistantsService } from '../services/assistants.service';
import { generateJsonSchema } from '../../helper/json_schema_ts';

@Controller('chat')
@ApiTags('assistants')
export class AssistantsController {
  constructor(protected assistansService: AssistantsService) {}

  @Post('/create-assistant')
  async CrateAssistants(
    @Res() res: Response,
    @Body() payload: ICreateAssistants,
  ) {
    try {
      const id = await this.assistansService.CreateAssistants(payload);
      return new ApiResponse(res).handle('success', id, 200);
    } catch (e) {
      return new ApiResponse(res).error(e);
    }
  }

  @Post('/create-threads')
  async CrateThread(@Res() res: Response) {
    try {
      const id = await this.assistansService.CreateThread();
      return new ApiResponse(res).handle('success', id, 200);
    } catch (e) {
      return new ApiResponse(res).error(e);
    }
  }

  @Post('/message')
  async RunMessage(@Res() res: Response, @Body() payload: IRunMessage) {
    try {
      const result = await this.assistansService.AddMessage(
        payload.threadId,
        payload.assistantId,
        payload.message,
      );
      return new ApiResponse(res).handle('success', result, 200);
    } catch (e) {
      return new ApiResponse(res).error(e);
    }
  }

  @Get('generate-json')
  async GenerateJson(@Res() res: Response) {
    try {
      const result = generateJsonSchema(
        './src/helper/openai_function_calling.ts',
        'IOpenAiFunctionCalling',
      );
      return new ApiResponse(res).handle('success', result, 200);
    } catch (e) {
      return new ApiResponse(res).error(e);
    }
  }
}
