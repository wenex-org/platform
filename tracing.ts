import {
  SimpleSpanProcessor,
  NodeTracerProvider,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { KafkaJsInstrumentation } from 'opentelemetry-instrumentation-kafkajs';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { NODE_ENV } from '@app/common/configs';

export const initTracing = async (modules: ('http' | 'grpc' | 'kafka')[]) => {
  const exporter = new OTLPTraceExporter({
    url: `http://${process.env.OTLP_HOST}:${process.env.OTLP_PORT}/v1/traces`,
  });

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTLP_SERVICE_NAME,
    }),
  });

  const SpanProcessor = NODE_ENV().IS_PRODUCTION
    ? BatchSpanProcessor
    : SimpleSpanProcessor;

  if (NODE_ENV().IS_PRODUCTION)
    provider.addSpanProcessor(
      new SpanProcessor(new ZipkinExporter({ url: process.env.ZIPKIN_URL })),
    );
  // export spans to opentelemetry collector
  else provider.addSpanProcessor(new SpanProcessor(exporter));

  const instrumentations: Instrumentation[] = [
    new ExpressInstrumentation(),
    new NestInstrumentation(),
  ];

  if (modules.includes('http'))
    instrumentations.push(new HttpInstrumentation());
  if (modules.includes('grpc'))
    instrumentations.push(new GrpcInstrumentation());
  if (modules.includes('kafka'))
    instrumentations.push(new KafkaJsInstrumentation());

  provider.register();
  const sdk = new NodeSDK({
    traceExporter: exporter,
    instrumentations: [...instrumentations, getNodeAutoInstrumentations()],
  });

  try {
    await sdk.start();

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
};
