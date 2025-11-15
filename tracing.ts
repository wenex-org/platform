import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import type { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace-node';
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

type SpanProcessorOnStartArgs = Parameters<SpanProcessor['onStart']>;

const spanKindLabels: Record<number, string> = {
  0: 'INTERNAL',
  1: 'SERVER',
  2: 'CLIENT',
  3: 'PRODUCER',
  4: 'CONSUMER',
};

const loggedSpanKinds = new Set([1, 2, 3, 4]);

class RequestLoggingSpanProcessor implements SpanProcessor {
  onStart(...args: SpanProcessorOnStartArgs): void {
    void args;
  }

  onEnd(span: ReadableSpan): void {
    if (!this.shouldLog(span)) return;

    const attributes = span.attributes ?? {};
    const { traceId, spanId } = span.spanContext();
    const serviceName =
      (span.resource?.attributes?.[ATTR_SERVICE_NAME] as string | undefined) ?? process.env.OTLP_SERVICE_NAME ?? 'unknown-service';

    const method =
      (attributes['http.method'] as string | undefined) ??
      (attributes['rpc.method'] as string | undefined) ??
      (attributes['graphql.operation.name'] as string | undefined) ??
      (attributes['messaging.operation'] as string | undefined);

    const target =
      (attributes['http.route'] as string | undefined) ??
      (attributes['http.target'] as string | undefined) ??
      (attributes['http.url'] as string | undefined) ??
      (attributes['rpc.service'] as string | undefined) ??
      (attributes['messaging.destination'] as string | undefined);

    const host =
      (attributes['http.host'] as string | undefined) ??
      (attributes['net.peer.name'] as string | undefined) ??
      (attributes['net.peer.ip'] as string | undefined);

    const statusCode =
      (attributes['http.status_code'] as number | undefined) ??
      (attributes['rpc.grpc.status_code'] as number | undefined) ??
      span.status?.code;

    const spanKindLabel = spanKindLabels[span.kind] ?? `${span.kind}`;
    const durationMs = this.toMilliseconds(span.duration).toFixed(2);

    const parts = [
      `service=${serviceName}`,
      `kind=${spanKindLabel}`,
      `name=${span.name}`,
      method ? `method=${method}` : undefined,
      target ? `target=${target}` : undefined,
      host ? `host=${host}` : undefined,
      statusCode !== undefined ? `status=${statusCode}` : undefined,
      `duration=${durationMs}ms`,
      `traceId=${traceId}`,
      `spanId=${spanId}`,
    ].filter(Boolean);

    console.log(`[OTEL] ${parts.join(' ')}`);
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  private shouldLog(span: ReadableSpan): boolean {
    if (loggedSpanKinds.has(span.kind)) {
      return true;
    }

    const attributes = span.attributes ?? {};
    return Boolean(
      attributes['http.method'] ||
        attributes['http.url'] ||
        attributes['rpc.method'] ||
        attributes['messaging.system'] ||
        attributes['graphql.operation.name'],
    );
  }

  private toMilliseconds(duration: ReadableSpan['duration']): number {
    return duration[0] * 1_000 + duration[1] / 1_000_000;
  }
}

export const init = (modules: ('http' | 'grpc' | 'kafka' | 'graphql')[]) => {
  if (!process.env.OTLP_SERVICE_NAME) throw Error('OTLP_SERVICE_NAME is required.');

  const exporter = new OTLPTraceExporter({
    url: `http://${process.env.OTLP_HOST}:${process.env.OTLP_PORT}/v1/traces`,
  });

  const resource = new Resource({ [ATTR_SERVICE_NAME]: process.env.OTLP_SERVICE_NAME });
  const spanProcessors: SpanProcessor[] = [new BatchSpanProcessor(exporter), new RequestLoggingSpanProcessor()];

  const instrumentations: Instrumentation[] = [new ExpressInstrumentation(), new NestInstrumentation()];

  if (modules.includes('http')) instrumentations.push(new HttpInstrumentation());
  if (modules.includes('grpc')) instrumentations.push(new GrpcInstrumentation());
  if (modules.includes('kafka')) instrumentations.push(new KafkaJsInstrumentation());
  if (modules.includes('graphql')) instrumentations.push(new GraphQLInstrumentation());

  const sdk = new NodeSDK({
    resource,
    spanProcessors,
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
