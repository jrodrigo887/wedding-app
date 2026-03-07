export interface SendEmailRequest {
  code: string;
  email: string;
  name: string;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
  messageId: string;
}
