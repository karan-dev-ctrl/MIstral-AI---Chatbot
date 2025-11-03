async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3, backoffMs = 500): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.ok) {
      return response;
    }

    const errorBody = await response.text();

    // Retry on rate limit or capacity errors (429 or messages indicating capacity)
    if (response.status === 429 || errorBody.toLowerCase().includes('capacity')) {
      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, backoffMs * Math.pow(2, attempt)));
        continue; // Retry
      } else {
        throw new Error(`Exceeded retry attempts. Last error: ${errorBody}`);
      }
    } else {
      // For other errors, throw immediately
      throw new Error(`Request failed with status ${response.status}: ${errorBody}`);
    }
  }
  throw new Error('Unexpected error in fetchWithRetry');
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!process.env.MISTRAL_API_KEY) {
      console.error("Mistral API key is not set");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500 }
      );
    }

    const response = await fetchWithRetry('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: messages,
      }),
    });

    console.log('Mistral API response', response)

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Mistral API error after retries:', errorBody);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from Mistral API after retries' }),
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Mistral API response data:', data);

    if (
      !data.choices ||
      !Array.isArray(data.choices) ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      console.error('Unexpected Mistral API response:', data);
      return new Response(
        JSON.stringify({ error: 'Unexpected response structure from Mistral API' }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /api/chat:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500 }
    );
  }
}
