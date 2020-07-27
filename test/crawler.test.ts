import 'core-js';
import Crawler from '../src/index';
describe('document headers', () => {
  const crawler = new Crawler();
  it('type check', async() => {
    const res = await crawler.documentHeaders({
      gallery: {id: 'programming', isMiner: false},
    });
    expect(res[0].createdAt instanceof Date).toBe(true);
    expect(typeof(res[0].id)).toBe('number');
    expect(typeof(res[0].commentCount)).toBe('number');
    expect(typeof(res[0].hasImage)).toBe('boolean');
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
  it('comments', async () => {
    const res = await crawler.comments({
      document: {
        gallery: {id: 'event_voicere', isMiner: false},
        id: 2251593,
      },
    });
    expect(res).not.toBe(null);
  });
  it('active gallries', async () => {
    const res = await crawler.activeGalleryIndexes();
    expect(res).not.toBe(null);
  });
});
