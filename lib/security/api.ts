import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  headers?: HeadersInit;

  constructor(status: number, message: string, options?: { headers?: HeadersInit }) {
    super(message);
    this.status = status;
    this.headers = options?.headers;
  }
}

type ErrorResponseOptions = {
  fallbackMessage: string;
  logLabel?: string;
  defaultStatus?: number;
};

export function toErrorResponse(
  error: unknown,
  { fallbackMessage, logLabel = "api", defaultStatus = 500 }: ErrorResponseOptions,
) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { error: error.message },
      {
        status: error.status,
        headers: error.headers,
      },
    );
  }

  if (error instanceof ZodError || error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (error instanceof Error) {
    console.error(`[${logLabel}] ${error.message}`);
  } else {
    console.error(`[${logLabel}] Unknown error`, error);
  }

  return NextResponse.json({ error: fallbackMessage }, { status: defaultStatus });
}
