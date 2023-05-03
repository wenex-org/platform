import {
  BatchSpanProcessor,
  NodeTracerProvider,
} from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';

export function initTracing() {
  try {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

    const exporter = new OTLPTraceExporter({
      url: `http://${process.env.OTLP_HOST}:${process.env.OTLP_PORT}/v1/traces`,
    });

    const provider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]:
          process.env.OTLP_SERVICE_NAME,
      }),
    });

    provider.addSpanProcessor(new BatchSpanProcessor(new ZipkinExporter()));
    // export spans to opentelemetry collector
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register();

    registerInstrumentations({
      tracerProvider: provider,
      instrumentations: [
        new HttpInstrumentation(),
        new GrpcInstrumentation(),
        new GraphQLInstrumentation(),
        new ExpressInstrumentation(),
        new NestInstrumentation(),
      ],
    });

    const sdk = new NodeSDK({
      traceExporter: exporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();

    console.log('Tracing initialized');

    process.on('SIGTERM', async () => {
      try {
        await sdk.shutdown();

        console.log('Tracing terminated');
      } catch (error) {
        console.log('Error terminating tracing', error);
      } finally {
        process.exit(0);
      }
    });
  } catch (error) {
    console.log('Error initializing tracing', error);
  }
}
