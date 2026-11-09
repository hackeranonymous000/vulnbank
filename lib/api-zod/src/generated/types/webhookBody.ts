import type { WebhookBodyPayload } from "./webhookBodyPayload";

export interface WebhookBody {
  url: string;
  event: string;
  payload?: WebhookBodyPayload;
}
