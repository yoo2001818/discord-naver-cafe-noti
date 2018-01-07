import cheerio from 'cheerio';
import encoding from 'encoding';
import { ARTICLE_LIST_URL } from './config';

export default async function fetchArticles(request, cafeId) {
  let buffer = await request({
    url: ARTICLE_LIST_URL,
    qs: {
      'search.clubid': cafeId,
      'search.boardtype': 'L',
    },
    encoding: null,
  });
  let body = encoding.convert(buffer, 'utf-8', 'euc-kr').toString();
  let $ = cheerio.load(body);
  let articleList = $(
    '[name="ArticleList"] > table > tbody > tr:nth-child(2n+1)',
  )
    .map((i, el) => ({
      id: parseInt($(el).children('td:nth-child(1)').text(), 10),
      title: $(el).children('td:nth-child(2)').find('.m-tcol-c').text(),
      author: $(el).children('td:nth-child(3)').find('.m-tcol-c').text(),
    })).get();
  return articleList;
}
