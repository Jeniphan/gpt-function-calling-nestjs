import OpenAI from 'openai';
import {
  AssistantCreateParams,
  AssistantUpdateParams,
  ThreadCreateAndRunParams,
} from 'openai/resources/beta';
import { IOutputFunctionCall } from '../assistants/dto/assistants.dto';
import AssistantToolsCode = ThreadCreateAndRunParams.AssistantToolsCode;
import AssistantToolsFunction = AssistantUpdateParams.AssistantToolsFunction;
import AssistantToolsRetrieval = AssistantUpdateParams.AssistantToolsRetrieval;

export class Openai {
  openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });

  async CreateAssistant(
    name: string,
    instructions: string,
    tools?: (
      | AssistantToolsCode
      | AssistantToolsFunction
      | AssistantToolsRetrieval
    )[],
  ): Promise<string> {
    const body: AssistantCreateParams = {
      name,
      instructions,
      tools: tools,
      model: process.env.OPENAI_MODEL,
    };
    const assistants = await this.openAi.beta.assistants.create(body);
    return assistants.id;
  }

  async CreateThreads(): Promise<string> {
    const thread = await this.openAi.beta.threads.create();
    return thread.id;
  }

  async AddMessageToThreads(message: string, threadId: string) {
    await this.openAi.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });
  }

  async RunThreads(
    assistantId: string,
    threadId: string,
    instructions?: string,
  ): Promise<OpenAI.Beta.Threads.Runs.Run> {
    return this.openAi.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      instructions: instructions,
    });
  }

  async AwaitingThreads(
    run: OpenAI.Beta.Threads.Runs.Run,
  ): Promise<OpenAI.Beta.Threads.Runs.Run> {
    while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
      run = await this.openAi.beta.threads.runs.retrieve(run.thread_id, run.id);
    }

    return run;
  }

  async SubmitToolOutputs(
    run: OpenAI.Beta.Threads.Runs.Run,
    threadId: string,
    toolOutput: IOutputFunctionCall[],
  ): Promise<OpenAI.Beta.Threads.Runs.Run> {
    run = await this.openAi.beta.threads.runs.submitToolOutputs(
      threadId,
      run.id,
      {
        tool_outputs: toolOutput,
      },
    );

    return this.AwaitingThreads(run);
  }

  async CallFunctions<T, K extends keyof T>(
    instance: T,
    methodName: K,
    parameter: { [key: string]: any },
  ): Promise<any> {
    if (typeof instance[methodName] === 'function') {
      return await (instance[methodName] as any)(...Object.values(parameter));
    } else {
      throw new Error(
        `'${String(methodName)}' is not a method of the provided instance.`,
      );
    }
  }

  async ListMessage(threadId: string) {
    return this.openAi.beta.threads.messages.list(threadId);
  }

  // const parameter = JSON.parse(functionFormGPT.function.arguments);
  // console.log(functions);
}
