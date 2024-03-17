import { Module } from '@nestjs/common';
import { AssistantsController } from './controllers/assistants.controller';
import { AssistantsService } from './services/assistants.service';

@Module({
  controllers: [AssistantsController],
  providers: [AssistantsService],
})
export class AssistantsModule {}
