import { NextResponse } from 'next/server';

export async function POST(request) {
  const { url } = await request.json();
  try {
    const response = await fetch('http://localhost:3001/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while scraping', message: error.message }, { status: 500 });
  }
}