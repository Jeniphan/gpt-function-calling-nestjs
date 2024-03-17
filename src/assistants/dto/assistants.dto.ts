import { ApiProperty } from '@nestjs/swagger';

export class ICreateAssistants {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}

export class IRunMessage {
  @ApiProperty()
  threadId: string;

  @ApiProperty()
  assistantId: string;

  @ApiProperty()
  message: string;
}

export interface IOutputFunctionCall {
  tool_call_id: string;
  output: string;
}
