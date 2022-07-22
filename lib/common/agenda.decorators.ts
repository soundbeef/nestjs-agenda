import { Inject } from '@nestjs/common';
import { getProcessorToken } from '../agenda-core.module';

export const InjectAgendaProcessor = (name?: string) => Inject(getProcessorToken(name));