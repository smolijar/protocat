---
title: Metadata
---

## Metadata in gRPC

Metadata in gRPC are an equivalent of HTTP headers: schema-less map of strings client and server add to their data.

There are three types of metadata:

1. **(client) Metadata** - Sent with the request
1. **(server) Initial metadata** - Sent on request received
1. **(server) Trailing metadata** - Sent on response with status code

Read more in official [docs](https://grpc.io/docs/what-is-grpc/core-concepts/)

## Client metadata

Initial metadata is sent by a client on each call and received by the server immediately. It is a direct equivalent of request headers from HTTP.

In the service handler you can access it from `call.metadata` for reading.

`call.metadata` is the original `Metadata` instance. Sometimes it is too verbose. You can use `call.meta` for simple object access!

## Initial metadata

Initial metadata is sent to client on each call. Along with trailing metadata, initial metadata has the role of HTTP response headers.

It can be accessed via `call.initialMetadata` for read and update.

Initial metadata can be dispatched before the response is actually sent. To explicitly push the metadata to client, use `call.flushInitialMetadata()`, after which you can no longer change it nor send it again. For single-response types (unary, client streaming), if you don't call it manually, it will be called for you when the handlers are finished, so you can just set the values.

For server streaming calls (server-stream and bidi), you must always send the metadata manually.

:::caution

When calling `call.flushInitialMetadata` in server streaming calls in a handler, it is guaranteed that all middlewares "opening blocks" (before awaiting `next`) were called, but not necessarily the "closing blocks". Meaning if you set metadata in middleware after awaiting `next` and flush metadata in handler for server streaming calls without delaying execution, they will be probably send before the middleware sets them.

:::

If an error occurs and the handler fails, existing metadata are sent and received as if the call succeeded.

## Trailing metadata

Trailing metadata is sent to the client with status code, when response was sent or response stream has ended. Sending is always implicit.

Available via `call.trailingMetadata`.

If an error occurs, the trailing metadata are automatically sent to client with the status code.

Initial and trailing metadata make more conceptual sense in streaming calls. Two types seem redundant only in unary calls, where typically both are sent and received "at the same time".

:::note

Since trailing metadata is received along with the status, it is sometimes called _status metadata_.

:::
