import { Agenda } from '@hokify/agenda';
import { DynamicModule, Global, Inject, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AGENDA_MODULE_OPTIONS, AGENDA_PROCESSOR_NAME, DEFAULT_PROCESSOR_NAME } from './agenda.constants';
import { AgendaModuleAsyncOptions, AgendaModuleOptions, AgendaOptionsFactory } from './interfaces';

export function getProcessorToken(name?: string) {
    return name && name !== DEFAULT_PROCESSOR_NAME
      ? name
      : DEFAULT_PROCESSOR_NAME;
  }

@Global()
@Module({})
export class AgendaCoreModule implements OnApplicationShutdown {
    constructor(
        @Inject(AGENDA_PROCESSOR_NAME) private readonly processorName: string,
        private readonly moduleRef: ModuleRef
    ) {}

    static forRoot(options: AgendaModuleOptions): DynamicModule {
        const { name } = options;
        const agendaProcessorName = getProcessorToken(name);

        const agendaNameProvider = {
            provide: AGENDA_PROCESSOR_NAME,
            useValue: agendaProcessorName,
        };

        const agendaProvider = {
            provide: agendaProcessorName,
            async useFactory() {
                const agenda = new Agenda(options);
                agenda.name(agendaProcessorName);
                await agenda.start();
                return agenda;
            }
        };

        return {
            module: AgendaCoreModule,
            providers: [agendaProvider, agendaNameProvider],
            exports: [agendaProvider]
        };
    }

    static forRootAsync(options: AgendaModuleAsyncOptions): DynamicModule {
        const { name } = options;
        const agendaProcessorName = getProcessorToken(name);

        const agendaNameProvider = {
            provide: AGENDA_PROCESSOR_NAME,
            useValue: agendaProcessorName,
        };

        const agendaProvider = {
            provide: agendaProcessorName,
            async useFactory(options: AgendaModuleOptions) {
                const agenda = new Agenda(options);
                agenda.name(agendaProcessorName);
                await agenda.start();
                return agenda;
            },
            inject: [AGENDA_MODULE_OPTIONS]
        };

        const asyncProviders = this.createAsyncProviders(options);
        return {
            module: AgendaCoreModule,
            imports: options.imports,
            providers: [...asyncProviders, agendaProvider, agendaNameProvider],
            exports: [agendaProvider]
        };
    }

    async onApplicationShutdown(_signal?: string) {
        const agenda = this.moduleRef.get<Agenda>(this.processorName);
        if (agenda) {
            await agenda.stop();
        }
    }

    private static createAsyncProviders(options: AgendaModuleAsyncOptions): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass
            }
        ];
    }

    private static createAsyncOptionsProvider(options: AgendaModuleAsyncOptions): Provider {
        if (options.useFactory) {
            return {
                provide: AGENDA_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        }
        return {
            provide: AGENDA_MODULE_OPTIONS,
            useFactory: async (optionsFactory: AgendaOptionsFactory) => await optionsFactory.createAgendaOptions(),
            inject: [options.useExisting || options.useClass]
        };
    }
}
