import { Controller, Post, Body, Get, Sse } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { map, Observable } from 'rxjs';
import { ChatMessage } from './dto/chatMessage.dto';
import { OllamaService } from '../../instrastucture/ollama/ollama.service';

@ApiTags('Chat')
@Controller('chat')
export class GptController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('completion')
  @ApiOperation({ summary: 'Get GPT completion for a given prompt' })
  @ApiBody({
    type: ChatMessage,
    description: 'Chat message containing prompt and model',
  })
  @ApiResponse({
    status: 200,
    description: 'Completion response returned successfully',
    schema: {
      example: {
        response: 'Hello, how can I help you today?',
        model: 'gpt-4',
        created_at: '2025-11-08T12:00:00Z',
        done: true,
      },
    },
  })
  async getCompletion(@Body() chatMessage: ChatMessage) {
    const { prompt, model, fieldId } = chatMessage;
    const response = await this.ollamaService.generateResponse(prompt, model, fieldId);

    return {
      response: response.response,
      model: response.model,
      created_at: response.created_at,
      done: response.done,
    };
  }

  @Post('completion-stream')
  @Sse()
  @ApiOperation({ summary: 'Get GPT completion as a real-time SSE stream' })
  @ApiBody({
    type: ChatMessage,
    description: 'Chat message containing prompt and model',
  })
  @ApiResponse({
    status: 200,
    description: 'Streamed messages returned as SSE',
  })
  @Post('completion-stream')
  @Sse()
  getCompletionStream(
    @Body() chatMessage: ChatMessage,
  ): Observable<MessageEvent> {
    const { prompt, model, fieldId } = chatMessage;

    // @ts-ignore
    return this.ollamaService
      .generateStream(prompt, model, fieldId)
      .pipe(
        map((data) => ({ data: JSON.parse(data.toString()), type: 'message' })),
      );
  }

  @Get('models')
  @ApiOperation({ summary: 'List available GPT models' })
  @ApiResponse({
    status: 200,
    description: 'List of models',
  })
  async getModels() {
    return await this.ollamaService.listModels();
  }
}
