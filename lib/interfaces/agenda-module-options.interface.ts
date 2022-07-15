import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { IDatabaseOptions, IDbConfig, IMongoOptions } from '@hokify/agenda';
import { ForkOptions } from 'child_process';

// Hacking this for now because @hokify/agenda doesn't expose the config type
export type AgendaModuleOptions = {
    name?: string;
    defaultConcurrency?: number;
    processEvery?: string | number;
    maxConcurrency?: number;
    defaultLockLimit?: number;
    lockLimit?: number;
    defaultLockLifetime?: number;
} & (IDatabaseOptions | IMongoOptions | {}) & IDbConfig & {
    forkHelper?: {
        path: string;
        options?: ForkOptions;
    };
    forkedWorker?: boolean;
}
export interface AgendaOptionsFactory {
  createAgendaOptions(): Promise<AgendaModuleOptions> | AgendaModuleOptions;
}

export interface AgendaModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AgendaOptionsFactory>;
  useClass?: Type<AgendaOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<AgendaModuleOptions> | AgendaModuleOptions;
  inject?: any[];
}
