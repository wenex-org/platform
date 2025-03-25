import { NodeTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { KafkaJsInstrumentation } from 'opentelemetry-instrumentation-kafkajs';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';

export const initTracing = (modules: ('http' | 'grpc' | 'kafka' | 'graphql')[]) => {
  const exporter = new OTLPTraceExporter({
    url: `http://${process.env.OTLP_HOST}:${process.env.OTLP_PORT}/v1/traces`,
  });

  const provider = new NodeTracerProvider({
    resource: new Resource({ [ATTR_SERVICE_NAME]: process.env.OTLP_SERVICE_NAME }),
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  const instrumentations: Instrumentation[] = [new ExpressInstrumentation(), new NestInstrumentation()];

  if (modules.includes('http')) instrumentations.push(new HttpInstrumentation());
  if (modules.includes('grpc')) instrumentations.push(new GrpcInstrumentation());
  if (modules.includes('kafka')) instrumentations.push(new KafkaJsInstrumentation());
  if (modules.includes('graphql')) instrumentations.push(new GraphQLInstrumentation());

  provider.register();
  const sdk = new NodeSDK({
    traceExporter: exporter,
    instrumentations: [...instrumentations, getNodeAutoInstrumentations()],
  });

  try {
    sdk.start();

    console.log('Tracing initialized');

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
};
