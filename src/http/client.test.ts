import { deepEqual, instance, spy, verify } from "ts-mockito";
import { createHTTPClient } from "./client";

describe("HTTP client", () => {
  let client: NonNullable<Parameters<typeof createHTTPClient>[0]>;
  let httpClient: HTTPClient;

  beforeEach(() => {
    client = spy<typeof client>({
      get: () => Promise.resolve({} as any),
      post: () => Promise.resolve({} as any),
      patch: () => Promise.resolve({} as any),
      delete: () => Promise.resolve({} as any),
      head: () => Promise.resolve({} as any)
    });

    httpClient = createHTTPClient(instance(client));
  });

  it("Verb operations should work", async () => {
    // Setup
    const params = { a: 1, b: 2 };

    // When
    await httpClient.get("", { params });
    await httpClient.post("", {}, { params });
    await httpClient.patch("", {}, { params });
    await httpClient.delete("", { d: 3, e: 4 }, { params });
    await httpClient.head("", { params });

    // Then
    verify(client.get("", deepEqual({ params })));
    verify(client.post("", deepEqual({}), deepEqual({ params })));
    verify(client.patch("", deepEqual({}), deepEqual({ params })));
    verify(client.delete("", deepEqual({ data: { d: 3, e: 4 }, params })));
    verify(client.head("", deepEqual({ params })));
  });
});
