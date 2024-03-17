import { Injectable } from '@nestjs/common';
import { ICreateAssistants, IOutputFunctionCall } from '../dto/assistants.dto';
import { Openai } from '../../lib/openai';
import {
  AssistantUpdateParams,
  ThreadCreateAndRunParams,
} from 'openai/resources/beta';
import { FunctionCallingGpt } from '../../helper/openai_function_calling';

@Injectable()
export class AssistantsService {
  private openAi = new Openai();
  private functionCalling = new FunctionCallingGpt();

  async CreateAssistants(payload: ICreateAssistants): Promise<string> {
    const tools: (
      | ThreadCreateAndRunParams.AssistantToolsCode
      | AssistantUpdateParams.AssistantToolsFunction
      | AssistantUpdateParams.AssistantToolsRetrieval
    )[] = [
      { type: 'code_interpreter' },
      { type: 'retrieval' },
      {
        type: 'function',
        function: {
          name: 'GetWeather',
          description: 'Determine weather in my location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state e.g. San Francisco, CA',
              },
              unit: {
                type: 'string',
                enum: ['c', 'f'],
              },
            },
            required: ['location'],
          },
        },
      },
    ];
    return await this.openAi.CreateAssistant(
      payload.name,
      payload.description,
      tools,
    );
  }

  async CreateThread(): Promise<string> {
    return await this.openAi.CreateThreads();
  }

  async AddMessage(threadId: string, assistantId: string, message: string) {
    //Add message to Thread
    await this.openAi.AddMessageToThreads(message, threadId);

    //Run Threads
    let run = await this.openAi.RunThreads(assistantId, threadId);

    //Await Threads To Process
    run = await this.openAi.AwaitingThreads(run);

    if (run.status === 'requires_action') {
      const tool_outputs: IOutputFunctionCall[] = [];
      for (const tools of run.required_action.submit_tool_outputs.tool_calls) {
        const output = await this.openAi.CallFunctions<
          FunctionCallingGpt,
          keyof FunctionCallingGpt
        >(
          this.functionCalling,
          tools.function.name as keyof FunctionCallingGpt,
          JSON.parse(tools.function.arguments),
        );
        tool_outputs.push({
          tool_call_id: tools.id,
          output: JSON.stringify(output),
        });
      }
      //Submit output
      console.log(tool_outputs);
      run = await this.openAi.SubmitToolOutputs(run, threadId, tool_outputs);
      //Await Threads To Process
      run = await this.openAi.AwaitingThreads(run);
    }

    if (run.status !== 'cancelled' && run.status !== 'cancelling') {
      const messages = await this.openAi.ListMessage(run.thread_id);
      return messages.data.reverse();
    } else {
      return run.last_error;
    }
  }
}
