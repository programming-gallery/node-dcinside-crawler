import * as Request from './request';
import Xray from 'x-ray';
import * as entities from 'entities';
import { PromiseIterator, koreaDateParse } from './util';


/*const koreaDateParse = (val: string): Date => {
  let date: Date;
  let now = new Date();
  date = new Date(val);
  return new Date(date.getTime() + (date.getTimezoneOffset() + 540) * 60 * 1000);
}*/

const xray = Xray({
  filters: {
    number: val => parseInt(val.replace(/[\D^.]/g, '') || 0),
    reduceWhitespace: val => val.split('\n').map((s: string) => s.trim()).filter((t: string) => t).join('\n'),
    //reduceWhitespace: val => val,//val.split('\n').map((s: string) => s.trim()).filter((t: string) => t).join('\n'),
    //htmlToText: val => val.replaceAll("<br\/?>", "\n").replaceAll("<\/?div>", "\n").replaceAll("<\/?p>", "\n").replaceAll("<[^>]*>", ""),
    htmlToText: val => entities.decodeHTML(val.replace(/<br\/?>/g, "\n").replace(/<\/?div[^>]*>/g, "\n").replace(/<\/?p[^>]*>/g, "\n").replace(/<[^>]*>/g, "")),
    lastClass: val => val.split(' ').pop(),
  },
});


export interface User {
  id?: string;
  nickname: string;
  ip?: string;
}

export interface Comment {
  id: number;
  author: User;
  parent?: Comment | null;
  createdAt: Date;
  document: DocumentIndex;
  contents?: string;
  voiceCopyId?: string;
  dccon?: {
    imageUrl: string,
    name?: string,
    packageId: string,
  }
}
/*
export interface TextComment extends Comment {
  contents: string;
}
export interface VoiceComment extends Comment {
}
export interface Dccon {
}
export interface DcconComment extends Comment {
  dccon: Dccon;
}
*/

/**
 * Document header fetched from gallery board
 */
export interface DocumentHeader {
  gallery: GalleryIndex;
  id: number;
  title: string;
  subject: string | undefined;
  author: User;
  commentCount: number;
  likeCount: number;
  viewCount: number;
  hasImage: boolean;
  hasVideo: boolean;
  isRecommend: boolean;
  createdAt: Date;
}
export interface DocumentBody {
  contents: string;
  dislikeCount: number;
  staticLikeCount: number;
  comments: Comment[];
}
export interface Document extends DocumentHeader {
  contents: string;
  isMobile: boolean;
  staticLikeCount: number;
  subject: string | undefined;
  comments: Comment[];
}
export interface Gallery {
  /**
   * Gallery id, represented as URL like `https://gall.dcinside.com/board/view/?id=*THIS_VALUE*`
   */
  id: string;
  /**
   * True if this is a miner gallery
   */
  isMiner: boolean;
  /**
   * Name of the gallery
   */
  name: string;
  /**
   * A manager user of this gallery
   */
  manager: User;
  /**
   * SubManager users of this gallery
   */
  subManagers: User[];
}
/**
 * Minimum Document information to fetch related data from dcinside
 */
export type DocumentIndex = Pick<DocumentHeader, 'id' | 'gallery'> &
  Partial<DocumentHeader>;
/**
 * Minimum Gallery information to fetch related data from dcinside
 */
export type GalleryIndex = Pick<Gallery, 'id' | 'isMiner'> & Partial<Gallery>;

class RawCrawler {
  host = '';
  e_s_n_o = '';
  request: any;
  constructor(rps?: number, retries?: number, host: string = 'https://gall.dcinside.com') {
    this.request = Request.create(rps, retries);
    this.host = host;
  }
  async weeklyActiveMajorGalleryIndexes(): Promise<GalleryIndex[]> {
    const callbackParam = `jQuery32109002533932178827_${new Date().getTime()}`;
    const res = await this.request.get(
      `https://json2.dcinside.com/json0/gallmain/gallery_hot.php?jsoncallback=${callbackParam}&_=${new Date().getTime()}`,
      {headers: {Referer: 'https://gall.dcinside.com/'}}
    );
    if (!res.data || !res.data.startsWith(callbackParam))
      throw Error(`fail to parse ${res.data}`);
    return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1)).map(
      (item: any) =>
        ({
          id: item.id,
          isMiner: false,
          name: item.ko_name,
        } as GalleryIndex)
    );
  }
  async weeklyActiveMinorGalleryIndexes(): Promise<GalleryIndex[]> {
    const callbackParam = 'json_mgall_hot';
    const res = await this.request.get(
      `https://json2.dcinside.com/json0/mgallmain/mgallery_hot.php?jsoncallback=${callbackParam}`,
      {headers: {Referer: 'https://gall.dcinside.com/m'}}
    );
    if (!res.data || !res.data.startsWith(callbackParam))
      throw Error(`fail to parse ${res.data}`);
    return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1)).map(
      (item: any) =>
        ({
          id: item.id,
          isMiner: true,
          name: item.ko_name,
        } as GalleryIndex)
    );
  }
  async realtimeActiveMinorGalleryIndexes(): Promise<GalleryIndex[]> {
    const callbackParam = `jQuery32107665147071438096_${new Date().getTime()}`;
    const res = await this.request.get(
      `https://json2.dcinside.com/json1/mgallmain/mgallery_ranking.php?jsoncallback=${callbackParam}&_=${new Date().getTime()}`,
      {headers: {Referer: 'https://gall.dcinside.com/m'}}
    );
    if (!res.data || !res.data.startsWith(callbackParam))
      throw Error(`fail to parse ${res.data}`);
    return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1)).map(
      (item: any) =>
        ({
          id: item.id,
          isMiner: true,
          name: item.ko_name,
        } as GalleryIndex)
    );
  }
  async realtimeActiveMajorGalleryIndexes(): Promise<GalleryIndex[]> {
    const callbackParam = `jQuery3210837750950307798_${new Date().getTime()}`;
    const res = await this.request.get(
      `https://json2.dcinside.com/json1/ranking_gallery.php?jsoncallback=${callbackParam}&_=${new Date().getTime()}`,
      {headers: {Referer: 'https://gall.dcinside.com/'}}
    );
    if (!res.data || !res.data.startsWith(callbackParam))
      throw Error(`fail to parse ${res.data}`);
    return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1)).map(
      (item: any) =>
        ({
          id: item.id,
          isMiner: false,
          name: item.ko_name,
        } as GalleryIndex)
    );
  }
  async documentAlbumHeaders(
    gallery: GalleryIndex,
    page: number,
  ): Promise<DocumentHeader[]> {
    const res = await this.request.get(
      `${this.host}${
        gallery.isMiner ? '/mgallery/' : '/'
      }board/lists?id=${gallery.id}&list_num=30&page=${page}&board_type=album`
    );
    if (!this.e_s_n_o)
      this.e_s_n_o = await xray(res.data, 'input#e_s_n_o@value');
    let headRows = await xray(res.data, 'table.gall_list tbody tr.album_head', [
      {
        id: '@data-no | number',
        title: '.gall_tit a',
        subject: '.gall_subject',
        class: '.gall_tit a em@class | lastClass',
        commentCount: '.gall_comment | number',
        author: {
          nickname:'.gall_writer@data-nick',
          ip: '.gall_writer@data-ip',
          id: '.gall_writer@data-uid',
        },
        createdAt: '.gall_date',
        viewCount: '.gall_count | number',
        likeCount: '.gall_recommend | number',
      },
    ]);
    let bodyRows = await xray(res.data, 'table.gall_list tbody tr.album_body', [
      {
        contents: '.album_txtbox' 
      },
    ])
    let rows = headRows.map((row:any, i:number) => Object.assign(row, bodyRows[i])).filter((r:any) => r.id && r.insertedSubject === undefined);
    for (const row of rows) {
      row.hasImage = row.class.endsWith('pic') || row.class.endsWith('img');
      row.hasVideo = row.class.endsWith('movie');
      row.isRecommend = row.class.startsWith('icon_recom');
      delete row.class;
      row.gallery = gallery;
      row.createdAt = koreaDateParse(row.createdAt);
    }
    return rows as DocumentHeader[];
  }
  async documentHeaders(
    gallery: GalleryIndex,
    page: number,
  ): Promise<DocumentHeader[]> {
    const res = await this.request.get(
      `${this.host}${
        gallery.isMiner ? '/mgallery/' : '/'
      }board/lists?id=${gallery.id}&list_num=100&page=${page}`
    );
    if (!this.e_s_n_o)
      this.e_s_n_o = await xray(res.data, 'input#e_s_n_o@value');
    let rows = await xray(res.data, 'table.gall_list tbody tr.us-post', [
      {
        id: '.gall_num | number',
        title: '.gall_tit a',
        insertedSubject: '.gall_subject b',
        subject: '.gall_subject',
        class: '.gall_tit a em@class | lastClass',
        commentCount: '.gall_tit a.reply_numbox .reply_num | number',
        author: {
          nickname:'.gall_writer@data-nick',
          ip: '.gall_writer@data-ip',
          id: '.gall_writer@data-uid',
        },
        createdAt: '.gall_date@title',
        viewCount: '.gall_count | number',
        likeCount: '.gall_recommend | number',
      },
    ]);
    rows = rows.filter((r:any) => r.id && r.insertedSubject === undefined);
    for (const row of rows) {
      row.hasImage = row.class.endsWith('pic') || row.class.endsWith('img');
      row.hasVideo = row.class.endsWith('movie');
      row.isRecommend = row.class.startsWith('icon_recom');
      delete row.class;
      row.gallery = gallery;
      row.createdAt = koreaDateParse(row.createdAt);
    }
    return rows as DocumentHeader[];
  }
  async documentBody(index: DocumentIndex): Promise<DocumentBody> {
    if(!this.request.defaults.jar.getCookiesSync(`${this.host}`).length)
      await this.documentHeaders(index.gallery, 1);
    let cookie = this.request.defaults.jar.getCookiesSync(`${this.host}`);
    let ci_t = cookie.find((c: {key: string, value: string}) => c.key === 'ci_c').value
    const option = {
      method: 'post',
      url: `${this.host}/board/view/get`,
      data: {
        id: index.gallery.id,
        no: ''+index.id,
        e_s_n_o: this.e_s_n_o,
        ci_t,
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Referer: `https://gall.dcinside.com/board/lists?id=${index.gallery.id}&page=1&board_type=album`,
        Cookie: this.request.defaults.jar.getCookieStringSync(`${this.host}`),
        DNT: '1',
      },
    }
    const res = await this.request(option);
    if(res.data.result !== 'success')
      throw Error('fail to get document: ' + JSON.stringify(res.data));
    let d = res.data;
    
    return {
      contents: d.content.memo.replace(/<br\/?>/g, "\n").replace(/<\/?div[^>]*>/g, "\n").replace(/<\/?p[^>]*>/g, "\n").replace(/<[^>]*>/g, "").split('\n').map((s: string) => s.trim()).filter((t: string) => t).join('\n') as string,
      dislikeCount: parseInt(d.content.nonrecommend) as number,
      staticLikeCount: parseInt(d.content.backup3_count) as number,
      comments: parseInt(d.content.total_comment) == 0? []: await this.comments(index),
    } as DocumentBody;
  }
  /*
  async document(
    index: DocumentIndex,
  ): Promise<Document> {
    let res = await this.request.get(
      `${this.host}/${index.gallery.isMiner? 'mgallery/': ''}board/view/?id=${index.gallery.id}&no=${index.id}`
    );
    for(let i=0; !res.data; ++i){
      res = await this.request.get(
        `${this.host}/${index.gallery.isMiner? 'mgallery/': ''}board/view/?id=${index.gallery.id}&no=${index.id}`
      );
      console.log(index, i);
      if(i === 5)
        throw Error("ip banned");
    }
    const doc = await xray(res.data, 'div.view_content_wrap', {
      contents: '.writing_view_box@html | htmlToText | reduceWhitespace',
      isMobile: 'span.title_device',
      subject: 'span.title_headtext',
      author: {
        nickname: 'div.gall_writer@data-nick',
        ip: 'div.gall_writer@data-ip',
        id: 'div.gall_writer@data-uid',
      },
      createdAt: '.gall_date@title',
      viewCount: '.gall_count | number',
      commentCount: '.gall_comment | number',
      title: 'span.title_subject',
      //images: ['img@src'],
      likeCount: 'p.up_num | number',
      dislikeCount: 'p.down_num | number',
      staticLikeCount: 'p.sup_num | number',
    }); 
    //doc.images = doc.images.filter((src: string) => src.startsWith('https://dcimg'));
    doc.createdAt = koreaDateParse(doc.createdAt);
    doc.id = index.id;
    doc.gallery = index.gallery;
    doc.isMobile = doc.isMobile? true: false;
    if(doc.commentCount > 0)
      doc.comments = await this.comments(index);
    else
      doc.comments = [];
    if(doc.subject)
      doc.subject = doc.subject.slice(1, -1);
    return doc;
  }
  */
  async comments(
    document: DocumentIndex,
  ): Promise<Comment[]> {
    let {comments, pageCount} = await this._comments(document, 1);
    if(pageCount === 1)
      return comments;
    comments = [comments]
      .concat(
        await Promise.all(
          [...Array(pageCount - 1).keys()].map(i =>
            this._comments(document, i + 1).then(res => res.comments)
          )
        )
      )
      .flat();
    let lastComment: Comment | null = null;
    for (const comm of comments) {
      if (comm.parent === undefined) lastComment = comm;
      else if (comm.parent === null) comm.parent = lastComment;
    }
    return comments;
  }
  async _comments(
    doc: DocumentIndex,
    page = 1
  ): Promise<{comments: Comment[]; pageCount: number}> {
    const option = {
      method: 'post',
      url: `${this.host}/board/comment`,
      data: {
        id: doc.gallery.id,
        no: doc.id,
        cmt_id: doc.gallery.id,
        cmt_no: doc.id,
        e_s_n_o: this.e_s_n_o,
        comment_page: page,
        sort: page === 1 ? '' : 'D',
        prevCnt: 10,
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Referer: `https://gall.dcinside.com/board/view/?id=${doc.gallery.id}&no=${doc.id}&_rk=tDL&page=1`,
      },
    };
    const res = await this.request(option);
    let lastComment: Comment | null = null;
    const comments = (res.data.comments || [])
      .filter((comm: any) => comm.no)
      .map((comm: any) => {
        let comment: Comment = {
          author: comm.user_id
            ? ({id: comm.user_id, nickname: comm.name} as User)
            : ({ip: comm.ip, nickname: comm.name} as User),
          id: parseInt(comm.no),
          parent: comm.depth !== 0 ? lastComment : undefined,
          createdAt: koreaDateParse(comm.reg_date),
          document: doc,
        };
        if (comm.depth === 0) lastComment = comment;
        if (comm.memo.startsWith('<img')) {
          comment.dccon = {
            imageUrl: comm.memo.match(/src=['"]([^"']*)['"]/)[1] as string,
            name: (comm.memo.match(/title=['"]([^"']*)['"]/), [''])[1] as string,
            packageId: comm.memo.match(/no=([^&"/]*)/)[1] as string,
          };
        } else if (comm.vr_player) {
          comment.voiceCopyId = (comm.vr_player.match(/vr=([^&"/]*)/) ||
              comm.vr_player.match(/url=['"]([^"']*)['"]/))[1] as string;
        } else {
          comment.contents = comm.memo as string;
        }
        return comment;
      })
      .reverse();
    if(res.data.pagination){
      const pageCount = parseInt(
        Array.from(res.data.pagination.matchAll(/\d+/g), (r: any) => r[0]).pop()
      );
      return {comments, pageCount};
    } else {
      return {comments: [], pageCount: 1};
    }
  }
}

export interface CrawlerDocumentHeaderOptions {
  gallery: GalleryIndex;
  lastDocumentId?: number;
  lastDocumentCreatedAt?: Date;
  page?: number;
  limit?: number;
}
export interface CrawlerCommentsOptions {
  document: DocumentIndex;
  lastCommentId?: number;
}
export class Crawler {
  rawCrawler: RawCrawler;
  constructor(rps?: number, retries?: number, host?: string) {
    this.rawCrawler = new RawCrawler(rps, retries, host);
  }
  async documentAlbumHeaders(
    options: CrawlerDocumentHeaderOptions
  ): Promise<DocumentHeader[]> {
    let { 
      gallery,
      page = 1,
      limit = 
        options.limit === undefined && options.lastDocumentId !== undefined || options.lastDocumentCreatedAt !== undefined? 
        Infinity : 100,
      lastDocumentCreatedAt = new Date(0),
      lastDocumentId = 0,
    } = options;
    let res: DocumentHeader[] = await this.rawCrawler.documentAlbumHeaders(gallery, page++);
    let lastDocument = res[res.length-1];
    while(
      lastDocument.createdAt > lastDocumentCreatedAt && 
      lastDocument.id > lastDocumentId && 
      res.length < limit) {
      let rows = await this.rawCrawler.documentAlbumHeaders(gallery, page++);
      if(rows.length === 0)
        break;
      if(rows[rows.length-1].id  === lastDocument.id)
        break;
      if(rows[0].id >= lastDocument.id)
        rows.splice(0, rows.findIndex(r => r.id === lastDocument.id));
      res.push(...rows);
      lastDocument = res[res.length-1];
    }
    return res
      .filter(row => 
        row.createdAt > lastDocumentCreatedAt && 
        row.id > lastDocumentId)
      .slice(0, limit);
  }
  async documentHeaders(
    options: CrawlerDocumentHeaderOptions
  ): Promise<DocumentHeader[]> {
    let { 
      gallery,
      page = 1,
      limit = 
        options.limit === undefined && options.lastDocumentId !== undefined || options.lastDocumentCreatedAt !== undefined? 
        Infinity : 100,
      lastDocumentCreatedAt = new Date(0),
      lastDocumentId = 0,
    } = options;
    let res: DocumentHeader[] = await this.rawCrawler.documentHeaders(gallery, page++);
    let lastDocument = res[res.length-1];
    while(
      lastDocument.createdAt > lastDocumentCreatedAt && 
      lastDocument.id > lastDocumentId && 
      res.length < limit) {
      let rows = await this.rawCrawler.documentHeaders(gallery, page++);
      if(rows.length === 0)
        break;
      if(rows[rows.length-1].id  === lastDocument.id)
        break;
      if(rows[0].id >= lastDocument.id)
        rows.splice(0, rows.findIndex(r => r.id === lastDocument.id));
      res.push(...rows);
      lastDocument = res[res.length-1];
    }
    return res
      .filter(row => 
        row.createdAt > lastDocumentCreatedAt && 
        row.id > lastDocumentId)
      .slice(0, limit);
  }
  async documentBody(
    index: DocumentIndex
  ): Promise<DocumentBody> {
    return await this.rawCrawler.documentBody(index);
  }
  /*
  async *documentHeaderWithCommentAsyncIterator(options: CrawlerDocumentHeaderOptions): AsyncGenerator<DocumentHeader & { comments: Comment[] }> {
    let headers = await this.documentHeaders(options);
    let i=0;
    let documentPromises = headers.map(async (header) => { 
      let headerWithComments: DocumentHeader & { comments: Comment[] } = Object.assign(header, {
        comments: []
      });
      if(header.commentCount > 0){
        headerWithComments.comments = await this.rawCrawler.comments(header);
      }
      return headerWithComments;
    });
    for await (const res of PromiseIterator(documentPromises)) {
      if(!res.success)
        throw res.error;
      else
        yield res.result;
    }
    return;
  }
  async *robustDocumentAsyncIterator(options: CrawlerDocumentHeaderOptions): AsyncGenerator<{success: boolean, result?: Document, error?: any}> {
    let headers = await this.documentHeaders(options);
    let documentPromises = headers.map(header => this.rawCrawler.document(header).then(res => {
      res.hasImage = header.hasImage;
      res.hasVideo = header.hasVideo;
      return res;
    }).catch(err => {
      err.message = `Fail to fetch document: ${header.gallery.id}, ${header.gallery.isMiner? '(minor)': ''}, ${header.id}\n${err.message}`;
      throw err;
    }));
    for await (const res of PromiseIterator(documentPromises)) {
      yield res;
    }
    return;
  }
  */
  /*
  async documentHeaders(
    _options: CrawlerDocumentHeaderOptions
  ): Promise<DocumentHeader[]> {
    const options = Object.assign(
      {page: 1, limit: _options.lastDocumentId !== undefined ? Infinity : 100},
      _options
    );
    const {gallery, lastDocumentId, page, limit} = options;
    const headers = await this.rawCrawler.documentHeaders(gallery, page);
    const pageCount =
      lastDocumentId !== undefined
        ? Math.ceil((headers[0].id - lastDocumentId) / 100)
        : Math.ceil(limit / 100);
    return [headers]
      .concat(
        await Promise.all(
          [...Array(pageCount - 1).keys()].map(i =>
            this.rawCrawler.documentHeaders(gallery, page + i + 1)
          )
        )
      )
      .flat()
      .filter(header => header.id > (lastDocumentId || 0))
      .slice(0, limit);
  }*/
  async comments(index: DocumentIndex): Promise<Comment[]> {
    return await this.rawCrawler.comments(index);
  }
  async activeGalleryIndexes(): Promise<GalleryIndex[]> {
    const reses = await Promise.all([
      this.rawCrawler.realtimeActiveMajorGalleryIndexes(),
      this.rawCrawler.realtimeActiveMinorGalleryIndexes(),
      this.rawCrawler.weeklyActiveMajorGalleryIndexes(),
      this.rawCrawler.weeklyActiveMinorGalleryIndexes(),
    ]);
    const galleryById: {[id: string]: GalleryIndex} = {};
    for (const res of reses)
      for (const gallery of res) galleryById[gallery.id] = gallery;
    return Object.values(galleryById);
  }
}
