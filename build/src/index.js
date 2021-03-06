"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = exports.RawCrawler = void 0;
const Request = __importStar(require("./request"));
const x_ray_1 = __importDefault(require("x-ray"));
const entities = __importStar(require("entities"));
const util_1 = require("./util");
/*const koreaDateParse = (val: string): Date => {
  let date: Date;
  let now = new Date();
  date = new Date(val);
  return new Date(date.getTime() + (date.getTimezoneOffset() + 540) * 60 * 1000);
}*/
const xray = x_ray_1.default({
    filters: {
        number: val => parseInt(val.replace(/[\D^.]/g, '') || 0),
        reduceWhitespace: val => val.split('\n').map((s) => s.trim()).filter((t) => t).join('\n'),
        //reduceWhitespace: val => val,//val.split('\n').map((s: string) => s.trim()).filter((t: string) => t).join('\n'),
        //htmlToText: val => val.replaceAll("<br\/?>", "\n").replaceAll("<\/?div>", "\n").replaceAll("<\/?p>", "\n").replaceAll("<[^>]*>", ""),
        htmlToText: val => entities.decodeHTML(val.replace(/<br\/?>/g, "\n").replace(/<\/?div[^>]*>/g, "\n").replace(/<\/?p[^>]*>/g, "\n").replace(/<[^>]*>/g, "")),
        lastClass: val => val.split(' ').pop(),
    },
});
class RawCrawler {
    constructor(rps, retries, host = 'https://gall.dcinside.com') {
        this.host = '';
        this.e_s_n_o = '';
        this.request = Request.create(rps, retries);
        this.host = host;
    }
    weeklyActiveMajorGalleryIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            const callbackParam = `jQuery32109002533932178827_${new Date().getTime()}`;
            const res = yield this.request.get(`https://json2.dcinside.com/json0/gallmain/gallery_hot.php?jsoncallback=${callbackParam}&_=${new Date().getTime()}`, { headers: { Referer: 'https://gall.dcinside.com/' } });
            if (!res.data || !res.data.startsWith(callbackParam))
                throw Error(`fail to parse ${res.data}`);
            return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1)).map((item) => ({
                id: item.id,
                isMiner: false,
                name: item.ko_name,
            }));
        });
    }
    weeklyActiveMinorGalleryIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            const callbackParam = 'json_mgall_hot';
            const res = yield this.request.get(`https://json2.dcinside.com/json0/mgallmain/mgallery_hot.php?jsoncallback=${callbackParam}`, { headers: { Referer: 'https://gall.dcinside.com/m' } });
            if (!res.data || !res.data.startsWith(callbackParam))
                throw Error(`fail to parse ${res.data}`);
            return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1)).map((item) => ({
                id: item.id,
                isMiner: true,
                name: item.ko_name,
            }));
        });
    }
    realtimeActiveMinorGalleryIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            const callbackParam = `jQuery32107665147071438096_${new Date().getTime()}`;
            const res = yield this.request.get(`https://json2.dcinside.com/json1/mgallmain/mgallery_ranking.php?jsoncallback=${callbackParam}&_=${new Date().getTime()}`, { headers: { Referer: 'https://gall.dcinside.com/m' } });
            if (!res.data || !res.data.startsWith(callbackParam))
                throw Error(`fail to parse ${res.data}`);
            return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1)).map((item) => ({
                id: item.id,
                isMiner: true,
                name: item.ko_name,
            }));
        });
    }
    realtimeActiveMajorGalleryIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            const callbackParam = `jQuery3210837750950307798_${new Date().getTime()}`;
            const res = yield this.request.get(`https://json2.dcinside.com/json1/ranking_gallery.php?jsoncallback=${callbackParam}&_=${new Date().getTime()}`, { headers: { Referer: 'https://gall.dcinside.com/' } });
            if (!res.data || !res.data.startsWith(callbackParam))
                throw Error(`fail to parse ${res.data}`);
            return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1)).map((item) => ({
                id: item.id,
                isMiner: false,
                name: item.ko_name,
            }));
        });
    }
    documentAlbumHeaders(gallery, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.request.get(`${this.host}${gallery.isMiner ? '/mgallery/' : '/'}board/lists?id=${gallery.id}&list_num=30&page=${page}&board_type=album`);
            if (!this.e_s_n_o)
                this.e_s_n_o = yield xray(res.data, 'input#e_s_n_o@value');
            let headRows = yield xray(res.data, 'table.gall_list tbody tr.album_head', [
                {
                    id: '@data-no | number',
                    title: '.gall_tit a',
                    subject: '.gall_subject',
                    class: '.gall_tit a em@class | lastClass',
                    commentCount: '.gall_comment | number',
                    author: {
                        nickname: '.gall_writer@data-nick',
                        ip: '.gall_writer@data-ip',
                        id: '.gall_writer@data-uid',
                    },
                    createdAt: '.gall_date',
                    viewCount: '.gall_count | number',
                    likeCount: '.gall_recommend | number',
                },
            ]);
            let bodyRows = yield xray(res.data, 'table.gall_list tbody tr.album_body', [
                {
                    contents: '.album_txtbox'
                },
            ]);
            let rows = headRows.map((row, i) => Object.assign(row, bodyRows[i])).filter((r) => r.id && r.insertedSubject === undefined);
            for (const row of rows) {
                row.hasImage = row.class.endsWith('pic') || row.class.endsWith('img');
                row.hasVideo = row.class.endsWith('movie');
                row.isRecommend = row.class.startsWith('icon_recom');
                delete row.class;
                row.gallery = gallery;
                row.createdAt = util_1.koreaDateParse(row.createdAt);
            }
            return rows;
        });
    }
    documentHeaders(gallery, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.request.get(`${this.host}${gallery.isMiner ? '/mgallery/' : '/'}board/lists?id=${gallery.id}&list_num=100&page=${page}`);
            if (!this.e_s_n_o)
                this.e_s_n_o = yield xray(res.data, 'input#e_s_n_o@value');
            let rows = yield xray(res.data, 'table.gall_list tbody tr.us-post', [
                {
                    id: '.gall_num | number',
                    title: '.gall_tit a',
                    insertedSubject: '.gall_subject b',
                    subject: '.gall_subject',
                    class: '.gall_tit a em@class | lastClass',
                    commentCount: '.gall_tit a.reply_numbox .reply_num | number',
                    author: {
                        nickname: '.gall_writer@data-nick',
                        ip: '.gall_writer@data-ip',
                        id: '.gall_writer@data-uid',
                    },
                    createdAt: '.gall_date@title',
                    viewCount: '.gall_count | number',
                    likeCount: '.gall_recommend | number',
                },
            ]);
            rows = rows.filter((r) => r.id && r.insertedSubject === undefined);
            for (const row of rows) {
                row.hasImage = row.class.endsWith('pic') || row.class.endsWith('img');
                row.hasVideo = row.class.endsWith('movie');
                row.isRecommend = row.class.startsWith('icon_recom');
                delete row.class;
                row.gallery = gallery;
                row.createdAt = util_1.koreaDateParse(row.createdAt);
            }
            return rows;
        });
    }
    documentBody(index) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.request.defaults.jar.getCookiesSync(`${this.host}`).length)
                yield this.documentHeaders(index.gallery, 1);
            let cookie = this.request.defaults.jar.getCookiesSync(`${this.host}`);
            let ci_t = cookie.find((c) => c.key === 'ci_c').value;
            const option = {
                method: 'post',
                url: `${this.host}/board/view/get`,
                data: {
                    id: index.gallery.id,
                    no: '' + index.id,
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
            };
            const res = yield this.request(option);
            if (res.data.result !== 'success')
                throw Error('fail to get document: ' + JSON.stringify(res.data));
            let d = res.data;
            return {
                contents: d.content.memo.replace(/<br\/?>/g, "\n").replace(/<\/?div[^>]*>/g, "\n").replace(/<\/?p[^>]*>/g, "\n").replace(/<[^>]*>/g, "").split('\n').map((s) => s.trim()).filter((t) => t).join('\n'),
                dislikeCount: parseInt(d.content.nonrecommend),
                staticLikeCount: parseInt(d.content.backup3_count),
                comments: parseInt(d.content.total_comment) == 0 ? [] : yield this.comments(index),
            };
        });
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
    comments(document) {
        return __awaiter(this, void 0, void 0, function* () {
            let { comments, pageCount } = yield this._comments(document, 1);
            if (pageCount === 1)
                return comments;
            comments = [comments]
                .concat(yield Promise.all([...Array(pageCount - 1).keys()].map(i => this._comments(document, i + 1).then(res => res.comments))))
                .flat();
            let lastComment = null;
            for (const comm of comments) {
                if (comm.parent === undefined)
                    lastComment = comm;
                else if (comm.parent === null)
                    comm.parent = lastComment;
            }
            return comments;
        });
    }
    _comments(doc, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const res = yield this.request(option);
            let lastComment = null;
            const comments = (res.data.comments || [])
                .filter((comm) => comm.no)
                .map((comm) => {
                let comment = {
                    author: comm.user_id
                        ? { id: comm.user_id, nickname: comm.name }
                        : { ip: comm.ip, nickname: comm.name },
                    id: parseInt(comm.no),
                    parent: comm.depth !== 0 ? lastComment : undefined,
                    createdAt: util_1.koreaDateParse(comm.reg_date),
                    document: doc,
                };
                if (comm.depth === 0)
                    lastComment = comment;
                if (comm.memo.startsWith('<img')) {
                    comment.dccon = {
                        imageUrl: comm.memo.match(/src=['"]([^"']*)['"]/)[1],
                        name: (comm.memo.match(/title=['"]([^"']*)['"]/), [''])[1],
                        packageId: comm.memo.match(/no=([^&"/]*)/)[1],
                    };
                }
                else if (comm.vr_player) {
                    comment.voiceCopyId = (comm.vr_player.match(/vr=([^&"/]*)/) ||
                        comm.vr_player.match(/url=['"]([^"']*)['"]/))[1];
                }
                else {
                    comment.contents = comm.memo;
                }
                return comment;
            })
                .reverse();
            if (res.data.pagination) {
                const pageCount = parseInt(Array.from(res.data.pagination.matchAll(/\d+/g), (r) => r[0]).pop());
                return { comments, pageCount };
            }
            else {
                return { comments: [], pageCount: 1 };
            }
        });
    }
}
exports.RawCrawler = RawCrawler;
class Crawler {
    constructor(rps, retries, host) {
        this.rawCrawler = new RawCrawler(rps, retries, host);
    }
    documentAlbumHeaders(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let { gallery, page = 1, limit = options.limit === undefined && options.lastDocumentId !== undefined || options.lastDocumentCreatedAt !== undefined ?
                Infinity : 100, lastDocumentCreatedAt = new Date(0), lastDocumentId = 0, } = options;
            let res = yield this.rawCrawler.documentAlbumHeaders(gallery, page++);
            let lastDocument = res[res.length - 1];
            while (lastDocument.createdAt > lastDocumentCreatedAt &&
                lastDocument.id > lastDocumentId &&
                res.length < limit) {
                let rows = yield this.rawCrawler.documentAlbumHeaders(gallery, page++);
                if (rows.length === 0)
                    break;
                if (rows[rows.length - 1].id === lastDocument.id)
                    break;
                if (rows[0].id >= lastDocument.id)
                    rows.splice(0, rows.findIndex(r => r.id === lastDocument.id));
                res.push(...rows);
                lastDocument = res[res.length - 1];
            }
            return res
                .filter(row => row.createdAt > lastDocumentCreatedAt &&
                row.id > lastDocumentId)
                .slice(0, limit);
        });
    }
    documentHeaders(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let { gallery, page = 1, limit = options.limit === undefined && options.lastDocumentId !== undefined || options.lastDocumentCreatedAt !== undefined ?
                Infinity : 100, lastDocumentCreatedAt = new Date(0), lastDocumentId = 0, } = options;
            let res = yield this.rawCrawler.documentHeaders(gallery, page++);
            let lastDocument = res[res.length - 1];
            while (lastDocument.createdAt > lastDocumentCreatedAt &&
                lastDocument.id > lastDocumentId &&
                res.length < limit) {
                let rows = yield this.rawCrawler.documentHeaders(gallery, page++);
                if (rows.length === 0)
                    break;
                if (rows[rows.length - 1].id === lastDocument.id)
                    break;
                if (rows[0].id >= lastDocument.id)
                    rows.splice(0, rows.findIndex(r => r.id === lastDocument.id));
                res.push(...rows);
                lastDocument = res[res.length - 1];
            }
            return res
                .filter(row => row.createdAt > lastDocumentCreatedAt &&
                row.id > lastDocumentId)
                .slice(0, limit);
        });
    }
    documentBody(index) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.rawCrawler.documentBody(index);
        });
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
    comments(index) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.rawCrawler.comments(index);
        });
    }
    activeGalleryIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            const reses = yield Promise.all([
                this.rawCrawler.realtimeActiveMajorGalleryIndexes(),
                this.rawCrawler.realtimeActiveMinorGalleryIndexes(),
                this.rawCrawler.weeklyActiveMajorGalleryIndexes(),
                this.rawCrawler.weeklyActiveMinorGalleryIndexes(),
            ]);
            const galleryById = {};
            for (const res of reses)
                for (const gallery of res)
                    galleryById[gallery.id] = gallery;
            return Object.values(galleryById);
        });
    }
}
exports.Crawler = Crawler;
//# sourceMappingURL=index.js.map