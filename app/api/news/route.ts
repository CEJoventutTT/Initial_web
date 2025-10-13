import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET() {
  const parser = new Parser();
  const feedUrl = 'https://medium.com/feed/@ce.joventut.tt';

  try {
    const feed = await parser.parseURL(feedUrl);
    return NextResponse.json(feed.items);
  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
