import { AuthProvider } from '@app/common/providers/auth';
import { CareerProvider } from '@app/common/providers/career';
import { ConjointProvider } from '@app/common/providers/conjoint';
import { ContentProvider } from '@app/common/providers/content';
import { ContextProvider } from '@app/common/providers/context';
import { DomainProvider } from '@app/common/providers/domain';
import { EssentialProvider } from '@app/common/providers/essential';
import { FinancialProvider } from '@app/common/providers/financial';
import { GeneralProvider } from '@app/common/providers/general';
import { IdentityProvider } from '@app/common/providers/identity';
import { LogisticProvider } from '@app/common/providers/logistic';
import { SpecialProvider } from '@app/common/providers/special';
import { TouchProvider } from '@app/common/providers/touch';
import { HealthCheckOptions } from '@app/module/health';

import { AuthModule } from './auth';
import { ContextModule } from './context';
import { DomainModule } from './domain';
import { EssentialModule } from './essential';
import { FinancialModule } from './financial';
import { GeneralModule } from './general';
import { IdentityModule } from './identity';
import { SpecialModule } from './special';
import { TouchModule } from './touch';
import { ContentModule } from './content';
import { LogisticModule } from './logistic';
import { ConjointModule } from './conjoint';
import { CareerModule } from './career';

export const HEALTH_CHECK_OPTIONS: HealthCheckOptions = [
  {
    type: 'grpc',
    service: 'gateway',
    options: [
      AuthProvider,
      CareerProvider,
      ConjointProvider,
      ContentProvider,
      ContextProvider,
      DomainProvider,
      EssentialProvider,
      FinancialProvider,
      GeneralProvider,
      IdentityProvider,
      LogisticProvider,
      SpecialProvider,
      TouchProvider,
    ],
  },
] as const;

export const MODULES = [
  AuthModule,
  ContextModule,
  DomainModule,
  EssentialModule,
  FinancialModule,
  GeneralModule,
  IdentityModule,
  SpecialModule,
  TouchModule,
  ContentModule,
  LogisticModule,
  ConjointModule,
  CareerModule,
] as const;
