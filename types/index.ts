import { Config } from '@verdaccio/types';

export interface CustomConfig extends Config {
  baseURL: string;
}
