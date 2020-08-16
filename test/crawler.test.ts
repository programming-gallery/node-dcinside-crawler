jest.setTimeout(300000);
import 'core-js';
import { Crawler, Document } from '../src/index';
describe('document headers', () => {
  const crawler = new Crawler(100, 10);
  const slowCrawler = new Crawler(1, 10);
  it('gallery documentHeader with comments', async () => {
    let iter = await crawler.documentHeaderWithCommentAsyncIterator({
      gallery: {id: 'zkdhfn', isMiner: true},
      //limit: 1000,
      lastDocumentId: 7325 - 1000,
    });
    let res = [];
    let i = 0;
    for await (const doc of iter) {
      if(++i % 10 == 0) 
        console.log(i);
      res.push(doc);
    }
    console.log(res.length);
  })
  /*
  it('type check', async() => {
    const res = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
    });
    expect(res[0].createdAt instanceof Date).toBe(true);
    expect(typeof(res[0].id)).toBe('number');
    expect(typeof(res[0].commentCount)).toBe('number');
    expect(typeof(res[0].hasImage)).toBe('boolean');
    expect(res[0].author.id || res[0].author.ip).not.toEqual(null);
  });
  it('timezone check', async() => {
    const res = await crawler.documentHeaders({
      gallery: {id: 'baseball_new9', isMiner: false},
    });
    expect(Math.abs(new Date().getTime() - res[0].createdAt.getTime())).toBeLessThanOrEqual(3*60*60*1000);
  });
  it('minor gallery first page', async () => {
    const res = await crawler.documentHeaders({
      gallery: {id: 'aoegame', isMiner: true },
    });
    expect(res.length).toBe(100);
  })
  it('first page', async () => {
    const res = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
    });
    expect(res.length).toBe(100);
  });
  it('second page', async () => {
    const res2 = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 2,
    });
    const res1 = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
    });
    expect(res2.length).toBe(100);
    expect(res1[0].id).toBeGreaterThanOrEqual(res2[0].id + 100);
  });
  it('limit', async () => {
    const res = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      limit: 250,
    });
    expect(res.length).toBe(250);
    const last = res.pop()!;
    expect(res[0].id).toBeGreaterThanOrEqual(last.id + 250);
    expect(res[0].id).toBeLessThanOrEqual(last.id + 300);
  });
  it('slow crawling limit', async () => {
    let now = new Date().getTime();
    const res = await slowCrawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      limit: 250,
    });
    expect(res.length).toBe(250);
    const last = res.pop()!;
    expect(res[0].id).toBeGreaterThanOrEqual(last.id + 250);
    expect(res[0].id).toBeLessThanOrEqual(last.id + 300);
    let now2 = new Date().getTime();
    expect(now2 - now).toBeGreaterThanOrEqual(1000);
  });
  it('limit with page', async () => {
    const res2 = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 3,
      limit: 110,
    });
    const res1 = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 2,
      limit: 110,
    });
    expect(res2.length).toBe(110);
    expect(res1.length).toBe(110);
    expect(res1[0].id).toBeGreaterThanOrEqual(res2[0].id + 100);
  });
  it('last document id', async () => {
    const res = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 2,
      limit: 1,
    });
    const res1 = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 1,
      lastDocumentId: res[0].id,
    });
    expect(res1.length).toBeGreaterThanOrEqual(100);
    expect(res1.length).toBeLessThanOrEqual(120);
    expect(res1[res1.length-1].id).toBeGreaterThanOrEqual(res[0].id);
  })
  it('last document created time', async () => {
    const res = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 2,
      limit: 1,
    });
    const res1 = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 1,
      lastDocumentCreatedAt: res[0].createdAt,
    });
    expect(res1.length).toBeGreaterThanOrEqual(100);
    expect(res1.length).toBeLessThanOrEqual(120);
    expect(res1[res1.length-1].createdAt.getTime()).toBeGreaterThanOrEqual(res[0].createdAt.getTime());
  })
  it('crawl filter combination', async () => {
    const res = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 2,
      limit: 100,
    });
    const res1 = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 1,
      lastDocumentCreatedAt: res[99].createdAt,
      lastDocumentId: res[0].id,
      limit: 150,
    });
    const res2 = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 1,
      lastDocumentCreatedAt: res[0].createdAt,
      lastDocumentId: res[99].id,
      limit: 150,
    });
    const res3 = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
      page: 1,
      lastDocumentCreatedAt: res[99].createdAt,
      lastDocumentId: res[99].id,
      limit: 50,
    });
    expect(res1.length).toBeGreaterThanOrEqual(100);
    expect(res1.length).toBeLessThanOrEqual(110);
    expect(res2.length).toBeGreaterThanOrEqual(100);
    expect(res2.length).toBeLessThanOrEqual(110);
    expect(res3.length).toBe(50);
  })
  it('comments', async () => {
    const res = await crawler.comments({
      gallery: {id: 'event_voicere', isMiner: false},
      id: 2251593,
    });
    expect(res).not.toBe(null);
  });
  it('active gallries', async () => {
    const res = await crawler.activeGalleryIndexes();
    expect(res).not.toBe(null);
  });
  */
});
