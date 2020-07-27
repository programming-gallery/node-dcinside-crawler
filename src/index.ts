import request from './request';
import Xray from 'x-ray';

const koreaDateParse = (val: string): Date => {
 let date = new Date(val);
 return new Date(date.getTime() + (date.getTimezoneOffset() + 540) * 60 * 1000);
}

const xray = Xray({
  filters: {
    number: val => parseInt(val.replace(/[\D^.]/g, '') || 0),
    lastClass: val => val.split(' ').pop(),
  },
});

/*
export class Document {
  id: string;
  contents: string | undefined = undefined;
  imageUrls: string[] = [];
  html: string;
  title: string;
  author: User;
  comments: Comment[] = [];
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
}
*/

export interface User {
  nickname: string;
}
/**
 * 고닉
 */
export interface StaticUser extends User {
  id: string;
}
/**
 * 유동
 */
export interface DynamicUser extends User {
  ip: string;
}

export interface Comment {
  id: number;
  author: User;
  parent?: Comment | null;
  createdAt: Date;
  document: DocumentIndex;
}
export interface TextComment extends Comment {
  contents: string;
}
export interface VoiceComment extends Comment {
  voiceCopyId: string;
}
export interface Dccon {
  imageUrl: string;
  name: string;
  packageId: string;
}
export interface DcconComment extends Comment {
  dccon: Dccon;
}

/**
 * Document header fetched from gallery board
 */
export interface DocumentHeader {
  gallery: GalleryIndex;
  id: number;
  title: string;
  author: User;
  commentCount: number;
  likeCount: number;
  hasImage: boolean;
  hasVideo: boolean;
  isRecommend: boolean;
  createdAt: Date;
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
  manager: StaticUser;
  /**
   * SubManager users of this gallery
   */
  subManagers: StaticUser[];
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
  e_s_n_o = '';
  async weeklyActiveMajorGalleryIndexes(): Promise<GalleryIndex[]> {
    const callbackParam = `jQuery32109002533932178827_${new Date().getTime()}`;
    const res = await request.get(
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
    const res = await request.get(
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
    const res = await request.get(
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
    const res = await request.get(
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
  async documentHeaders(
    gallery: GalleryIndex,
    page: number
  ): Promise<DocumentHeader[]> {
    const res = await request.get(
      `https://gall.dcinside.com${
        gallery.isMiner ? '/mgallery' : '/'
      }board/lists?id=${gallery.id}&list_num=100&page=${page}`
    );
    if (!this.e_s_n_o)
      this.e_s_n_o = await xray(res.data, 'input#e_s_n_o@value');
    const rows = await xray(res.data, 'table.gall_list tbody tr.us-post', [
      {
        id: '.gall_num | number',
        title: '.gall_tit a',
        class: '.gall_tit a em@class | lastClass',
        commentCount: '.gall_tit a.reply_numbox .reply_num | number',
        authorName: '.gall_writer@data-nick',
        authorIp: '.gall_writer@data-ip',
        authorId: '.gall_writer@data-uid',
        createdAt: '.gall_date@title',
        viewCount: '.gall_count | number',
        likeCount: '.gall_recommend | number',
      },
    ]);
    for (const row of rows) {
      row.hasImage = row.class.endsWith('pic') || row.class.endsWith('img');
      row.hasVideo = row.class.endsWith('movie');
      row.isRecommend = row.class.startsWith('icon_recom');
      row.gallery = gallery;
      row.createdAt = koreaDateParse(row.createdAt);
      row.author = row.authorId
        ? ({nickname: row.authorName, id: row.authorId} as StaticUser)
        : ({nickname: row.authorName, ip: row.authorIp} as DynamicUser);
    }
    return rows as DocumentHeader[];
  }
  async comments(
    doc: DocumentIndex,
    page = 1
  ): Promise<{comments: Comment[]; pageCount: number}> {
    const option = {
      method: 'post',
      url: 'https://gall.dcinside.com/board/comment',
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
    const res = await request(option);
    let lastComment: Comment | null = null;
    const comments = res.data.comments
      .filter((comm: any) => comm.no)
      .map((comm: any) => {
        let comment: Comment = {
          author: comm.user_id
            ? ({id: comm.user_id, nickname: comm.name} as StaticUser)
            : ({ip: comm.ip, nickname: comm.name} as DynamicUser),
          id: parseInt(comm.no),
          parent: comm.depth !== 0 ? lastComment : undefined,
          createdAt: koreaDateParse(comm.reg_date),
          document: doc,
        };
        if (comm.depth === 0) lastComment = comment;
        if (comm.memo.startsWith('<img')) {
          comment = Object.assign(comment, {
            dccon: {
              imageUrl: comm.memo.match(/src=['"]([^"']*)['"]/)[1] as string,
              name: comm.memo.match(/title=['"]([^"']*)['"]/)[1] as string,
              packageId: comm.memo.match(/no=([^&"/]*)/)[1] as string,
            },
          }) as DcconComment;
        } else if (comm.vr_player) {
          comment = Object.assign(comment, {
            voiceCopyId: (comm.vr_player.match(/vr=([^&"/]*)/) ||
              comm.vr_player.match(/url=['"]([^"']*)['"]/))[1] as string,
          }) as VoiceComment;
        } else {
          comment = Object.assign(comment, {
            contents: comm.memo as string,
          }) as TextComment;
        }
        return comment;
      })
      .reverse();
    const pageCount = parseInt(
      Array.from(res.data.pagination.matchAll(/\d+/g), (r: any) => r[0]).pop()
    );
    return {comments, pageCount};
  }
}

export interface CrawlerDocumentHeaderOptions {
  gallery: GalleryIndex;
  lastDocumentId?: number;
  page?: number;
  limit?: number;
}
export interface CrawlerCommentsOptions {
  document: DocumentIndex;
  lastCommentId?: number;
}
export default class Crawler {
  rawCrawler: RawCrawler = new RawCrawler();
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
  }
  async comments(options: CrawlerCommentsOptions): Promise<Comment[]> {
    const {document, lastCommentId = 0} = options;
    let {comments, pageCount} = await this.rawCrawler.comments(document, 1);
    comments = [comments]
      .concat(
        await Promise.all(
          [...Array(pageCount - 1).keys()].map(i =>
            this.rawCrawler.comments(document, i + 1).then(res => res.comments)
          )
        )
      )
      .flat();
    let lastComment: Comment | null = null;
    for (const comm of comments) {
      if (comm.parent === undefined) lastComment = comm;
      else if (comm.parent === null) comm.parent = lastComment;
    }
    return comments.filter(comm => comm.id > lastCommentId);
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
