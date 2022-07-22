import { Module, DynamicModule } from '@nestjs/common';
import { AgendaModuleAsyncOptions, AgendaModuleOptions } from './interfaces';
import { AgendaCoreModule } from './agenda-core.module';

@Module({})
export class AgendaModule {
    static forRoot(options: AgendaModuleOptions = {}): DynamicModule {
        return {
            module: AgendaModule,
            imports: [AgendaCoreModule.forRoot(options)]
        };
    }

    static forRootAsync(options: AgendaModuleAsyncOptions = {}): DynamicModule {
        return {
            module: AgendaModule,
            imports: [AgendaCoreModule.forRootAsync(options)]
        };
    }

    static forFeature(name: string, options: AgendaModuleOptions = {}): DynamicModule {
        options.name = name;
        return {
            module: AgendaModule,
            imports: [AgendaCoreModule.forRoot(options)]
        };
    }

    static forFeatureAsync(name: string, options: AgendaModuleAsyncOptions = {}): DynamicModule {
        options.name = name;
        return {
            module: AgendaModule,
            imports: [AgendaCoreModule.forRootAsync(options)]
        };
    }
}