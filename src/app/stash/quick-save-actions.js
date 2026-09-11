'use server'

import * as cheerio from 'cheerio'

// B1: Quick Save — tenta extrair título, imagem, preço e domínio
// de um link colado pelo usuário, para exibir uma prévia antes
// de confirmar o cadastro. É best-effort: nem todo site expõe
// essas informações via meta tags Open Graph, então falhas aqui
// devem cair de volta para o cadastro manual.
export async function fetchLinkPreview(url) {
  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    return { status: 'error', message: 'URL inválida.' }
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        // Alguns sites bloqueiam requisições sem User-Agent de navegador.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      return { status: 'error', message: 'Não foi possível acessar esse link.' }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      null

    const image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      null

    // Preço: best-effort via meta tags comuns de e-commerce.
    // Se não achar, o usuário preenche na mão na prévia.
    const priceRaw =
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="og:price:amount"]').attr('content') ||
      $('[itemprop="price"]').attr('content') ||
      null

    const price = priceRaw ? Number(priceRaw.replace(',', '.')) : null

    return {
      status: 'success',
      title: title?.trim() || null,
      image: image || null,
      price: Number.isFinite(price) ? price : null,
      domain: parsedUrl.hostname.replace(/^www\./, ''),
      url: parsedUrl.toString(),
    }
  } catch (error) {
    console.error('[fetchLinkPreview] erro:', error)
    return { status: 'error', message: 'Não conseguimos extrair os dados desse link.' }
  }
}
