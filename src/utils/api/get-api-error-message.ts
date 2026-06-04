type ValidationDetailItem = {
  msg?: string;
};

type ErrorResponseBody = {
  detail?: string | ValidationDetailItem[] | unknown;
  message?: string;
};

const RESPONSE_ERROR_GENERIC = "Response returned an error code";

function hasResponse(error: unknown): error is { response: Response } {
  return typeof error === "object" && error !== null && "response" in error;
}

async function readErrorBody(error: { response: Response }): Promise<string | null> {
  try {
    const body = (await error.response.clone().json()) as ErrorResponseBody;

    if (typeof body.detail === "string" && body.detail.trim()) {
      return body.detail.trim();
    }

    if (Array.isArray(body.detail)) {
      const messages = body.detail
        .map((item) => {
          if (typeof item?.msg !== "string" || !item.msg.trim()) return null;
          return item.msg.trim();
        })
        .filter((msg): msg is string => Boolean(msg));

      if (messages.length > 0) return messages.join("; ");
    }

    if (typeof body.message === "string" && body.message.trim()) {
      return body.message.trim();
    }
  } catch {
    // response body is not JSON or already consumed
  }

  return null;
}

function readErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error) || !error.message.trim()) return null;
  if (error.message.trim() === RESPONSE_ERROR_GENERIC) return null;
  return error.message.trim();
}

export async function getApiErrorMessage(
  error: unknown,
  fallback = "Unknown error"
): Promise<string> {
  if (hasResponse(error)) {
    const fromBody = await readErrorBody(error);
    if (fromBody) return fromBody;
  }

  return readErrorMessage(error) ?? fallback;
}
