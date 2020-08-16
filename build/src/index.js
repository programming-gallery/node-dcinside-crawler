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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = void 0;
const Request = __importStar(require("./request"));
const x_ray_1 = __importDefault(require("x-ray"));
const entities = __importStar(require("entities"));
const util_1 = require("./util");
const koreaDateParse = (val) => {
    let date = new Date(val);
    return new Date(date.getTime() + (date.getTimezoneOffset() + 540) * 60 * 1000);
};
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
                row.createdAt = koreaDateParse(row.createdAt);
            }
            return rows;
        });
    }
    document(index) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.request.get(`${this.host}/${index.gallery.isMiner ? 'mgallery/' : ''}board/view/?id=${index.gallery.id}&no=${index.id}`);
            for (let i = 0; !res.data; ++i) {
                res = yield this.request.get(`${this.host}/${index.gallery.isMiner ? 'mgallery/' : ''}board/view/?id=${index.gallery.id}&no=${index.id}`);
                console.log(index, i);
                if (i === 5)
                    throw Error("ip banned");
            }
            const doc = yield xray(res.data, 'div.view_content_wrap', {
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
            doc.isMobile = doc.isMobile ? true : false;
            if (doc.commentCount > 0)
                doc.comments = yield this.comments(index);
            else
                doc.comments = [];
            if (doc.subject)
                doc.subject = doc.subject.slice(1, -1);
            return doc;
        });
    }
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
                    createdAt: koreaDateParse(comm.reg_date),
                    document: doc,
                };
                if (comm.depth === 0)
                    lastComment = comment;
                if (comm.memo.startsWith('<img')) {
                    comment = Object.assign(comment, {
                        dccon: {
                            imageUrl: comm.memo.match(/src=['"]([^"']*)['"]/)[1],
                            name: (comm.memo.match(/title=['"]([^"']*)['"]/), [''])[1],
                            packageId: comm.memo.match(/no=([^&"/]*)/)[1],
                        },
                    });
                }
                else if (comm.vr_player) {
                    comment = Object.assign(comment, {
                        voiceCopyId: (comm.vr_player.match(/vr=([^&"/]*)/) ||
                            comm.vr_player.match(/url=['"]([^"']*)['"]/))[1],
                    });
                }
                else {
                    comment = Object.assign(comment, {
                        contents: comm.memo,
                    });
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
class Crawler {
    constructor(rps, retries, host) {
        this.rawCrawler = new RawCrawler(rps, retries, host);
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
                for (let i = 0; rows.length === 0; ++i) {
                    rows = yield this.rawCrawler.documentHeaders(gallery, page - 1);
                    console.log(gallery, page, i);
                    if (i === 5)
                        throw Error("ip ban");
                }
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
    document(index) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.rawCrawler.document(index);
        });
    }
    documentHeaderWithCommentAsyncIterator(options) {
        return __asyncGenerator(this, arguments, function* documentHeaderWithCommentAsyncIterator_1() {
            var e_1, _a;
            let headers = yield __await(this.documentHeaders(options));
            let i = 0;
            let documentPromises = headers.map((header) => __awaiter(this, void 0, void 0, function* () {
                let headerWithComments = Object.assign(header, {
                    comments: []
                });
                if (header.commentCount > 0) {
                    headerWithComments.comments = yield this.rawCrawler.comments(header);
                }
                return headerWithComments;
            }));
            try {
                for (var _b = __asyncValues(util_1.PromiseIterator(documentPromises)), _c; _c = yield __await(_b.next()), !_c.done;) {
                    const res = _c.value;
                    if (!res.success)
                        throw res.error;
                    else
                        yield yield __await(res.result);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
                }
                finally { if (e_1) throw e_1.error; }
            }
            return yield __await(void 0);
        });
    }
    robustDocumentAsyncIterator(options) {
        return __asyncGenerator(this, arguments, function* robustDocumentAsyncIterator_1() {
            var e_2, _a;
            let headers = yield __await(this.documentHeaders(options));
            let documentPromises = headers.map(header => this.rawCrawler.document(header).then(res => {
                res.hasImage = header.hasImage;
                res.hasVideo = header.hasVideo;
                return res;
            }).catch(err => {
                err.message = `Fail to fetch document: ${header.gallery.id}, ${header.gallery.isMiner ? '(minor)' : ''}, ${header.id}\n${err.message}`;
                throw err;
            }));
            try {
                for (var _b = __asyncValues(util_1.PromiseIterator(documentPromises)), _c; _c = yield __await(_b.next()), !_c.done;) {
                    const res = _c.value;
                    yield yield __await(res);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
                }
                finally { if (e_2) throw e_2.error; }
            }
            return yield __await(void 0);
        });
    }
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