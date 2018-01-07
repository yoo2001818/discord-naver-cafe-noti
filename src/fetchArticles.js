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
  console.log(body);
}
