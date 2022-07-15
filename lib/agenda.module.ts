import { Module, DynamicModule, Provider } from '@nestjs/common';
import { AgendaModuleOptions, AgendaModuleAsyncOptions, AgendaOptionsFactory } from './interfaces';
import { AGENDA_MODULE_OPTIONS } from './agenda.constants';
import { Agenda } from '@hokify/agenda';

function createAgendaProvider(options: AgendaModuleOptions): any[] {
  return [{ provide: AGENDA_MODULE_OPTIONS, useValue: options || {} }];
}

export class AgendaService extends Agenda {}

@Module({
  providers: [
    {
      provide: AgendaService,
      useFactory: async (options: AgendaModuleOptions) => {
        const agenda = new Agenda(options);

        async function graceful() {
            await agenda.stop();
            process.exit(0);
        }

        process.on('SIGTERM', graceful);
        process.on('SIGINT', graceful);

        await agenda.start();
        return agenda;
      },
      inject: [AGENDA_MODULE_OPTIONS],
    },
  ],
  exports: [AgendaService],
})
export class AgendaModule {
  static register(options: AgendaModuleOptions): DynamicModule {
    return {
      module: AgendaModule,
      providers: createAgendaProvider(options),
    };
  }

  static registerAsync(options: AgendaModuleAsyncOptions): DynamicModule {
    return {
      module: AgendaModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(options: AgendaModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: AgendaModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: AGENDA_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: AGENDA_MODULE_OPTIONS,
      // tslint:disable-next-line:max-line-length
      useFactory: async (optionsFactory: AgendaOptionsFactory) => await optionsFactory.createAgendaOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

}
