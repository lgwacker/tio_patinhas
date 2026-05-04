import { NextRequest, NextResponse } from 'next/server';
import { createQuotesService } from '@/lib/composition-helpers';

// Force dynamic rendering to ensure live quotes are always fetched
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker;

    if (!ticker || ticker.trim().length === 0) {
      return NextResponse.json(
        { error: 'Ticker é obrigatório' },
        { status: 400 }
      );
    }

    const quotesService = createQuotesService();
    const result = await quotesService.fetchQuote(ticker);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to fetch quote',
          ticker: ticker.toUpperCase(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ticker: result.data!.ticker,
      preco: result.data!.preco,
      fonte: result.data!.fonte,
      updated_at: result.data!.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker;
    const body = await request.json();

    if (!ticker || ticker.trim().length === 0) {
      return NextResponse.json(
        { error: 'Ticker é obrigatório' },
        { status: 400 }
      );
    }

    const { preco } = body;

    if (preco === undefined || preco === null) {
      return NextResponse.json(
        { error: 'Preço é obrigatório' },
        { status: 400 }
      );
    }

    if (typeof preco !== 'number' || preco <= 0) {
      return NextResponse.json(
        { error: 'Preço deve ser um número maior que zero' },
        { status: 400 }
      );
    }

    const quotesService = createQuotesService();
    const quoteData = quotesService.setManualPrice(ticker, preco);

    return NextResponse.json({
      ticker: quoteData.ticker,
      preco: quoteData.preco,
      fonte: quoteData.fonte,
      updated_at: quoteData.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error setting manual price:', error);
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
