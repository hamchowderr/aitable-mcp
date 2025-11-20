// Type declarations for fetch API to ensure compatibility
declare global {
  interface RequestInit {
    method?: string;
    headers?: Record<string, string> | Headers;
    body?: any;
  }

  interface Response {
    json<T = any>(): Promise<T>;
  }
}

export {};
