"use strict";
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
const request_1 = __importDefault(require("./request"));
const x_ray_1 = __importDefault(require("x-ray"));
const xray = x_ray_1.default({
    filters: {
        number: val => parseInt(val.replace(/[\D^.]/g, '') || 0),
        lastClass: val => val.split(' ').pop(),
        date: val => new Date(val),
    },
});
class RawCrawler {
    constructor() {
        this.e_s_n_o = '';
    }
    weeklyActiveMajorGalleryIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            let callbackParam = `jQuery32109002533932178827_${new Date().getTime()}`;
            const res = yield request_1.default.get(`https://json2.dcinside.com/json0/gallmain/gallery_hot.php?jsoncallback=${callbackParam}&_=${new Date().getTime()}`, { headers: { Referer: 'https://gall.dcinside.com/' } });
            if (res.data == null || !res.data.startsWith(callbackParam))
                throw Error(`fail to parse ${res.data}`);
            return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1))
                .map((item) => ({
                id: item.id,
                isMiner: false,
                name: item.ko_name
            }));
        });
    }
    weeklyActiveMinorGalleryIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            let callbackParam = `json_mgall_hot`;
            const res = yield request_1.default.get(`https://json2.dcinside.com/json0/mgallmain/mgallery_hot.php?jsoncallback=${callbackParam}`, { headers: { Referer: 'https://gall.dcinside.com/m' } });
            if (res.data == null || !res.data.startsWith(callbackParam))
                throw Error(`fail to parse ${res.data}`);
            return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1))
                .map((item) => ({
                id: item.id,
                isMiner: true,
                name: item.ko_name
            }));
        });
    }
    realtimeActiveMinorGalleryIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            let callbackParam = `jQuery32107665147071438096_${new Date().getTime()}`;
            const res = yield request_1.default.get(`https://json2.dcinside.com/json1/mgallmain/mgallery_ranking.php?jsoncallback=${callbackParam}&_=${new Date().getTime()}`, { headers: { Referer: 'https://gall.dcinside.com/m' } });
            if (res.data == null || !res.data.startsWith(callbackParam))
                throw Error(`fail to parse ${res.data}`);
            return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1))
                .map((item) => ({
                id: item.id,
                isMiner: true,
                name: item.ko_name,
            }));
        });
    }
    realtimeActiveMajorGalleryIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            let callbackParam = `jQuery3210837750950307798_${new Date().getTime()}`;
            const res = yield request_1.default.get(`https://json2.dcinside.com/json1/ranking_gallery.php?jsoncallback=${callbackParam}&_=${new Date().getTime()}`, { headers: { Referer: 'https://gall.dcinside.com/' } });
            if (res.data == null || !res.data.startsWith(callbackParam))
                throw Error(`fail to parse ${res.data}`);
            return JSON.parse(res.data.trim().slice(callbackParam.length + 1, -1))
                .map((item) => ({
                id: item.id,
                isMiner: false,
                name: item.ko_name,
            }));
        });
    }
    documentHeaders(gallery, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield request_1.default.get(`https://gall.dcinside.com${gallery.isMiner ? '/mgallery' : '/'}board/lists?id=${gallery.id}&list_num=100&page=${page}`);
            if (!this.e_s_n_o)
                this.e_s_n_o = yield xray(res.data, 'input#e_s_n_o@value');
            const rows = yield xray(res.data, 'table.gall_list tbody tr.us-post', [
                {
                    id: '.gall_num | number',
                    title: '.gall_tit a',
                    class: '.gall_tit a em@class | lastClass',
                    commentCount: '.gall_tit a.reply_numbox .reply_num | number',
                    authorName: '.gall_writer@data-nick',
                    authorIp: '.gall_writer@data-ip',
                    authorId: '.gall_writer@data-uid',
                    createdAt: '.gall_date@title | date',
                    viewCount: '.gall_count | number',
                    likeCount: '.gall_recommend | number',
                },
            ]);
            for (const row of rows) {
                row.hasImage = row.class.endsWith('pic') || row.class.endsWith('img');
                row.hasVideo = row.class.endsWith('movie');
                row.isRecommend = row.class.startsWith('icon_recom');
                row.gallery = gallery;
                row.author = row.authorId
                    ? { nickname: row.authorName, id: row.authorId }
                    : { nickname: row.authorName, ip: row.authorIp };
            }
            return rows;
        });
    }
    comments(doc, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const res = yield request_1.default(option);
            let lastComment = null;
            const comments = res.data.comments
                .filter((comm) => comm.no)
                .map((comm) => {
                let comment = {
                    author: comm.user_id
                        ? { id: comm.user_id, nickname: comm.name }
                        : { ip: comm.ip, nickname: comm.name },
                    id: parseInt(comm.no),
                    parent: comm.depth !== 0 ? lastComment : undefined,
                    createdAt: new Date(comm.reg_date),
                    document: doc,
                };
                if (comm.depth === 0)
                    lastComment = comment;
                if (comm.memo.startsWith('<img')) {
                    comment = Object.assign(comment, {
                        dccon: {
                            imageUrl: comm.memo.match(/src=['"]([^"']*)['"]/)[1],
                            name: comm.memo.match(/title=['"]([^"']*)['"]/)[1],
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
            const pageCount = parseInt(Array.from(res.data.pagination.matchAll(/\d+/g), (r) => r[0]).pop());
            return { comments, pageCount };
        });
    }
}
class Crawler {
    constructor() {
        this.rawCrawler = new RawCrawler();
    }
    documentHeaders(_options) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign({ page: 1, limit: _options.lastDocumentId !== undefined ? Infinity : 100 }, _options);
            const { gallery, lastDocumentId, page, limit } = options;
            const headers = yield this.rawCrawler.documentHeaders(gallery, page);
            const pageCount = lastDocumentId !== undefined
                ? Math.ceil((headers[0].id - lastDocumentId) / 100)
                : Math.ceil(limit / 100);
            return [headers]
                .concat(yield Promise.all([...Array(pageCount - 1).keys()].map(i => this.rawCrawler.documentHeaders(gallery, page + i + 1))))
                .flat()
                .filter(header => header.id > (lastDocumentId || 0))
                .slice(0, limit);
        });
    }
    comments(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { document, lastCommentId = 0 } = options;
            let { comments, pageCount } = yield this.rawCrawler.comments(document, 1);
            comments = [comments]
                .concat(yield Promise.all([...Array(pageCount - 1).keys()].map(i => this.rawCrawler.comments(document, i + 1).then(res => res.comments))))
                .flat();
            let lastComment = null;
            for (const comm of comments) {
                if (comm.parent === undefined)
                    lastComment = comm;
                else if (comm.parent === null)
                    comm.parent = lastComment;
            }
            return comments.filter(comm => comm.id > lastCommentId);
        });
    }
    activeGalleryIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            let reses = yield Promise.all([
                this.rawCrawler.realtimeActiveMajorGalleryIndexes(),
                this.rawCrawler.realtimeActiveMinorGalleryIndexes(),
                this.rawCrawler.weeklyActiveMajorGalleryIndexes(),
                this.rawCrawler.weeklyActiveMinorGalleryIndexes()
            ]);
            let galleryById = {};
            for (let res of reses)
                for (let gallery of res)
                    galleryById[gallery.id] = gallery;
            return Object.values(galleryById);
        });
    }
}
exports.default = Crawler;
//# sourceMappingURL=index.js.map